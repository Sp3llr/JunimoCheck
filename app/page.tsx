"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "@fontsource/pixelify-sans/700.css";
import { supabase } from "./lib/supabase";

type Entry = { id: string; label: string; note?: string };
type Bundle = {
  id: string;
  room: string;
  title: string;
  reward: string;
  maxChoices?: number;
  entries: Entry[];
};
type Farm = {
  id: string;
  owner_id: string;
  name: string;
  checklist_title: string;
  description: string;
  logo_path: string | null;
  created_at: string;
};
type Profile = { display_name: string | null; avatar_key: string | null };
type FarmMember = {
  farm_id: string;
  user_id: string;
  role: "owner" | "member";
  profiles?: Profile | null;
};

const bundles: Bundle[] = [
  {
    id: "spring-foraging",
    room: "Sala de Artesanato",
    title: "Coleta da Primavera",
    reward: "30 Sementes de Primavera",
    entries: [
      { id: "wild-horseradish", label: "Raiz-forte", note: "Primavera" },
      { id: "daffodil", label: "Narciso", note: "Primavera" },
      { id: "leek", label: "Alho-poró", note: "Primavera" },
      { id: "dandelion", label: "Dente-de-leão", note: "Primavera" },
    ],
  },
  {
    id: "summer-foraging",
    room: "Sala de Artesanato",
    title: "Coleta do Verão",
    reward: "30 Sementes de Verão",
    entries: [
      { id: "grape", label: "Uva", note: "Verão" },
      { id: "spice-berry", label: "Fruta Picante", note: "Verão" },
      { id: "sweet-pea", label: "Ervilha-de-cheiro", note: "Verão" },
    ],
  },
  {
    id: "fall-foraging",
    room: "Sala de Artesanato",
    title: "Coleta do Outono",
    reward: "30 Sementes de Outono",
    entries: [
      { id: "common-mushroom", label: "Cogumelo comum", note: "Outono" },
      { id: "wild-plum", label: "Ameixa selvagem", note: "Outono" },
      { id: "hazelnut", label: "Avelã", note: "Outono" },
      { id: "blackberry", label: "Amora", note: "Outono" },
    ],
  },
  {
    id: "winter-foraging",
    room: "Sala de Artesanato",
    title: "Coleta do Inverno",
    reward: "30 Sementes de Inverno",
    entries: [
      { id: "winter-root", label: "Raiz de inverno", note: "Inverno" },
      { id: "crystal-fruit", label: "Fruta de cristal", note: "Inverno" },
      { id: "snow-yam", label: "Inhame da neve", note: "Inverno" },
      { id: "crocus", label: "Açafrão", note: "Inverno" },
    ],
  },
  {
    id: "construction",
    room: "Sala de Artesanato",
    title: "Construção",
    reward: "Carvão ×3",
    entries: [
      { id: "wood-99", label: "Madeira ×99" },
      { id: "stone-99", label: "Pedra ×99" },
      { id: "hardwood-10", label: "Madeira de lei ×10" },
    ],
  },
  {
    id: "exotic-foraging",
    room: "Sala de Artesanato",
    title: "Coleta Exótica",
    reward: "5 Sementes de Outono",
    maxChoices: 5,
    entries: [
      { id: "coconut", label: "Coco" },
      { id: "cactus-fruit", label: "Fruta de cacto" },
      { id: "cave-carrot", label: "Cenoura de caverna" },
      { id: "red-mushroom", label: "Cogumelo vermelho" },
      { id: "purple-mushroom", label: "Cogumelo roxo" },
      { id: "maple-syrup", label: "Xarope de bordo" },
      { id: "oak-resin", label: "Resina de carvalho" },
      { id: "pine-tar", label: "Alcatrão de pinheiro" },
      { id: "morel", label: "Morel" },
    ],
  },
  {
    id: "spring-crops",
    room: "Despensa",
    title: "Colheitas da Primavera",
    reward: "20 Fertilizantes Básicos",
    entries: [
      { id: "parsnip", label: "Chirívia", note: "Primavera" },
      { id: "green-bean", label: "Vagem", note: "Primavera" },
      { id: "cauliflower", label: "Couve-flor", note: "Primavera" },
      { id: "potato", label: "Batata", note: "Primavera" },
    ],
  },
  {
    id: "summer-crops",
    room: "Despensa",
    title: "Colheitas do Verão",
    reward: "Aspersor de Qualidade",
    entries: [
      { id: "tomato", label: "Tomate", note: "Verão" },
      { id: "hot-pepper", label: "Pimenta quente", note: "Verão" },
      { id: "blueberry", label: "Mirtilo", note: "Verão" },
      { id: "melon", label: "Melão", note: "Verão" },
    ],
  },
  {
    id: "fall-crops",
    room: "Despensa",
    title: "Colheitas do Outono",
    reward: "Colmeia",
    entries: [
      { id: "corn", label: "Milho", note: "Verão ou Outono" },
      { id: "eggplant", label: "Berinjela", note: "Outono" },
      { id: "pumpkin", label: "Abóbora", note: "Outono" },
      { id: "yam", label: "Inhame", note: "Outono" },
    ],
  },
  {
    id: "quality-crops",
    room: "Despensa",
    title: "Culturas de Qualidade",
    reward: "Jarra de Conserva",
    maxChoices: 3,
    entries: [
      { id: "gold-parsnip-5", label: "Chirívia ouro ×5", note: "Primavera" },
      { id: "gold-melon-5", label: "Melão ouro ×5", note: "Verão" },
      { id: "gold-pumpkin-5", label: "Abóbora ouro ×5", note: "Outono" },
      { id: "gold-corn-5", label: "Milho ouro ×5", note: "Verão ou Outono" },
    ],
  },
  {
    id: "animal",
    room: "Despensa",
    title: "Produtos de Animais",
    reward: "Prensa de Queijo",
    maxChoices: 5,
    entries: [
      { id: "large-milk", label: "Leite grande" },
      { id: "large-brown-egg", label: "Ovo marrom grande" },
      { id: "large-egg", label: "Ovo grande" },
      { id: "large-goat-milk", label: "Leite de cabra grande" },
      { id: "wool", label: "Lã" },
      { id: "duck-egg", label: "Ovo de pato" },
    ],
  },
  {
    id: "artisan",
    room: "Despensa",
    title: "Artesanal",
    reward: "Barril",
    maxChoices: 6,
    entries: [
      { id: "truffle-oil", label: "Óleo de trufa" },
      { id: "cloth", label: "Tecido" },
      { id: "goat-cheese", label: "Queijo de cabra" },
      { id: "cheese", label: "Queijo" },
      { id: "honey", label: "Mel" },
      { id: "jelly", label: "Geleia" },
      { id: "apple", label: "Maçã" },
      { id: "apricot", label: "Damasco" },
      { id: "orange", label: "Laranja" },
      { id: "peach", label: "Pêssego" },
      { id: "pomegranate", label: "Romã" },
      { id: "cherry", label: "Cereja" },
    ],
  },
  {
    id: "river-fish",
    room: "Aquário",
    title: "Peixes do Rio",
    reward: "Isca Deluxe ×30",
    entries: [
      { id: "sunfish", label: "Peixe-sol", note: "Primavera/Verão" },
      { id: "catfish", label: "Bagre", note: "Primavera/Outono, chuva" },
      { id: "shad", label: "Sável", note: "Primavera/Verão/Outono, chuva" },
      { id: "tiger-trout", label: "Truta-tigre", note: "Outono/Inverno" },
    ],
  },
  {
    id: "lake-fish",
    room: "Aquário",
    title: "Peixes do Lago",
    reward: "Carretel de Pesca",
    entries: [
      { id: "largemouth-bass", label: "Achigã" },
      { id: "carp", label: "Carpa" },
      { id: "bullhead", label: "Peixe-gato" },
      { id: "sturgeon", label: "Esturjão", note: "Verão/Inverno" },
    ],
  },
  {
    id: "ocean-fish",
    room: "Aquário",
    title: "Peixes do Oceano",
    reward: "Totem de Teleporte: Praia ×5",
    entries: [
      { id: "sardine", label: "Sardinha", note: "Primavera/Outono/Inverno" },
      { id: "tuna", label: "Atum", note: "Verão/Inverno" },
      { id: "red-snapper", label: "Cioba", note: "Verão/Outono, chuva" },
      { id: "tilapia", label: "Tilápia", note: "Verão/Outono" },
    ],
  },
  {
    id: "night-fish",
    room: "Aquário",
    title: "Peixes Noturnos",
    reward: "Anel Luminoso",
    entries: [
      { id: "walleye", label: "Lúcio", note: "Outono, chuva, 12h–2h" },
      { id: "bream", label: "Brema", note: "Todas as estações, 18h–2h" },
      { id: "eel", label: "Enguia", note: "Primavera/Outono, chuva, 16h–2h" },
    ],
  },
  {
    id: "crab-pot",
    room: "Aquário",
    title: "Armadilha de Caranguejo",
    reward: "Armadilhas de caranguejo ×3",
    maxChoices: 5,
    entries: [
      { id: "lobster", label: "Lagosta" },
      { id: "crayfish", label: "Lagostim" },
      { id: "crab", label: "Caranguejo" },
      { id: "cockle", label: "Berbigão" },
      { id: "mussel", label: "Mexilhão" },
      { id: "shrimp", label: "Camarão" },
      { id: "snail", label: "Caracol" },
      { id: "periwinkle", label: "Búzio" },
      { id: "oyster", label: "Ostra" },
      { id: "clam", label: "Amêijoa" },
    ],
  },
  {
    id: "specialty-fish",
    room: "Aquário",
    title: "Peixes Especiais",
    reward: "Máquina de Reciclagem",
    entries: [
      { id: "pufferfish", label: "Baiacu", note: "Verão" },
      { id: "ghostfish", label: "Peixe-fantasma", note: "Minas" },
      { id: "sandfish", label: "Peixe-da-areia", note: "Deserto" },
      { id: "woodskip", label: "Peixe-lenha", note: "Floresta Secreta" },
    ],
  },
  {
    id: "blacksmith",
    room: "Sala das Caldeiras",
    title: "Ferreiro",
    reward: "Forno",
    entries: [
      { id: "copper-bar", label: "Barra de cobre" },
      { id: "iron-bar", label: "Barra de ferro" },
      { id: "gold-bar", label: "Barra de ouro" },
    ],
  },
  {
    id: "geologist",
    room: "Sala das Caldeiras",
    title: "Geólogo",
    reward: "5 Bombas",
    entries: [
      { id: "quartz", label: "Quartzo" },
      { id: "earth-crystal", label: "Cristal terrestre" },
      { id: "frozen-tear", label: "Lágrima congelada" },
      { id: "fire-quartz", label: "Quartzo de fogo" },
    ],
  },
  {
    id: "adventurer",
    room: "Sala das Caldeiras",
    title: "Aventureiro",
    reward: "Anel Pequeno de Magnetismo",
    entries: [
      { id: "slime-99", label: "Gosma ×99" },
      { id: "bat-wing-10", label: "Asa de morcego ×10" },
      { id: "solar-essence", label: "Essência solar" },
      { id: "void-essence", label: "Essência do vazio" },
    ],
  },
  {
    id: "chef",
    room: "Quadro de Recados",
    title: "Cozinheiro",
    reward: "3 Bolos de Chocolate",
    entries: [
      { id: "maple-syrup-chef", label: "Xarope de bordo" },
      { id: "fiddlehead-risotto", label: "Risoto de samambaia" },
      { id: "truffle", label: "Trufa" },
      { id: "poppy", label: "Papoula" },
      { id: "maki-roll", label: "Rolinho de maki" },
      { id: "fried-egg", label: "Ovo frito" },
    ],
  },
  {
    id: "dye",
    room: "Quadro de Recados",
    title: "Tintura",
    reward: "Sementes ×5",
    entries: [
      { id: "red-mushroom-dye", label: "Cogumelo vermelho" },
      { id: "sea-urchin", label: "Ouriço-do-mar" },
      { id: "sunflower", label: "Girassol" },
      { id: "duck-feather", label: "Pena de pato" },
      { id: "aquamarine", label: "Água-marinha" },
      { id: "red-cabbage", label: "Repolho-roxo" },
    ],
  },
  {
    id: "field-research",
    room: "Quadro de Recados",
    title: "Pesquisa de Campo",
    reward: "Recicladora",
    entries: [
      { id: "purple-mushroom-research", label: "Cogumelo roxo" },
      { id: "nautilus-shell", label: "Concha de náutilo" },
      { id: "chub", label: "Caboz" },
      { id: "frozen-geode", label: "Geodo congelado" },
    ],
  },
  {
    id: "fodder",
    room: "Quadro de Recados",
    title: "Forragem",
    reward: "Aquecedor",
    entries: [
      { id: "wheat-10", label: "Trigo ×10" },
      { id: "hay-10", label: "Feno ×10" },
      { id: "apple-fodder", label: "Maçã ×3" },
    ],
  },
  {
    id: "enchanter",
    room: "Quadro de Recados",
    title: "Encantador",
    reward: "5 Barras de Ouro",
    entries: [
      { id: "oak-resin-enchanter", label: "Resina de carvalho" },
      { id: "wine", label: "Vinho" },
      { id: "rabbits-foot", label: "Pé de coelho" },
      { id: "pomegranate-enchanter", label: "Romã" },
    ],
  },
  {
    id: "vault-2500",
    room: "Cofre",
    title: "Doação",
    reward: "3 Chocolates",
    entries: [{ id: "money-2500", label: "2.500 ouros" }],
  },
  {
    id: "vault-5000",
    room: "Cofre",
    title: "Doação",
    reward: "30 Fertilizantes de Qualidade",
    entries: [{ id: "money-5000", label: "5.000 ouros" }],
  },
  {
    id: "vault-10000",
    room: "Cofre",
    title: "Doação",
    reward: "Relâmpago",
    entries: [{ id: "money-10000", label: "10.000 ouros" }],
  },
  {
    id: "vault-25000",
    room: "Cofre",
    title: "Doação",
    reward: "Cristalário",
    entries: [{ id: "money-25000", label: "25.000 ouros" }],
  },
];

