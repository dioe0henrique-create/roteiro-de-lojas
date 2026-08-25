export const APP_NOME = "Arara";

export const PRIMAVERA_WHATSAPP = "5566996983540";

// Dados reais dos shoppings — Manual Mestre Primavera Tur, seção 10.
export const SHOPPING_INFO = [
  {
    nome: "Master Shopping Atacadista", curto: "Master Shopping Cianorte",
    cidade: "Cianorte, PR", tag: "+120 marcas exclusivas · pronta-entrega",
    insta: "mastershopcianorte",
  },
  {
    nome: "Shopping Vest Sul", curto: "Vest Sul",
    cidade: "Maringá, PR · PR-317, Km 06", tag: "+100 marcas · direto de fábrica",
    insta: "vestsul",
  },
  {
    nome: "Paraná Moda Park", curto: "Paraná Moda Park",
    cidade: "Maringá, PR · PR-317, Km 05", tag: "+140 marcas",
    insta: "paranamodapark",
  },
];

export const SHOPPINGS = {
  M: { nome: "Master Shopping Cianorte", curto: "Master", cor: "#23395B" },
  P: { nome: "Paraná Moda Park", curto: "Moda Park", cor: "#8C6D1F" },
  V: { nome: "Vest Sul", curto: "Vest Sul", cor: "#1F6F5C" },
};

export const ICONES = {
  Feminina: "👗", Masculina: "👔", Jeans: "👖", Infantil: "🧸",
  "Plus Size Feminina": "✨", "Evangélica": "🕊️", "Acessórios": "👜",
  "Íntima & Fitness": "🩱", "Perfumaria & Casa": "🧴",
};

export const SUGESTOES = {
  Feminina: ["vestido", "blusa", "saia", "calça", "conjunto", "macacão", "cropped", "alfaiataria"],
  Masculina: ["camiseta", "camisa", "bermuda", "calça", "polo", "moletom"],
  Jeans: ["calça jeans", "short jeans", "saia jeans", "jaqueta jeans"],
  Infantil: ["menina", "menino", "bebê", "conjunto infantil"],
  "Íntima & Fitness": ["legging", "top", "pijama", "lingerie", "meia"],
  "Plus Size Feminina": ["vestido", "blusa", "calça", "conjunto"],
  "Evangélica": ["vestido longo", "saia longa", "blusa manga", "conjunto"],
  "Acessórios": ["bolsa", "cinto", "bijuteria", "carteira", "calçado"],
  "Perfumaria & Casa": ["perfume", "cosmético", "hidratante", "cama, mesa e banho"],
};

export const FAIXAS = [
  { id: "todas", label: "Qualquer preço" },
  { id: "a", label: "até R$ 50", test: (t) => t != null && t <= 50 },
  { id: "b", label: "R$ 50–100", test: (t) => t != null && t > 50 && t <= 100 },
  { id: "c", label: "R$ 100–200", test: (t) => t != null && t > 100 && t <= 200 },
  { id: "d", label: "R$ 200+", test: (t) => t != null && t > 200 },
];
