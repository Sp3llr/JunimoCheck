const createTable = "CREATE TABLE IF NOT EXISTS bundle_progress (item_id TEXT PRIMARY KEY, completed INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  await env.DB.prepare(createTable).run();
  return env.DB;
}

export async function GET() {
  try {
    const db = await database();
    const result = await db.prepare("SELECT item_id FROM bundle_progress WHERE completed = 1").all<{ item_id: string }>();
    return Response.json({ completed: result.results.map((row) => row.item_id) }, { headers: { "cache-control": "no-store" } });
  } catch { return Response.json({ error: "Não foi possível carregar a checklist." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const { id, completed } = await request.json() as { id?: string; completed?: boolean };
    if (!id || typeof completed !== "boolean" || !/^[a-z0-9-]+$/.test(id)) return Response.json({ error: "Item inválido." }, { status: 400 });
    const db = await database();
    await db.prepare("INSERT INTO bundle_progress (item_id, completed, updated_at) VALUES (?, ?, ?) ON CONFLICT(item_id) DO UPDATE SET completed = excluded.completed, updated_at = excluded.updated_at").bind(id, completed ? 1 : 0, new Date().toISOString()).run();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Não foi possível salvar a alteração." }, { status: 500 }); }
}