const rooms = [...new Set(bundles.map((bundle) => bundle.room))];
const seasons = [
  "Todas as estações",
  "Primavera",
  "Verão",
  "Outono",
  "Inverno",
] as const;
const seasonThemes: Record<(typeof seasons)[number], string> = {
  "Todas as estações": "all",
  Primavera: "spring",
  Verão: "summer",
  Outono: "fall",
  Inverno: "winter",
};

const avatarOptions = [
  { id: "abigail", label: "Abigail" },
  { id: "alex", label: "Alex" },
  { id: "caroline", label: "Caroline" },
  { id: "clint", label: "Clint" },
  { id: "demetrius", label: "Demetrius" },
  { id: "dwarf", label: "Dwarf" },
  { id: "elliott", label: "Elliott" },
  { id: "emily", label: "Emily" },
  { id: "evelyn", label: "Evelyn" },
  { id: "george", label: "George" },
  { id: "gus", label: "Gus" },
  { id: "haley", label: "Haley" },
  { id: "harvey", label: "Harvey" },
  { id: "jas", label: "Jas" },
  { id: "jodi", label: "Jodi" },
  { id: "kent", label: "Kent" },
  { id: "krobus", label: "Krobus" },
  { id: "leah", label: "Leah" },
  { id: "leo", label: "Leo" },
  { id: "lewis", label: "Lewis" },
  { id: "linus", label: "Linus" },
  { id: "marnie", label: "Marnie" },
  { id: "maru", label: "Maru" },
  { id: "pam", label: "Pam" },
  { id: "penny", label: "Penny" },
  { id: "pierre", label: "Pierre" },
  { id: "robin", label: "Robin" },
  { id: "sam", label: "Sam" },
  { id: "sandy", label: "Sandy" },
  { id: "sebastian", label: "Sebastian" },
  { id: "shane", label: "Shane" },
  { id: "vincent", label: "Vincent" },
  { id: "willy", label: "Willy" },
  { id: "wizard", label: "Wizard" },
] as const;
type AvatarKey = (typeof avatarOptions)[number]["id"];

