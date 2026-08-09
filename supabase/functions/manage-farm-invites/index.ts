import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply(405, { error: "Método não permitido" });

  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return reply(401, { error: "Faça login para continuar" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser(token);
  if (userError || !user?.email) return reply(401, { error: "Sessão inválida" });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const payload = await request.json().catch(() => ({}));

  if (payload.action === "create") {
    const name = String(payload.name ?? "").trim();
    const checklistTitle = String(payload.checklistTitle ?? "").trim();
    const description = String(payload.description ?? "").trim();
    if (name.length < 2 || name.length > 60) return reply(400, { error: "O nome da fazenda precisa ter entre 2 e 60 letras." });
    if (!checklistTitle || checklistTitle.length > 70) return reply(400, { error: "Digite um título válido para a checklist." });
    if (description.length > 280) return reply(400, { error: "A descrição pode ter no máximo 280 caracteres." });

    const displayName = String(user.user_metadata?.display_name ?? user.email.split("@")[0]).slice(0, 60);
    const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
    if (profileError) return reply(500, { error: "Não foi possível preparar sua conta para criar a fazenda." });

    const { count: farmCount, error: countError } = await admin
      .from("farms")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    if (countError) return reply(500, { error: "Não foi possível verificar suas fazendas." });
    if ((farmCount ?? 0) >= 3) return reply(400, { error: "Cada conta pode criar no máximo 3 fazendas." });

    const { data: farm, error: farmError } = await admin
      .from("farms")
      .insert({ owner_id: user.id, name, checklist_title: checklistTitle, description })
      .select("*")
      .single();
    if (farmError || !farm) return reply(500, { error: "Não foi possível criar a fazenda agora." });

    const { error: memberError } = await admin.from("farm_members").upsert({ farm_id: farm.id, user_id: user.id, role: "owner" });
    if (memberError) return reply(500, { error: "A fazenda foi criada, mas não foi possível finalizar o acesso." });
    return reply(200, { ok: true, farm });
  }

  if (payload.action === "delete") {
    const farmId = String(payload.farmId ?? "");
    const confirmationName = String(payload.confirmationName ?? "");
    if (!farmId || !confirmationName) return reply(400, { error: "Digite o nome da fazenda para confirmar." });

    const { data: farm, error: farmError } = await admin
      .from("farms")
      .select("id, name, owner_id")
      .eq("id", farmId)
      .maybeSingle();
    if (farmError || !farm) return reply(404, { error: "Essa fazenda não foi encontrada." });
    if (farm.owner_id !== user.id) return reply(403, { error: "Somente quem criou a fazenda pode excluí-la." });
    if (farm.name !== confirmationName) return reply(400, { error: "O nome digitado não é igual ao nome da fazenda." });

    const { error: deleteError } = await admin.from("farms").delete().eq("id", farmId);
    if (deleteError) return reply(500, { error: "Não foi possível excluir a fazenda agora." });
    return reply(200, { ok: true });
  }

  if (payload.action === "remove-member") {
    const farmId = String(payload.farmId ?? "");
    const memberUserId = String(payload.memberUserId ?? "");
    if (!farmId || !memberUserId) return reply(400, { error: "Escolha quem deseja remover." });
    if (memberUserId === user.id) return reply(400, { error: "O dono não pode remover a própria conta da fazenda." });

    const { data: farm, error: farmError } = await admin
      .from("farms")
      .select("id, owner_id")
      .eq("id", farmId)
      .maybeSingle();
    if (farmError || !farm) return reply(404, { error: "Essa fazenda não foi encontrada." });
    if (farm.owner_id !== user.id) return reply(403, { error: "Somente quem criou a fazenda pode remover integrantes." });

    const { data: member, error: memberError } = await admin
      .from("farm_members")
      .select("role")
      .eq("farm_id", farmId)
      .eq("user_id", memberUserId)
      .maybeSingle();
    if (memberError || !member) return reply(404, { error: "Essa pessoa não participa mais da fazenda." });
    if (member.role === "owner") return reply(400, { error: "O dono da fazenda não pode ser removido." });

    const { error: removeError } = await admin
      .from("farm_members")
      .delete()
      .eq("farm_id", farmId)
      .eq("user_id", memberUserId);
    if (removeError) return reply(500, { error: "Não foi possível remover essa pessoa agora." });
    return reply(200, { ok: true });
  }

  if (payload.action === "invite") {
    const farmId = String(payload.farmId ?? "");
    const email = String(payload.email ?? "").trim().toLowerCase();
    if (!farmId || !/^\S+@\S+\.\S+$/.test(email)) return reply(400, { error: "Digite um e-mail válido" });

    const { data: membership } = await admin
      .from("farm_members")
      .select("role")
      .eq("farm_id", farmId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (membership?.role !== "owner") return reply(403, { error: "Somente quem criou a fazenda pode convidar pessoas" });

    const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return reply(500, { error: "Não foi possível verificar a conta convidada" });
    const existingUser = usersPage.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (existingUser) {
      const { error: joinError } = await admin.from("farm_members").upsert({ farm_id: farmId, user_id: existingUser.id, role: "member" });
      if (joinError) return reply(500, { error: "Não foi possível adicionar essa pessoa à fazenda" });
      return reply(200, { ok: true, existing: true });
    }

    await admin.from("farm_invites").delete().eq("farm_id", farmId).eq("email", email).is("accepted_at", null);
    const { data: invite, error: inviteError } = await admin
      .from("farm_invites")
      .insert({ farm_id: farmId, email, invited_by: user.id })
      .select("token")
      .single();
    if (inviteError || !invite) return reply(500, { error: "Não foi possível preparar o convite" });

    const origin = request.headers.get("Origin") || "";
    const { error: emailError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/?invite=${invite.token}`,
    });
    if (emailError) {
      await admin.from("farm_invites").delete().eq("token", invite.token);
      return reply(400, { error: emailError.message.includes("already") ? "Esse e-mail já possui conta. Peça para a pessoa abrir o convite estando conectada." : emailError.message });
    }
    return reply(200, { ok: true });
  }

  if (payload.action === "accept") {
    const inviteToken = String(payload.token ?? "");
    const { data: invite } = await admin
      .from("farm_invites")
      .select("farm_id, email, expires_at, accepted_at")
      .eq("token", inviteToken)
      .maybeSingle();
    if (!invite || invite.accepted_at || new Date(invite.expires_at).getTime() < Date.now() || invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return reply(400, { error: "Este convite não é válido para a sua conta" });
    }
    const { error: joinError } = await admin.from("farm_members").upsert({ farm_id: invite.farm_id, user_id: user.id, role: "member" });
    if (joinError) return reply(500, { error: "Não foi possível entrar na fazenda" });
    await admin.from("farm_invites").update({ accepted_at: new Date().toISOString() }).eq("token", inviteToken);
    return reply(200, { ok: true, farmId: invite.farm_id });
  }

  return reply(400, { error: "Ação inválida" });
});
