export const norm = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const iniciais = (s) =>
  (s || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const waLink = (tel, msg) => {
  const d = (tel || "").replace(/\D/g, "");
  if (!d) return null;
  const base = "https://wa.me/" + (d.startsWith("55") ? d : "55" + d);
  return msg ? base + "?text=" + encodeURIComponent(msg) : base;
};

export const igLink = (h) => {
  if (!h) return null;
  const u = h.trim().replace(/^@/, "");
  if (!u) return null;
  return "https://instagram.com/" + u;
};

export const maskCNPJ = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 14);
  let out = d;
  if (d.length > 2) out = d.slice(0, 2) + "." + d.slice(2);
  if (d.length > 5) out = d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5);
  if (d.length > 8) out = d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5, 8) + "/" + d.slice(8);
  if (d.length > 12) out = d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5, 8) + "/" + d.slice(8, 12) + "-" + d.slice(12);
  return out;
};

export const maskTelefone = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 0) out = "(" + d.slice(0, 2);
  if (d.length >= 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length > 6 && d.length <= 10) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  if (d.length > 10) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  return out;
};

export const maskDoc = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    // CPF: 000.000.000-00
    let out = d;
    if (d.length > 3) out = d.slice(0, 3) + "." + d.slice(3);
    if (d.length > 6) out = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6);
    if (d.length > 9) out = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
    return out;
  }
  return maskCNPJ(d);
};

// 11 digitos = CPF valido de formato, 14 = CNPJ. Nao valida digito verificador.
export const docOk = (v) => {
  const n = (v || "").replace(/\D/g, "").length;
  return n === 11 || n === 14;
};

export const tipoDoc = (v) => {
  const n = (v || "").replace(/\D/g, "").length;
  if (n === 11) return "CPF";
  if (n === 14) return "CNPJ";
  return "";
};

export const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export const dataBR = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  } catch (e) {
    return "";
  }
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