function avatarPortrait(key: string | null | undefined) {
  const character =
    avatarOptions.find((avatar) => avatar.id === key)?.label ?? "Abigail";
  return `https://stardewvalleywiki.com/Special:FilePath/${encodeURIComponent(character)}.png`;
}

const fileNameOverrides: Record<string, string> = {
  "wood-99": "Wood",
  "stone-99": "Stone",
  "hardwood-10": "Hardwood",
  "gold-parsnip-5": "Parsnip",
  "gold-melon-5": "Melon",
  "gold-pumpkin-5": "Pumpkin",
  "gold-corn-5": "Corn",
  "maple-syrup-chef": "Maple Syrup",
  "red-mushroom-dye": "Red Mushroom",
  "purple-mushroom-research": "Purple Mushroom",
  "oak-resin-enchanter": "Oak Resin",
  "pomegranate-enchanter": "Pomegranate",
  "apple-fodder": "Apple",
  "rabbits-foot": "Rabbit's Foot",
  "money-2500": "Gold",
  "money-5000": "Gold",
  "money-10000": "Gold",
  "money-25000": "Gold",
};

const entryAvailability: Record<string, string> = {
  "wild-horseradish": "Primavera • áreas abertas",
  daffodil: "Primavera • áreas abertas",
  leek: "Primavera • áreas abertas",
  dandelion: "Primavera • áreas abertas",
  grape: "Verão • áreas abertas",
  "spice-berry": "Verão • áreas abertas",
  "sweet-pea": "Verão • áreas abertas",
  "common-mushroom": "Outono • áreas abertas",
  "wild-plum": "Outono • áreas abertas",
  hazelnut: "Outono • áreas abertas",
  blackberry: "Outono • áreas abertas",
  "winter-root": "Inverno • escave os pontos de artefato",
  "crystal-fruit": "Inverno • áreas abertas",
  "snow-yam": "Inverno • escave os pontos de artefato",
  crocus: "Inverno • áreas abertas",
  sunfish: "Primavera/Verão • 6h–19h • rio, dia ensolarado",
  catfish: "Primavera/Outono • 6h–0h • rio, chuva",
  shad: "Primavera/Verão/Outono • 9h–2h • rio, chuva",
  "tiger-trout": "Outono/Inverno • 6h–19h • rio",
  "largemouth-bass": "Todas as estações • 6h–19h • lago da montanha",
  carp: "Todas as estações • qualquer horário • lago, esgoto ou floresta",
  bullhead: "Todas as estações • qualquer horário • lago da montanha",
  sturgeon: "Verão • 6h–19h • lago da montanha",
  sardine: "Primavera/Outono/Inverno • 6h–19h • oceano",
  tuna: "Verão/Inverno • 6h–19h • oceano",
  "red-snapper": "Verão/Outono • 6h–19h • oceano, chuva",
  tilapia: "Verão/Outono • 6h–14h • oceano",
  walleye: "Outono • 12h–2h • chuva",
  bream: "Todas as estações • 18h–2h • rio",
  eel: "Primavera/Outono • 16h–2h • oceano, chuva",
  lobster: "Armadilha no oceano",
  crayfish: "Armadilha em água doce",
  crab: "Armadilha no oceano",
  cockle: "Praia ou armadilha no oceano",
  mussel: "Praia ou armadilha no oceano",
  shrimp: "Armadilha no oceano",
  snail: "Armadilha em água doce",
  periwinkle: "Armadilha em água doce",
  oyster: "Praia ou armadilha no oceano",
  clam: "Praia ou armadilha no oceano",
  pufferfish: "Verão • 12h–16h • oceano, dia ensolarado",
  ghostfish: "Todas as estações • qualquer horário • minas",
  sandfish: "Todas as estações • 6h–20h • deserto",
  woodskip: "Todas as estações • qualquer horário • Floresta Secreta",
  "nautilus-shell": "Inverno • praia",
  chub: "Todas as estações • 6h–2h • rio da montanha",
};

