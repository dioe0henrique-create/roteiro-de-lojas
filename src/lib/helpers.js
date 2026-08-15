export const norm = (s) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const iniciais = (s) =>
  (s || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const waLink = (tel) => {
  const d = (tel || "").replace(/\D/g, "");
  if (!d) return null;
  return "https://wa.me/" + (d.startsWith("55") ? d : "55" + d);
};

export const igLink = (h) => {
  if (!h) return null;
  const u = h.trim().replace(/^@/, "");
  if (!u) return null;
  return "https://instagram.com/" + u;
};

export const dataCurta = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch (e) {
    return "";
  }
};

export function media(revs) {
  if (!revs || !revs.length) return null;
  return revs.reduce((a, r) => a + r.nota, 0) / revs.length;
}

export function statusMarca(revs) {
  const n = (revs || []).length;
  if (n === 0) return { label: "Novo no roteiro", tone: "novo" };
  const m = media(revs);
  if (n >= 5 && m >= 4.5) return { label: "Preferida da galera", tone: "top" };
  if (m >= 4) return { label: "Bem avaliada", tone: "bom" };
  return { label: `${n} avaliação${n > 1 ? "ões" : ""}`, tone: "neutro" };
}