function itemName(id: string) {
  return (
    fileNameOverrides[id] ??
    id
      .replace(/-\\d+$/, "")
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function itemSprite(id: string) {
  return `https://stardewvalleywiki.com/Special:FilePath/${encodeURIComponent(itemName(id))}.png`;
}

function itemWikiUrl(entry: Entry) {
  let title = entry.label
    .replace(/\s+ouro(?=\s*[×x]\s*\d+$|$)/i, "")
    .replace(/\s*[×x]\s*\d+$/i, "")
    .trim();

  if (/^\d[\d.]*\s+ouros$/i.test(title)) title = "Ouro";

  return `https://pt.stardewvalleywiki.com/Special:Search/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function itemAvailability(entry: Entry) {
  return (
    entryAvailability[entry.id] ??
    (entry.note ? `Estação: ${entry.note}` : undefined)
  );
}

function PixelLeaves({ hub = false }: { hub?: boolean }) {
  const treeSides = [
    ["pine", "oak", "pine"],
    ["oak", "pine", "oak"],
  ];
  return (
    <div
      className={`pixel-leaves ${hub ? "hub-leaves" : ""}`}
      aria-hidden="true"
    >
      <div className="season-tree-line">
        <span className="season-ground-hedge" />
        {treeSides.map((trees, side) => (
          <div
            className={`season-scenery-side ${side === 0 ? "left" : "right"}`}
            key={side}
          >
            {trees.map((kind, index) => (
              <span
                className={`season-tree ${kind}`}
                key={`${kind}-${index}`}
              />
            ))}
            {Array.from({ length: 5 }, (_, index) => (
              <span className="season-bush" key={`bush-${index}`} />
            ))}
          </div>
        ))}
      </div>
      {["left", "right"].map((side) => (
        <div className={`season-leaf-lane ${side}`} key={side}>
          {Array.from({ length: 7 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ChecklistLogoTitle({ text }: { text: string }) {
  return (
    <h1 className="checklist-logo-title" aria-label={text}>
      <span className="hub-logo-text" data-text={text} aria-hidden="true">
        {text}
      </span>
      <i className="hub-title-sprout" aria-hidden="true" />
    </h1>
  );
}

function CharacterPicker({
  value,
  onChange,
}: {
  value: AvatarKey;
  onChange: (avatar: AvatarKey) => void;
}) {
  return (
    <div
      className="character-picker"
      role="radiogroup"
      aria-label="Escolher personagem"
    >
      {avatarOptions.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          role="radio"
          aria-checked={value === avatar.id}
          className={value === avatar.id ? "selected" : ""}
          onClick={() => onChange(avatar.id)}
        >
          <img src={avatarPortrait(avatar.id)} alt="" />
          <span>{avatar.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [members, setMembers] = useState<FarmMember[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activeRoom, setActiveRoom] = useState("Todos");
  const [activeSeason, setActiveSeason] =
    useState<(typeof seasons)[number]>("Todas as estações");
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  const allEntries = bundles.flatMap((bundle) => bundle.entries);
  const progress = Math.round((done.size / allEntries.length) * 100) || 0;
  const visibleBundles = useMemo(() => {
    const roomBundles =
      activeRoom === "Todos"
        ? bundles
        : bundles.filter((bundle) => bundle.room === activeRoom);
    if (activeSeason === "Todas as estações") return roomBundles;
    return roomBundles
      .map((bundle) => ({
        ...bundle,
        entries: bundle.entries.filter(
          (entry) =>
            entry.note?.includes(activeSeason) ||
            entry.note?.includes("Todas as estações"),
        ),
      }))
      .filter((bundle) => bundle.entries.length > 0);
  }, [activeRoom, activeSeason]);

  const loadFarms = useCallback(async () => {
    const [{ data }, { data: roster }] = await Promise.all([
      supabase
        .from("farms")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("farm_members")
        .select("farm_id,user_id,role,profiles(display_name,avatar_key)"),
    ]);
    const nextFarms = (data ?? []) as Farm[];
    setFarms(nextFarms);
    setMembers((roster ?? []) as FarmMember[]);
    setSelectedFarm((currentFarm) => {
      if (!currentFarm) return null;
      return (
        nextFarms.find((farm) => farm.id === currentFarm.id) ?? null
      );
    });
  }, []);

  const loadProgress = useCallback(async (farmId: string) => {
    const { data } = await supabase
      .from("farm_progress")
      .select("entry_id")
      .eq("farm_id", farmId);
    setDone(new Set((data ?? []).map((entry) => entry.entry_id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email }
          : null,
      );
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Sincroniza a lista compartilhada assim que a sessão autenticada muda.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) loadFarms();
    else {
      setFarms([]);
      setMembers([]);
      setSelectedFarm(null);
    }
  }, [user?.id, loadFarms]);

  useEffect(() => {
    if (!user) return;

    let refreshTimer: number | undefined;
    const refreshHub = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadFarms(), 120);
    };
    const channel = supabase
      .channel(`farm-hub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "farms" },
        refreshHub,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "farm_members" },
        refreshHub,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        refreshHub,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refreshHub();
      });
    const fallbackRefresh = window.setInterval(() => void loadFarms(), 30000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshHub();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [user?.id, loadFarms]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token || !user) return;
    supabase.functions
      .invoke("manage-farm-invites", { body: { action: "accept", token } })
      .then(({ data, error }) => {
        if (error || data?.error)
          setNotice(data?.error ?? "Não foi possível aceitar este convite.");
        else {
          setNotice("Convite aceito! A fazenda apareceu no seu hub.");
          window.history.replaceState({}, "", window.location.pathname);
          loadFarms();
        }
      });
  }, [user?.id, loadFarms]);

  useEffect(() => {
    if (!selectedFarm) return;
    // O estado de carregamento pertence ao ciclo da fazenda selecionada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const farmId = selectedFarm.id;
    let refreshTimer: number | undefined;
    const refreshProgress = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadProgress(farmId), 100);
    };
    void loadProgress(farmId);
    const channel = supabase
      .channel(`farm-progress-${farmId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "farm_progress" },
        refreshProgress,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refreshProgress();
      });
    const fallbackRefresh = window.setInterval(
      () => void loadProgress(farmId),
      15000,
    );
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshProgress();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [selectedFarm?.id, loadProgress]);

  useEffect(() => {
    document.body.dataset.season = seasonThemes[activeSeason];
    return () => {
      delete document.body.dataset.season;
    };
  }, [activeSeason]);

  async function toggle(id: string, bundle: Bundle) {
    if (!selectedFarm || !user) return;
    const isCompleted = !done.has(id);
    const fullBundle = bundles.find((item) => item.id === bundle.id) ?? bundle;
    const selectedInBundle = fullBundle.entries.filter((entry) =>
      done.has(entry.id),
    ).length;
    const completionTarget = fullBundle.maxChoices ?? fullBundle.entries.length;
    if (
      isCompleted &&
      fullBundle.maxChoices &&
      selectedInBundle >= fullBundle.maxChoices
    )
      return;
    setDone((current) => {
      const next = new Set(current);
      isCompleted ? next.add(id) : next.delete(id);
      return next;
    });
    if (isCompleted && selectedInBundle + 1 === completionTarget)
      setNotice(`Pacote completado: ${fullBundle.title}!`);
    const request = isCompleted
      ? supabase
          .from("farm_progress")
          .upsert({
            farm_id: selectedFarm.id,
            entry_id: id,
            completed_by: user.id,
          })
      : supabase
          .from("farm_progress")
          .delete()
          .eq("farm_id", selectedFarm.id)
          .eq("entry_id", id);
    const { error } = await request;
    if (error) {
      setNotice("Não salvou agora. Tenta marcar de novo.");
      setDone((current) => {
        const next = new Set(current);
        isCompleted ? next.delete(id) : next.add(id);
        return next;
      });
    }
  }

  if (!authReady)
    return <div className="screen-loading">Preparando sua fazenda…</div>;
  if (recoveryMode)
    return <PasswordRecovery onDone={() => setRecoveryMode(false)} />;
  if (!user) return <AuthScreen />;
  if (!selectedFarm)
    return (
      <FarmHub
        farms={farms}
        members={members}
        userId={user.id}
        notice={notice}
        onNotice={setNotice}
        onOpen={setSelectedFarm}
        onChanged={loadFarms}
      />
    );

  return (
    <main className="checklist-page">
      <PixelLeaves />
      <div className="farm-nav">
        <button onClick={() => setSelectedFarm(null)}>← Minhas Fazendas</button>
        <button onClick={() => supabase.auth.signOut()}>Sair</button>
      </div>
      {notice && <p className="notice">{notice}</p>}
      <section className="hero">
        <div className="hero-top">
          <img
            className="team-logo"
            src={selectedFarm.logo_path || "/favicon.svg"}
            alt={`Logo da ${selectedFarm.name}`}
          />
          <div>
            <p className="eyebrow">{selectedFarm.name} · JunimoCheck</p>
            <ChecklistLogoTitle text={selectedFarm.checklist_title} />
            <p className="intro">
              {selectedFarm.description ||
                "Checklist compartilhada do Centro Comunitário. Tudo que alguém marcar aparece para a fazenda toda."}
            </p>
          </div>
        </div>
        <div className="progress-card" aria-label={`${progress}% completo`}>
          <div>
            <strong>{loading ? "Carregando…" : `${progress}% completo`}</strong>
            <span>
              {done.size} de {allEntries.length} entregas marcadas
            </span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>
      {selectedFarm.owner_id === user.id && (
        <InvitePanel farmId={selectedFarm.id} />
      )}
      <section className="filter-area">
        <div className="season-picker">
          <p>Ver itens por estação</p>
          <div className="season-dropdown">
            <button
              className="season-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={seasonMenuOpen}
              onClick={() => setSeasonMenuOpen((open) => !open)}
            >
              <span>☰</span>
              <b>{activeSeason}</b>
              <span className="arrow">⌄</span>
            </button>
            {seasonMenuOpen && (
              <div
                className="season-menu"
                role="listbox"
                aria-label="Escolher estação"
              >
                {seasons.map((season) => (
                  <button
                    role="option"
                    aria-selected={activeSeason === season}
                    key={season}
                    type="button"
                    onClick={() => {
                      setActiveSeason(season);
                      setSeasonMenuOpen(false);
                    }}
                  >
                    {season}
                    {activeSeason === season && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {activeSeason !== "Todas as estações" && (
          <p className="season-result">
            Itens do <b>{activeSeason}</b> que ajudam no Centro Comunitário.
          </p>
        )}
        <nav className="filters" aria-label="Filtrar salas">
          {["Todos", ...rooms].map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={activeRoom === room ? "active" : ""}
            >
              {room}
            </button>
          ))}
        </nav>
      </section>
      <section className="bundle-grid">
        {visibleBundles.map((bundle) => {
          const fullBundle =
            bundles.find((item) => item.id === bundle.id) ?? bundle;
          const total = fullBundle.entries.length;
          const marked = fullBundle.entries.filter((entry) =>
            done.has(entry.id),
          ).length;
          const target = fullBundle.maxChoices ?? total;
          const isFull = Boolean(fullBundle.maxChoices && marked >= target);
          const isBundleComplete = marked >= target;
          const progressLabel = fullBundle.maxChoices
            ? `${marked}/${target} escolhidos`
            : `${marked}/${total} itens`;
          return (
            <article
              className={`bundle ${isBundleComplete ? "bundle-complete" : ""}`}
              key={bundle.id}
            >
              <header>
                <p>{bundle.room}</p>
                <div className="bundle-title-row">
                  <h2>{bundle.title}</h2>
                  {isBundleComplete && (
                    <span className="bundle-complete-badge">✓ Completado</span>
                  )}
                </div>
                <span data-progress={progressLabel}>{progressLabel}</span>
              </header>
              <div className="bundle-progress">
                <span
                  style={{
                    width: `${Math.min(100, Math.round((marked / target) * 100))}%`,
                  }}
                />
              </div>
              <ul>
                {bundle.entries.map((entry) => {
                  const locked = isFull && !done.has(entry.id);
                  return (
                    <li
                      key={entry.id}
                      className={`${done.has(entry.id) ? "checked" : ""} ${locked ? "option-locked" : ""}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={done.has(entry.id)}
                          disabled={locked}
                          onChange={() => toggle(entry.id, bundle)}
                        />
                        <span className="box" aria-hidden="true">
                          ✓
                        </span>
                        <span className="item-sprite">
                          <span aria-hidden="true">✦</span>
                          <img
                            src={itemSprite(entry.id)}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </span>
                        <span>
                          <a
                            className="item-link"
                            href={itemWikiUrl(entry)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            title={`Abrir ${entry.label} na wiki em português`}
                          >
                            {entry.label} <span aria-hidden="true">↗</span>
                          </a>
                          {itemAvailability(entry) && (
                            <small>{itemAvailability(entry)}</small>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <footer>
                Recompensa: <b>{bundle.reward}</b>
              </footer>
            </article>
          );
        })}
      </section>
      <aside className="site-notices" aria-label="Avisos importantes">
        <p className="gameplay-tip">
          <strong>Dica:</strong> nos pacotes com escolhas, os outros itens ficam
          bloqueados quando vocês alcançam a quantidade necessária. É só
          desmarcar um para trocar.
        </p>
        <p className="fan-disclaimer">
          <strong>Projeto de fãs</strong>Este é um projeto de fãs e não é
          afiliado nem endossado por Stardew Valley ou ConcernedApe. Stardew
          Valley e seus assets pertencem aos seus respectivos proprietários.
        </p>
      </aside>
    </main>
  );
}

function PasswordRecovery({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("As duas senhas precisam ser iguais.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(
      error
        ? "Não foi possível trocar a senha. Peça outro link e tente novamente."
        : "Senha alterada! Você já pode entrar na sua fazenda.",
    );
    setSaving(false);
    if (!error) window.setTimeout(onDone, 1500);
  }
  return (
    <main className="auth-page">
      <PixelLeaves />
      <section className="auth-card recovery-card">
        <div className="check-emblem">✓</div>
        <p className="eyebrow">Segurança da conta</p>
        <h1>Nova senha</h1>
        <p className="auth-copy">
          Escolha uma senha nova para voltar à sua fazenda.
        </p>
        <form onSubmit={submit}>
          <label>
            Nova senha
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Esconder senha" : "Ver senha"}
              >
                <span
                  className={`pixel-eye ${showPassword ? "is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </span>
          </label>
          <label>
            Repita a nova senha
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
              placeholder="Digite a senha de novo"
              autoComplete="new-password"
            />
          </label>
          <button className="primary-button" disabled={saving}>
            {saving ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("abigail");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name, avatar_key: avatarKey },
          emailRedirectTo: window.location.origin,
        },
      });
      setMessage(
        error
          ? error.message
          : data.session
            ? "Conta criada! Entrando na sua fazenda…"
            : "Conta criada! Confere seu e-mail para confirmar e entrar.",
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setMessage(error ? "E-mail ou senha incorretos." : "Entrando…");
    }
    setSaving(false);
  }
  async function resetPassword() {
    if (!email) return setMessage("Digite seu e-mail primeiro.");
    setResetSaving(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    const detail = error?.message.toLowerCase() ?? "";
    setMessage(
      error
        ? detail.includes("rate limit")
          ? "O limite de e-mails do site foi atingido. Espere um pouco (pode levar até 1 hora) e tente de novo."
          : "Não foi possível enviar o e-mail agora. Confere o endereço e tenta mais tarde."
        : "Mandamos um link para trocar sua senha. Confere sua caixa de entrada e o spam.",
    );
    setResetSaving(false);
  }
  const selectedAvatar =
    avatarOptions.find((avatar) => avatar.id === avatarKey) ?? avatarOptions[0];
  return (
    <main className="auth-page">
      <PixelLeaves />
      <section className="auth-card">
        <div className="check-emblem">✓</div>
        <p className="eyebrow">Stardew Valley · Checklist colaborativa</p>
        <ChecklistLogoTitle text="JunimoCheck" />
        <p className="auth-copy">
          Crie sua fazenda, convide os amigos e acompanhem o Centro Comunitário
          juntos.
        </p>
        <div className="auth-tabs">
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setShowAvatarPicker(false);
            }}
          >
            Criar conta
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setShowAvatarPicker(false);
            }}
          >
            Entrar
          </button>
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label>
                Seu nome
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Como a galera te chama?"
                />
              </label>
              <div className="character-field">
                <span>Escolha seu personagem</span>
                <button
                  type="button"
                  className="avatar-select-trigger"
                  aria-expanded={showAvatarPicker}
                  onClick={() => setShowAvatarPicker((open) => !open)}
                >
                  <img src={avatarPortrait(avatarKey)} alt="" />
                  <b>{selectedAvatar.label}</b>
                  <span>Escolher ▾</span>
                </button>
                {showAvatarPicker && (
                  <div className="signup-character-panel">
                    <CharacterPicker
                      value={avatarKey}
                      onChange={(next) => {
                        setAvatarKey(next);
                        setShowAvatarPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="voce@email.com"
            />
          </label>
          <label>
            Senha
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                placeholder="Mínimo de 6 caracteres"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Esconder senha" : "Ver senha"}
                title={showPassword ? "Esconder senha" : "Ver senha"}
              >
                <span
                  className={`pixel-eye ${showPassword ? "is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </span>
          </label>
          <button className="primary-button" disabled={saving}>
            {saving
              ? "Só um segundo…"
              : mode === "signup"
                ? "Criar minha conta"
                : "Entrar na conta"}
          </button>
        </form>
        {mode === "login" && (
          <button
            className="text-button"
            disabled={resetSaving}
            onClick={resetPassword}
          >
            {resetSaving ? "Enviando…" : "Esqueci minha senha"}
          </button>
        )}
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  );
}

function FarmHub({
  farms,
  members,
  userId,
  notice,
  onNotice,
  onOpen,
  onChanged,
}: {
  farms: Farm[];
  members: FarmMember[];
  userId: string;
  notice: string;
  onNotice: (text: string) => void;
  onOpen: (farm: Farm) => void;
  onChanged: () => void;
}) {
  const ownedFarmCount = farms.filter(
    (farm) => farm.owner_id === userId,
  ).length;
  const canCreateFarm = ownedFarmCount < 3;
  const myProfile = members.find(
    (member) => member.user_id === userId,
  )?.profiles;
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Checklist da Fazenda");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(farms.length === 0);
  const [showCharacters, setShowCharacters] = useState(false);
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("abigail");
  const [saving, setSaving] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    farm: Farm;
    member: FarmMember;
  } | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  const blockingModalOpen = Boolean(farmToDelete || memberToRemove);
  useEffect(() => {
    if (!blockingModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";

    const dialog = document.querySelector<HTMLElement>(
      '.delete-modal-backdrop [role="dialog"]',
    );
    const focusable = Array.from(
      dialog?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    const focusFrame = window.requestAnimationFrame(() => {
      (focusable[0] ?? dialog)?.focus();
    });
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInside);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInside);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [blockingModalOpen]);
  useEffect(() => {
    // Mantém o seletor alinhado com o perfil recebido do Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvatarKey((myProfile?.avatar_key as AvatarKey) || "abigail");
  }, [myProfile?.avatar_key]);
  function chooseLogo(event: ChangeEvent<HTMLInputElement>) {
    const chosenLogo = event.target.files?.[0] ?? null;
    setLogo(chosenLogo);
    if (!chosenLogo) {
      setLogoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setLogoPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(chosenLogo);
  }
  async function createFarm(event: FormEvent) {
    event.preventDefault();
    if (!canCreateFarm) {
      onNotice("Cada conta pode criar no máximo 3 fazendas.");
      return;
    }
    setSaving(true);
    onNotice("");
    const { data, error } = await supabase.functions.invoke(
      "manage-farm-invites",
      { body: { action: "create", name, checklistTitle: title, description } },
    );
    const farm = data?.farm as Farm | undefined;
    if (error || data?.error || !farm) {
      onNotice(
        data?.error ?? error?.message ?? "Não deu para criar a fazenda.",
      );
      setSaving(false);
      return;
    }
    let readyFarm = farm as Farm;
    if (logo) {
      const extension = logo.name.split(".").pop() || "png";
      const path = `${userId}/${farm.id}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("farm-logos")
        .upload(path, logo, { upsert: true });
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("farm-logos")
          .getPublicUrl(path);
        const { data: updated } = await supabase
          .from("farms")
          .update({ logo_path: publicUrl.publicUrl })
          .eq("id", farm.id)
          .select("*")
          .single();
        if (updated) readyFarm = updated as Farm;
      }
    }
    await onChanged();
    onOpen(readyFarm);
    setSaving(false);
  }
  async function updateAvatar(nextAvatar: AvatarKey) {
    setAvatarKey(nextAvatar);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_key: nextAvatar })
      .eq("id", userId);
    if (error) {
      onNotice("Não foi possível salvar seu personagem agora.");
      return;
    }
    setShowCharacters(false);
    onNotice("Personagem atualizado!");
    window.setTimeout(() => onNotice(""), 3200);
    await onChanged();
  }
  async function deleteFarm(event: FormEvent) {
    event.preventDefault();
    if (!farmToDelete || deleteName !== farmToDelete.name) return;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke(
      "manage-farm-invites",
      {
        body: {
          action: "delete",
          farmId: farmToDelete.id,
          confirmationName: deleteName,
        },
      },
    );
    if (error || data?.error) {
      onNotice(data?.error ?? "Não foi possível excluir a fazenda agora.");
      setDeleting(false);
      return;
    }
    const deletedName = farmToDelete.name;
    setFarmToDelete(null);
    setDeleteName("");
    await onChanged();
    onNotice(`${deletedName} foi excluída.`);
    setDeleting(false);
  }
  async function removeMember() {
    if (!memberToRemove) return;
    setRemovingMember(true);
    const displayName =
      memberToRemove.member.profiles?.display_name || "Esse integrante";
    const { data, error } = await supabase.functions.invoke(
      "manage-farm-invites",
      {
        body: {
          action: "remove-member",
          farmId: memberToRemove.farm.id,
          memberUserId: memberToRemove.member.user_id,
        },
      },
    );
    if (error || data?.error) {
      onNotice(data?.error ?? "Não foi possível remover essa pessoa agora.");
      setRemovingMember(false);
      return;
    }
    setMemberToRemove(null);
    await onChanged();
    onNotice(`${displayName} foi removido(a) da fazenda.`);
    window.setTimeout(() => onNotice(""), 3200);
    setRemovingMember(false);
  }
  return (
    <main className="hub-page">
      <PixelLeaves hub />
      <header className="hub-header">
        <div>
          <div className="mini-check">✓</div>
          <p className="eyebrow">JunimoCheck · Hub</p>
          <h1 className="hub-logo-title">
            <span className="hub-logo-text" data-text="Minhas Fazendas">
              Minhas Fazendas
            </span>
            <i className="hub-title-sprout" aria-hidden="true" />
          </h1>
          <p>Entre em uma fazenda ou comece uma nova aventura.</p>
          <div className="hub-sprites" aria-hidden="true">
            <img src={itemSprite("parsnip")} alt="" />
            <img src={itemSprite("blueberry")} alt="" />
            <img src={itemSprite("pumpkin")} alt="" />
          </div>
        </div>
        <div className="hub-actions">
          <button
            className="avatar-button"
            aria-expanded={showCharacters}
            onClick={() => setShowCharacters((open) => !open)}
          >
            <img src={avatarPortrait(avatarKey)} alt="" />
            Meu personagem
          </button>
          <button
            className="text-button"
            onClick={() => supabase.auth.signOut()}
          >
            Sair
          </button>
        </div>
      </header>
      {showCharacters && (
        <section className="character-panel" aria-label="Escolher personagem">
          <div className="character-panel-heading">
            <div>
              <p className="eyebrow">Seu fazendeiro</p>
              <h2>{myProfile?.display_name || "Seu personagem"}</h2>
            </div>
            <button
              type="button"
              className="close-characters"
              onClick={() => setShowCharacters(false)}
            >
              Fechar ×
            </button>
          </div>
          <p>Escolha o rosto que aparece para a sua turma.</p>
          <CharacterPicker value={avatarKey} onChange={updateAvatar} />
        </section>
      )}
      {notice && <p className="notice">{notice}</p>}
      <section className="farm-cards">
        {farms.map((farm) => {
          const roster = members.filter((member) => member.farm_id === farm.id);
          const isOwner = farm.owner_id === userId;
          return (
            <article className="farm-card" key={farm.id}>
              <img src={farm.logo_path || "/favicon.svg"} alt="" />
              <div>
                <p className="eyebrow">
                  {isOwner ? "Sua fazenda" : "Você foi convidado"}
                </p>
                <h2>{farm.name}</h2>
                <p>
                  {farm.description ||
                    "Pronta para organizar o Centro Comunitário."}
                </p>
                <div className="farm-roster">
                  <span className="roster-label">Turma da fazenda</span>
                  <div>
                    {roster.map((member) => (
                      <span
                        className="member-chip"
                        key={member.user_id}
                        title={member.profiles?.display_name || "Fazendeiro"}
                      >
                        <img
                          src={avatarPortrait(member.profiles?.avatar_key)}
                          alt=""
                        />
                        <b>{member.profiles?.display_name || "Fazendeiro"}</b>
                        {isOwner && member.role !== "owner" && (
                          <button
                            type="button"
                            className="member-remove-button"
                            aria-label={`Remover ${member.profiles?.display_name || "integrante"} da fazenda`}
                            title="Remover integrante"
                            onClick={() => setMemberToRemove({ farm, member })}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="farm-card-actions">
                  <button
                    className="primary-button"
                    onClick={() => onOpen(farm)}
                  >
                    Abrir checklist →
                  </button>
                  {isOwner && (
                    <button
                      className="danger-button"
                      onClick={() => {
                        setFarmToDelete(farm);
                        setDeleteName("");
                      }}
                    >
                      Excluir fazenda
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {farms.length === 0 && (
          <div className="empty-card">
            Sua primeira fazenda vai aparecer aqui. Bora criar?
          </div>
        )}
      </section>
      {canCreateFarm ? (
        showCreate ? (
          <section className="create-farm">
            <div>
              <p className="eyebrow">Nova aventura</p>
              <h2>Crie sua fazenda</h2>
              <p>Depois você pode convidar sua galera pelo e-mail.</p>
              <div className={`logo-preview ${logoPreview ? "has-logo" : ""}`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Prévia da logo escolhida" />
                ) : (
                  <>
                    <span>✦</span>
                    <small>Sua logo aparece aqui</small>
                  </>
                )}
              </div>
            </div>
            <form onSubmit={createFarm}>
              <div className="create-form-top">
                <span>{ownedFarmCount}/3 fazendas criadas</span>
                {farms.length > 0 && (
                  <button
                    type="button"
                    className="close-create"
                    onClick={() => setShowCreate(false)}
                  >
                    Fechar ×
                  </button>
                )}
              </div>
              <label>
                Nome da fazenda
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="Ex.: Fazenda dos Pitufos"
                />
              </label>
              <label>
                Título da checklist
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={70}
                />
              </label>
              <label>
                Descrição
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={280}
                  placeholder="Uma frase sobre sua fazenda"
                />
              </label>
              <label>
                Logo da fazenda
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={chooseLogo}
                />
              </label>
              <button className="primary-button" disabled={saving}>
                {saving ? "Criando…" : "Criar fazenda"}
              </button>
            </form>
          </section>
        ) : (
          <button
            className="new-farm-button"
            onClick={() => setShowCreate(true)}
          >
            <span className="new-farm-sprite">
              <img src={itemSprite("parsnip")} alt="" />
            </span>
            <span>
              <b>Criar outra fazenda</b>
              <small>{ownedFarmCount}/3 fazendas criadas</small>
            </span>
            <strong>+</strong>
          </button>
        )
      ) : (
        <section className="farm-limit">
          <img src={itemSprite("starfruit")} alt="" />
          <div>
            <b>Suas 3 fazendas já foram criadas.</b>
            <span>
              Você ainda pode participar das fazendas para as quais for
              convidado.
            </span>
          </div>
        </section>
      )}
      {farmToDelete && (
        <div className="delete-modal-backdrop" role="presentation">
          <section
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-farm-title"
          >
            <p className="eyebrow">Atenção</p>
            <h2 id="delete-farm-title">Excluir {farmToDelete.name}?</h2>
            <p>
              Isso apaga a checklist, o progresso e os convites dessa fazenda
              para todos. Para confirmar, escreva exatamente:
            </p>
            <strong className="delete-farm-name">{farmToDelete.name}</strong>
            <form onSubmit={deleteFarm}>
              <label>
                Nome da fazenda
                <input
                  value={deleteName}
                  onChange={(event) => setDeleteName(event.target.value)}
                  autoFocus
                  placeholder={farmToDelete.name}
                />
              </label>
              <div>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setFarmToDelete(null);
                    setDeleteName("");
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="danger-button"
                  disabled={deleting || deleteName !== farmToDelete.name}
                >
                  {deleting ? "Excluindo…" : "Excluir para sempre"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {memberToRemove && (
        <div className="delete-modal-backdrop" role="presentation">
          <section
            className="delete-modal remove-member-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
          >
            <p className="eyebrow">Turma da fazenda</p>
            <h2 id="remove-member-title">
              Remover{" "}
              {memberToRemove.member.profiles?.display_name ||
                "este integrante"}
              ?
            </h2>
            <p>
              Essa pessoa perderá o acesso à fazenda{" "}
              <b>{memberToRemove.farm.name}</b> e à checklist compartilhada.
            </p>
            <div className="remove-member-actions">
              <button
                type="button"
                className="modal-cancel"
                disabled={removingMember}
                onClick={() => setMemberToRemove(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                disabled={removingMember}
                onClick={removeMember}
              >
                {removingMember ? "Removendo…" : "Remover integrante"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function InvitePanel({ farmId }: { farmId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function invite(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const { data, error } = await supabase.functions.invoke(
      "manage-farm-invites",
      { body: { action: "invite", farmId, email } },
    );
    setMessage(
      error
        ? "Não foi possível enviar agora."
        : (data?.error ??
            (data?.existing
              ? "Essa pessoa já tinha conta e foi adicionada à fazenda!"
              : "Convite enviado! A pessoa vai receber o e-mail para criar a conta e entrar na fazenda.")),
    );
    if (!error && !data?.error) setEmail("");
    setSending(false);
  }
  return (
    <section className="invite-panel">
      <div>
        <p className="eyebrow">Jogar em equipe</p>
        <h2>Convide alguém para esta fazenda</h2>
      </div>
      <form onSubmit={invite}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="email-do-amigo@exemplo.com"
        />
        <button className="primary-button" disabled={sending}>
          {sending ? "Enviando…" : "Enviar convite"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
