import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { APP_NOME, PRIMAVERA_WHATSAPP, SHOPPING_INFO, SHOPPINGS, ICONES, SUGESTOES, FAIXAS } from "./lib/constants";
import { norm, iniciais, waLink, igLink, dataCurta, dataBR, maskDoc, docOk, tipoDoc, UFS, maskTelefone, media, statusMarca } from "./lib/helpers";

// ---------------------------------------------------------------------------
// Peças pequenas de UI
// ---------------------------------------------------------------------------
function Stars({ value, size }) {
  const v = Math.round((value || 0) * 2) / 2;
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  let s = "★".repeat(full) + (half ? "⯪" : "");
  s = s.padEnd(5, "☆");
  return <span className={"rt-stars" + (size ? " " + size : "")}>{s}</span>;
}

function StarPicker({ value, onChange }) {
  return (
    <div className="rt-starpick" role="radiogroup" aria-label="Sua nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button" data-on={n <= value ? "1" : "0"}
          role="radio" aria-checked={n === value} aria-label={`${n} de 5`}
          onClick={() => onChange(n)}
        >{n <= value ? "★" : "☆"}</button>
      ))}
    </div>
  );
}

function Card({ l, info, revs, isFav, onOpen, onFav }) {
  const s = SHOPPINGS[l.sh];
  const st = statusMarca(revs);
  const m = media(revs);
  return (
    <button className="rt-card" onClick={() => onOpen(l)}>
      <button
        className="rt-fav" onClick={(e) => { e.stopPropagation(); onFav(l.id); }}
        aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >{isFav ? "❤️" : "🤍"}</button>

      <div className="rt-card-top">
        <div className="rt-avatar" style={{ "--shop": s.cor }}>{iniciais(l.nome)}</div>
        <div>
          <h3 className="rt-nome">{l.nome}</h3>
          <p className={"rt-vibe" + (info && info.v ? "" : " vazio")}>
            {info && info.v ? info.v : l.segmento}
          </p>
        </div>
      </div>

      <div className="rt-row2">
        <span className="rt-shop-tag" style={{ background: s.cor }}>{s.curto}</span>
        {info && info.t != null
          ? <span className="rt-ticket">R$ {info.t}<small> /peça</small></span>
          : <span className="rt-ticket vazio">sem preço ainda</span>}
      </div>

      {info && info.p && info.p.length > 0 && (
        <div className="rt-tags">
          {info.p.slice(0, 3).map((t) => <span className="rt-tag" key={t}>{t}</span>)}
          {info.p.length > 3 && <span className="rt-tag">+{info.p.length - 3}</span>}
        </div>
      )}

      <div className="rt-status">
        {l.destaque && <span className="rt-selo-ind">Indicada</span>}
        {m != null && <Stars value={m} />}
        <span className={"rt-status-txt " + st.tone}>{st.label}</span>
      </div>
    </button>
  );
}

function Sheet({ l, info, revs, session, perfil, onSaveInfo, onAddReview, onFav, isFav, onRequireLogin, onClose }) {
  const s = SHOPPINGS[l.sh];
  const rep = !l.exc;
  const quem = perfil
    ? `Oi! Sou ${perfil.nome_completo || perfil.nome}, da ${perfil.nome}` +
      (perfil.cidade ? `, de ${perfil.cidade}${perfil.estado ? "-" + perfil.estado : ""}` : "") +
      `. Vim pelo ${APP_NOME}. Queria saber sobre `
    : "";
  const wa = waLink(l.tel, quem ? quem + "as peças de vocês." : null);
  const ig = igLink(l.insta);
  const st = statusMarca(revs);
  const m = media(revs);
  const logado = !!session;

  const [editando, setEditando] = useState(false);
  const [ticket, setTicket] = useState(info && info.t != null ? String(info.t) : "");
  const [tipos, setTipos] = useState((info && info.p) || []);
  const [vibe, setVibe] = useState((info && info.v) || "");
  const [novo, setNovo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState("");

  const [nota, setNota] = useState(0);
  const [coment, setColement] = useState("");
  const [enviandoRev, setEnviandoRev] = useState(false);

  const sugs = (SUGESTOES[l.segmento] || []).filter((x) => !tipos.includes(x));

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const addTag = (t) => {
    const v = t.trim().toLowerCase();
    if (v && !tipos.includes(v)) setTipos([...tipos, v]);
    setNovo("");
  };

  const salvarInfo = async () => {
    setSalvando(true);
    const n = parseFloat(String(ticket).replace(",", "."));
    const ok = await onSaveInfo(l.id, { t: isNaN(n) ? null : Math.round(n), p: tipos, v: vibe.trim() });
    setSalvando(false);
    setSalvo(ok ? "Atualizado — obrigado por contribuir!" : "Não deu pra salvar agora, tenta de novo.");
    if (ok) setEditando(false);
    setTimeout(() => setSalvo(""), 2400);
  };

  const enviarReview = async () => {
    if (!nota) return;
    setEnviandoRev(true);
    const ok = await onAddReview(l.id, { nota, comentario: coment.trim() });
    setEnviandoRev(false);
    if (ok) { setNota(0); setColement(""); }
  };

  return (
    <div className="rt-backdrop" onClick={onClose}>
      <div className="rt-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={l.nome}>
        <div className="rt-hero" style={{ background: s.cor }}>
          <button className="rt-hero-x" onClick={onClose} aria-label="Fechar">×</button>
          <button className="rt-fav" style={{ position: "absolute", top: 14, left: 14 }}
            onClick={() => (logado ? onFav(l.id) : onRequireLogin())}
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            {isFav ? "❤️" : "🤍"}
          </button>
          <div className="rt-hero-av">{iniciais(l.nome)}</div>
          <h2 className="rt-hero-nome">{l.nome}</h2>
          <p className="rt-hero-seg">{l.segmento}{rep ? " · também em outro shopping" : ""}</p>
          <span className="rt-hero-shop">{s.nome}</span>
          <div className="rt-status-hero">
            {m != null ? <Stars value={m} size="lg" /> : <span style={{ fontSize: 12, opacity: .85 }}>Sem avaliações ainda</span>}
            <span className={"rt-status-txt " + st.tone} style={{ background: st.tone === "top" ? "rgba(255,255,255,.25)" : "transparent", color: "#fff", borderColor: "rgba(255,255,255,.6)" }}>
              {st.label}
            </span>
          </div>
        </div>

        <div className="rt-sh-body">
          <div>
            <p className="rt-block-lab">Personalidade da marca</p>
            {!editando && info && info.v && <p className="rt-vibe-box">"{info.v}"</p>}
            {!editando && !(info && info.v) && (
              <p className="rt-vibe-empty">Ninguém descreveu essa marca ainda. Seja a primeira pessoa a contar pra que ela serve.</p>
            )}
            {!editando && (
              <button className="rt-btn ghost" style={{ marginTop: 8, padding: "7px 10px", fontSize: 12 }}
                onClick={() => (logado ? setEditando(true) : onRequireLogin())}>
                {info && info.v ? "Editar informações" : "+ Descrever essa marca"}
              </button>
            )}

            {editando && (
              <div className="rt-mini-form">
                <input className="rt-input" value={vibe} placeholder='Ex: "descolada, pra quem gosta de básico atemporal"'
                  onChange={(e) => setVibe(e.target.value)} maxLength={90} />

                <div className="rt-money">
                  <span>Ticket médio R$</span>
                  <input className="rt-input" style={{ maxWidth: 100 }} inputMode="decimal" value={ticket}
                    placeholder="0" onChange={(e) => setTicket(e.target.value)} />
                  <span>/ peça</span>
                </div>

                <div>
                  {tipos.length > 0 && (
                    <div className="rt-tagrow" style={{ marginBottom: 6 }}>
                      {tipos.map((t) => (
                        <button key={t} className="rt-tagon" onClick={() => setTipos(tipos.filter((x) => x !== t))}>{t} ×</button>
                      ))}
                    </div>
                  )}
                  <input className="rt-input" value={novo} placeholder="Tipo de peça — Enter pra adicionar"
                    onChange={(e) => setNovo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(novo); } }} />
                  {sugs.length > 0 && (
                    <div className="rt-tagrow" style={{ marginTop: 6 }}>
                      {sugs.map((t) => <button key={t} className="rt-tagoff" onClick={() => addTag(t)}>+ {t}</button>)}
                    </div>
                  )}
                </div>

                <div className="rt-save-row">
                  <button className="rt-btn" onClick={salvarInfo} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
                  <button className="rt-btn ghost" onClick={() => setEditando(false)}>Cancelar</button>
                  {salvo && <span className="rt-saved-txt">{salvo}</span>}
                </div>
                <p className="rt-hint" style={{ margin: 0 }}>Isso fica visível pra todo mundo que usa o app.</p>
              </div>
            )}
          </div>

          <div className="rt-linkrow">
            {logado ? (
              <a className={"rt-link-btn wa" + (wa ? "" : " off")} href={wa || "#"} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            ) : (
              <button className="rt-link-btn wa" onClick={onRequireLogin}>Entrar pra falar no WhatsApp</button>
            )}
            <a className={"rt-link-btn ig" + (ig ? "" : " off")} href={ig || "#"} target="_blank" rel="noreferrer">
              Ver fotos no Instagram
            </a>
          </div>
          {logado && !wa && <p className="rt-hint" style={{ textAlign: "center", margin: 0 }}>Sem telefone no roteiro deste shopping.</p>}

          <div>
            <p className="rt-block-lab">Vitrine da loja</p>
            <div className="rt-vitrine-lock">
              <p className="tit">Em breve: novidades postadas pela própria loja</p>
              <p className="txt">Coleção nova, promoção, o que chegou — direto de quem é dono da marca. Essa área já está desenhada; falta a loja ter login próprio pra postar com segurança.</p>
              <div className="rt-vitrine-ex">
                <span className="lab">exemplo de como vai ficar</span>
                <p className="post">🆕 Chegou a coleção de inverno — vem ver</p>
              </div>
            </div>
          </div>

          <div>
            <p className="rt-block-lab">Avaliações da comunidade ({revs ? revs.length : 0})</p>
            {(!revs || revs.length === 0) && <p className="rt-nenhuma">Ainda sem avaliações. Se você já visitou, conta como foi.</p>}
            {revs && revs.slice().reverse().map((r) => (
              <div className="rt-review" key={r.id}>
                <div className="rt-review-top">
                  <span className="rt-review-autor">{r.autor}</span>
                  <span className="rt-review-data">{dataCurta(r.data)}</span>
                </div>
                <Stars value={r.nota} />
                {r.comentario && <p className="rt-review-txt">{r.comentario}</p>}
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--rule)", marginTop: 14, paddingTop: 14 }}>
              <p className="rt-block-lab">Avaliar esta loja</p>
              {logado ? (
                <div className="rt-mini-form">
                  <StarPicker value={nota} onChange={setNota} />
                  <textarea className="rt-area" value={coment} placeholder="Como foi o atendimento, o preço, a variedade…"
                    onChange={(e) => setColement(e.target.value)} />
                  <button className="rt-btn" disabled={!nota || enviandoRev} onClick={enviarReview}>
                    {enviandoRev ? "Enviando…" : "Enviar avaliação"}
                  </button>
                  <p className="rt-hint" style={{ margin: 0 }}>
                    Publicada como <b>{(perfil && perfil.nome) || "Lojista"}</b>, visível pra todo mundo.
                  </p>
                </div>
              ) : (
                <button className="rt-btn ghost" onClick={onRequireLogin}>Entrar pra avaliar</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingsModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Sobre os shoppings</h3>
        <p className="rt-hint">Toda viagem da Primavera Tur passa pelas duas cidades — Cianorte e Maringá — no mesmo pacote.</p>
        {SHOPPING_INFO.map((sh) => (
          <div className="rt-shopcard" key={sh.nome}>
            <div className="rt-shopcard-top"><h4>{sh.curto}</h4></div>
            <p className="cidade">{sh.cidade}</p>
            <span className="tag">{sh.tag}</span>
            <br />
            <a href={"https://instagram.com/" + sh.insta} target="_blank" rel="noreferrer">@{sh.insta} no Instagram →</a>
          </div>
        ))}
        <button className="rt-btn ghost" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function ComoFuncionaModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "flex-start", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Como funciona</h3>
        <p className="rt-hint">Do cadastro até a mercadoria chegar na sua loja.</p>
        <ol className="rt-steps" style={{ marginTop: 16 }}>
          <li><span className="rt-step-n">01</span><div className="rt-step-txt">
            <b>Você se cadastra</b>
            <p>Leva 1 minuto e libera as 336 marcas dos 3 shoppings do polo, com telefone
            e Instagram de cada uma. Sem custo.</p>
          </div></li>
          <li><span className="rt-step-n">02</span><div className="rt-step-txt">
            <b>Procura do seu jeito</b>
            <p>Por tipo de peça, faixa de preço, shopping ou segmento. Dá pra favoritar
            o que gostou e ver o que outras lojistas avaliaram.</p>
          </div></li>
          <li><span className="rt-step-n">03</span><div className="rt-step-txt">
            <b>Fala direto com a marca</b>
            <p>Um toque abre o WhatsApp da loja com sua apresentação pronta. Quem entende
            de preço, promoção e novidade é a própria marca — então você negocia com quem sabe.</p>
          </div></li>
          <li><span className="rt-step-n">04</span><div className="rt-step-txt">
            <b>A loja vende pra você</b>
            <p>A venda é direta, com nota no seu nome. Sem atravessador e sem intermediário
            no meio do preço.</p>
          </div></li>
          <li><span className="rt-step-n">05</span><div className="rt-step-txt">
            <b>Eu junto tudo e despacho</b>
            <p>Comprou de 3 marcas diferentes? Eu recolho em cada loja, monto um pacote só
            e envio direto do polo pro seu endereço. Você não precisa vir até aqui.</p>
          </div></li>
          <li><span className="rt-step-n">06</span><div className="rt-step-txt">
            <b>Quer ajuda pra escolher?</b>
            <p>Peça a curadoria grátis no botão lá embaixo. Eu olho o perfil da sua loja e
            monto uma lista com as marcas que mais fazem sentido pro seu público.</p>
          </div></li>
        </ol>
        <div className="rt-quem">
          <b>Prefere ir pessoalmente?</b> A viagem quinzenal continua acontecendo —
          Cianorte e Maringá no mesmo pacote. Chama no WhatsApp que eu te explico.
        </div>
        <div style={{ marginTop: 16 }}><button className="rt-btn ghost" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Curadoria assistida (funil)
// ---------------------------------------------------------------------------
const CUR_PERGUNTAS = [
  { id: "faixa", multi: false, titulo: "Quanto você compra por mês, mais ou menos?",
    ops: ["Até R$ 5 mil", "R$ 5 a 10 mil", "R$ 10 a 20 mil", "Mais de R$ 20 mil", "Ainda não compro"] },
  { id: "canal", multi: false, titulo: "Como você vende hoje?",
    ops: ["Loja física", "Física + online", "Só online", "Sacoleira / pronta-entrega", "WhatsApp e redes"] },
  { id: "onde", multi: true, titulo: "Onde você compra hoje?",
    ops: ["Polo do Paraná", "Brás (SP)", "Goiânia", "Agreste (PE)", "Online direto das marcas", "Representante me visita", "Ainda não compro"] },
  { id: "segmentos", multi: true, titulo: "O que mais sai na sua loja?",
    ops: ["Feminina", "Masculina", "Jeans", "Infantil", "Plus Size Feminina", "Evangélica", "Íntima & Fitness", "Acessórios", "Perfumaria & Casa"] },
  { id: "tempo", multi: false, titulo: "Há quanto tempo tem a loja?",
    ops: ["Começando agora", "Até 1 ano", "1 a 3 anos", "Mais de 3 anos"] },
  { id: "frete", multi: false, titulo: "Costuma pagar frete?",
    ops: ["Sim, sempre", "Às vezes", "Nunca paguei"] },
  { id: "guia", multi: false, titulo: "Já tem alguém que te acompanha nas compras?",
    ops: ["Não, vou por conta", "Sim, tenho um guia", "Vou com excursão"] },
];

function CuradoriaModal({ perfil, onEnviar, onClose }) {
  const [resp, setResp] = useState({});
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const marcar = (q, op) => {
    setResp((r) => {
      if (!q.multi) return { ...r, [q.id]: op };
      const atual = r[q.id] || [];
      return { ...r, [q.id]: atual.includes(op) ? atual.filter((x) => x !== op) : [...atual, op] };
    });
  };
  const ativo = (q, op) => {
    const v = resp[q.id];
    return q.multi ? (v || []).includes(op) : v === op;
  };
  const respondidas = CUR_PERGUNTAS.filter((q) => {
    const v = resp[q.id];
    return q.multi ? (v || []).length > 0 : !!v;
  }).length;

  const enviar = async () => {
    setEnviando(true);
    const ok = await onEnviar({ ...resp, observacao: obs.trim() });
    setEnviando(false);
    if (ok) setPronto(true);
  };

  if (pronto) {
    return (
      <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
        <div className="rt-modal-c" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>💛</div>
          <h3 className="rt-modal-t">Recebi!</h3>
          <p className="rt-hint" style={{ fontSize: 14 }}>
            Vou olhar seu perfil com calma e te chamo no WhatsApp em até 24h com as marcas
            que mais fazem sentido pra sua loja.
          </p>
          <button className="rt-btn" onClick={onClose}>Voltar pro roteiro</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rt-backdrop" style={{ alignItems: "flex-start", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Receba uma curadoria grátis</h3>
        <p className="rt-hint" style={{ fontSize: 13 }}>
          Me conta como é sua loja e eu monto uma lista com as marcas mais lucrativas pro seu
          público — sem custo, sem compromisso. Leva 1 minuto, tudo em toques.
        </p>

        <div className="rt-cur-prog">
          <div className="rt-cur-prog-bar" style={{ width: `${(respondidas / CUR_PERGUNTAS.length) * 100}%` }} />
        </div>

        {CUR_PERGUNTAS.map((q) => (
          <div className="rt-cur-q" key={q.id}>
            <p className="rt-cur-tit">
              {q.titulo}
              {q.multi && <span className="rt-cur-multi">pode marcar mais de uma</span>}
            </p>
            <div className="rt-cur-ops">
              {q.ops.map((op) => (
                <button key={op} className="rt-cur-op" data-on={ativo(q, op) ? "1" : "0"}
                  onClick={() => marcar(q, op)}>{op}</button>
              ))}
            </div>
          </div>
        ))}

        <div className="rt-cur-q">
          <p className="rt-cur-tit">Quer contar mais alguma coisa? <span className="rt-cur-multi">opcional</span></p>
          <textarea className="rt-area" value={obs} placeholder="O que você procura, dificuldade que tem, o que não quer…"
            onChange={(e) => setObs(e.target.value)} />
        </div>

        <div className="rt-save-row" style={{ marginTop: 14 }}>
          <button className="rt-btn" onClick={enviar} disabled={enviando || respondidas < 3}>
            {enviando ? "Enviando…" : "Quero minha curadoria"}
          </button>
          <button className="rt-btn ghost" onClick={onClose}>Agora não</button>
        </div>
        {respondidas < 3 && (
          <p className="rt-hint" style={{ margin: "8px 0 0" }}>Responde pelo menos 3 pra eu conseguir te ajudar direito.</p>
        )}
        <p className="rt-hint" style={{ margin: "10px 0 0", fontSize: 11 }}>
          Vou usar seus dados de cadastro ({(perfil && perfil.nome) || "sua loja"}) pra te chamar no WhatsApp.
        </p>
      </div>
    </div>
  );
}

function AuthModal({ onClose }) {
  const [modo, setModo] = useState("entrar"); // entrar | criar
  const [nome, setNome] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState("");

  const cnpjOk = docOk(cnpj);
  const telOk = telefone.replace(/\D/g, "").length >= 10;
  const criarOk = nome.trim() && nomeCompleto.trim() && cnpjOk && telOk
    && cidade.trim() && estado && email && senha;

  const enviar = async () => {
    setCarregando(true);
    setMsg("");
    if (modo === "criar") {
      if (!criarOk) {
        setCarregando(false);
        setMsg("Preenche todos os campos certinho pra gente conseguir criar sua conta.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(), password: senha,
        options: {
          data: {
            nome: nome.trim() || "Lojista",
            nome_completo: nomeCompleto.trim(),
            cnpj: cnpj.trim(),
            telefone: telefone.trim(),
            cidade: cidade.trim(),
            estado: estado,
            data_nascimento: dataNasc,
          },
        },
      });
      setCarregando(false);
      if (error) { setMsg(error.message); return; }
      setMsg("Conta criada! Se a confirmação por e-mail estiver ativa no seu Supabase, confirme o e-mail antes de entrar. Depois é só voltar aqui e entrar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      setCarregando(false);
      if (error) { setMsg(error.message); return; }
      onClose();
    }
  };

  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">{modo === "entrar" ? "Entrar" : "Criar conta"}</h3>
        <p className="rt-hint">
          {modo === "entrar" ? "Pra falar com as lojas no WhatsApp, avaliar e favoritar." : "Leva menos de um minuto."}
        </p>
        <div className="rt-mini-form">
          {modo === "criar" && (
            <>
              <input className="rt-input" value={nome} placeholder="Nome da sua loja"
                onChange={(e) => setNome(e.target.value)} />
              <input className="rt-input" value={nomeCompleto} placeholder="Seu nome completo"
                onChange={(e) => setNomeCompleto(e.target.value)} />
              <div>
                <input className="rt-input" value={cnpj} placeholder="CNPJ ou CPF" inputMode="numeric"
                  onChange={(e) => setCnpj(maskDoc(e.target.value))} />
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginTop: 4 }}>
                  {cnpj ? (cnpjOk ? `✓ ${tipoDoc(cnpj)}` : "Continue digitando…")
                        : "Ainda não tem CNPJ? Pode usar seu CPF."}
                </span>
              </div>
              <input className="rt-input" value={telefone} placeholder="Telefone / WhatsApp" inputMode="tel"
                onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
              <div style={{ display: "flex", gap: 8 }}>
                <input className="rt-input" value={cidade} placeholder="Sua cidade" style={{ flex: 1 }}
                  onChange={(e) => setCidade(e.target.value)} />
                <select className="rt-input" value={estado} style={{ maxWidth: 92 }}
                  onChange={(e) => setEstado(e.target.value)}>
                  <option value="">UF</option>
                  {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Data de nascimento <em style={{ fontStyle: "normal", opacity: .7 }}>(opcional)</em>
                </span>
                <input className="rt-input" type="date" value={dataNasc}
                  onChange={(e) => setDataNasc(e.target.value)} />
              </div>
            </>
          )}
          <input className="rt-input" type="email" value={email} placeholder="seu@email.com"
            onChange={(e) => setEmail(e.target.value)} />
          <input className="rt-input" type="password" value={senha} placeholder="Senha"
            onChange={(e) => setSenha(e.target.value)} />
          <div className="rt-save-row">
            <button className="rt-btn" onClick={enviar} disabled={carregando || !email || !senha || (modo === "criar" && !criarOk)}>
              {carregando ? "Um instante…" : modo === "entrar" ? "Entrar" : "Criar conta"}
            </button>
            <button className="rt-btn ghost" onClick={() => { setModo(modo === "entrar" ? "criar" : "entrar"); setMsg(""); }}>
              {modo === "entrar" ? "Criar conta" : "Já tenho conta"}
            </button>
          </div>
          {msg && <p className="rt-hint" style={{ margin: 0 }}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}

function PerfilModal({ perfil, favsCount, onSaveNome, onLogout, onClose }) {
  const [nome, setNome] = useState((perfil && perfil.nome) || "");
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Seu perfil</h3>
        <p className="rt-hint">Esse nome aparece junto das avaliações que você publicar.</p>
        <input className="rt-input" value={nome} placeholder="Ex: Ana, da Boutique Flor"
          onChange={(e) => setNome(e.target.value)} autoFocus />
        <p className="rt-hint" style={{ marginTop: 10 }}><b>{favsCount}</b> loja{favsCount === 1 ? "" : "s"} favoritada{favsCount === 1 ? "" : "s"}.</p>
        <div className="rt-save-row" style={{ marginTop: 8 }}>
          <button className="rt-btn" onClick={() => onSaveNome(nome.trim())}>Salvar nome</button>
          <button className="rt-btn ghost" onClick={onLogout}>Sair</button>
          <button className="rt-btn ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ lojas, revsByLoja, onUpdateLoja, onDeleteReview, onDestaque, onClose }) {
  const [salvandoId, setSalvandoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [buscaUser, setBuscaUser] = useState("");
  const [usuarios, setUsuarios] = useState(null); // null = carregando
  const filtradas = lojas.filter((l) => norm(l.nome).includes(norm(busca)));

  useEffect(() => {
    supabase.from("perfis").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      setUsuarios(error ? [] : data);
    });
  }, []);

  const usuariosFiltrados = (usuarios || []).filter((u) =>
    norm(u.nome).includes(norm(buscaUser)) ||
    norm(u.nome_completo || "").includes(norm(buscaUser)) ||
    (u.cnpj || "").includes(buscaUser)
  );

  const salvarLinha = async (l, patch) => {
    setSalvandoId(l.id);
    await onUpdateLoja(l.id, patch);
    setSalvandoId(null);
  };

  const todasReviews = useMemo(() => {
    const out = [];
    Object.entries(revsByLoja).forEach(([lojaId, lista]) => {
      const l = lojas.find((x) => x.id === lojaId);
      lista.forEach((r) => out.push({ ...r, lojaNome: l ? l.nome : lojaId }));
    });
    return out.sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [revsByLoja, lojas]);

  return (
    <div className="rt-backdrop" style={{ alignItems: "flex-start", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Painel Admin</h3>

        <p className="rt-block-lab" style={{ marginTop: 16 }}>Lojas ({lojas.length})</p>
        <input className="rt-input" value={busca} placeholder="Buscar loja para editar…" onChange={(e) => setBusca(e.target.value)} />
        <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 10 }}>
          {filtradas.slice(0, 40).map((l) => (
            <AdminLojaRow key={l.id} l={l} salvando={salvandoId === l.id}
              onSave={(patch) => salvarLinha(l, patch)} onDestaque={onDestaque} />
          ))}
          {filtradas.length > 40 && <p className="rt-hint">Mostrando as 40 primeiras — refine a busca pra achar outras.</p>}
        </div>

        <p className="rt-block-lab" style={{ marginTop: 20 }}>Avaliações recentes ({todasReviews.length})</p>
        <div style={{ maxHeight: 260, overflowY: "auto" }}>
          {todasReviews.slice(0, 30).map((r) => (
            <div className="rt-review" key={r.id}>
              <div className="rt-review-top">
                <span className="rt-review-autor">{r.autor} → {r.lojaNome}</span>
                <span className="rt-review-data">{dataCurta(r.data)}</span>
              </div>
              <Stars value={r.nota} />
              {r.comentario && <p className="rt-review-txt">{r.comentario}</p>}
              <button className="rt-infolink" style={{ color: "var(--red)" }} onClick={() => onDeleteReview(r.id, r.loja_id)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <p className="rt-block-lab" style={{ marginTop: 20 }}>
          Lojistas cadastrados (CRM) {usuarios ? `(${usuarios.length})` : ""}
        </p>
        <input className="rt-input" value={buscaUser} placeholder="Buscar por nome ou CNPJ…"
          onChange={(e) => setBuscaUser(e.target.value)} />
        <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 10 }}>
          {usuarios === null && <p className="rt-hint">Carregando…</p>}
          {usuarios !== null && usuariosFiltrados.length === 0 && <p className="rt-hint">Ninguém encontrado.</p>}
          {usuariosFiltrados.slice(0, 60).map((u) => (
            <div className="rt-review" key={u.id}>
              <div className="rt-review-top">
                <span className="rt-review-autor">{u.nome}{u.papel === "admin" ? " · admin" : ""}</span>
                <span className="rt-review-data">{dataBR(u.created_at ? u.created_at.slice(0, 10) : null) || dataCurta(u.created_at)}</span>
              </div>
              <p className="rt-review-txt" style={{ margin: "4px 0 0" }}>
                {u.nome_completo || <em style={{ color: "var(--muted)" }}>sem nome completo</em>}
                {u.cnpj ? ` · CNPJ ${u.cnpj}` : ""}
                {u.telefone ? ` · ${u.telefone}` : ""}
                {u.data_nascimento ? ` · nasc. ${dataBR(u.data_nascimento)}` : ""}
              </p>
            </div>
          ))}
          {usuariosFiltrados.length > 60 && <p className="rt-hint">Mostrando os 60 primeiros — refine a busca pra achar outros.</p>}
        </div>

        <div style={{ marginTop: 16 }}><button className="rt-btn ghost" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
}

function AdminLojaRow({ l, salvando, onSave, onDestaque }) {
  const [nome, setNome] = useState(l.nome);
  const [tel, setTel] = useState(l.tel || "");
  const [insta, setInsta] = useState(l.insta || "");
  const sujo = nome !== l.nome || tel !== (l.tel || "") || insta !== (l.insta || "");
  return (
    <div className="rt-mini-form" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 10, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="rt-star-btn" data-on={l.destaque ? "1" : "0"}
          title={l.destaque ? "Tirar dos destaques" : "Destacar na primeira página"}
          onClick={() => onDestaque(l)}>{l.destaque ? "★" : "☆"}</button>
        <input className="rt-input" value={nome} style={{ flex: 1 }} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="rt-input" value={tel} placeholder="Telefone" onChange={(e) => setTel(e.target.value)} />
        <input className="rt-input" value={insta} placeholder="Instagram" onChange={(e) => setInsta(e.target.value)} />
      </div>
      {sujo && (
        <button className="rt-btn" style={{ padding: "6px 10px", fontSize: 12 }} disabled={salvando}
          onClick={() => onSave({ nome, telefone: tel || null, instagram: insta || null })}>
          {salvando ? "Salvando…" : "Salvar essa loja"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function PortaEntrada({ onEntrar }) {
  return (
    <div className="rt-porta">
      <div className="rt-porta-in">
        <p className="rt-eyebrow">Arara</p>
        <h1 className="rt-porta-tit">As 336 marcas do polo,<br />na palma da sua mão.</h1>
        <p className="rt-porta-sub">
          Master Cianorte, Paraná Moda Park e Vest Sul reunidos num roteiro só —
          com contato direto de cada marca, tipo de peça e faixa de preço.
        </p>
        <ul className="rt-porta-lista">
          <li>Fale direto com a marca pelo WhatsApp</li>
          <li>Filtre por segmento, preço e shopping</li>
          <li>Peça uma curadoria grátis pra sua loja</li>
          <li>Compre de várias marcas e receba num pacote só</li>
        </ul>
        <button className="rt-porta-btn" onClick={onEntrar}>Criar minha conta grátis</button>
        <p className="rt-porta-pe">Leva 1 minuto · Sem custo · Já tem conta? É o mesmo botão.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = ainda checando
  const [perfil, setPerfil] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [colab, setColab] = useState({});
  const [revs, setRevs] = useState({});
  const [favs, setFavs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("todos");
  const [shop, setShop] = useState("todos");
  const [faixa, setFaixa] = useState("todas");
  const [soFav, setSoFav] = useState(false);
  const [aberta, setAberta] = useState(null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarShoppings, setMostrarShoppings] = useState(false);
  const [mostrarComo, setMostrarComo] = useState(false);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [mostrarCuradoria, setMostrarCuradoria] = useState(false);
  const [csv, setCsv] = useState(null);

  // sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const mapLoja = (l) => ({
    id: l.id, nome: l.nome, segmento: l.segmento, sh: l.shopping,
    tel: l.telefone || null, insta: l.instagram || null, exc: !!l.exclusiva,
    destaque: !!l.destaque, ordem: l.destaque_ordem == null ? 999 : l.destaque_ordem,
  });

  const carregarLojas = useCallback(async (logado) => {
    const { data, error } = logado
      ? await supabase.from("lojas").select("*").order("nome")
      : await supabase.from("lojas_publicas").select("*").order("nome");
    if (!error && data) setLojas(data.map(mapLoja));
  }, []);

  const carregarColab = useCallback(async () => {
    const { data, error } = await supabase.from("loja_colab").select("*");
    if (!error && data) {
      const m = {};
      data.forEach((c) => { m[c.loja_id] = { t: c.ticket_medio, p: c.tipos_peca || [], v: c.personalidade }; });
      setColab(m);
    }
  }, []);

  const carregarRevs = useCallback(async () => {
    const { data, error } = await supabase.from("avaliacoes").select("*").order("created_at");
    if (!error && data) {
      const m = {};
      data.forEach((r) => {
        (m[r.loja_id] = m[r.loja_id] || []).push({
          id: r.id, loja_id: r.loja_id, autor: r.autor_nome, nota: r.nota, comentario: r.comentario, data: r.created_at,
        });
      });
      setRevs(m);
    }
  }, []);

  const carregarPerfil = useCallback(async (uid) => {
    const { data } = await supabase.from("perfis").select("*").eq("id", uid).single();
    if (data) setPerfil(data);
  }, []);

  const carregarFavs = useCallback(async (uid) => {
    const { data } = await supabase.from("favoritos").select("loja_id").eq("usuario_id", uid);
    if (data) setFavs(data.map((f) => f.loja_id));
  }, []);

  // recarrega tudo quando a sessão muda
  useEffect(() => {
    if (session === undefined) return; // ainda checando
    (async () => {
      setCarregando(true);
      await Promise.all([carregarLojas(!!session), carregarColab(), carregarRevs()]);
      if (session) {
        await Promise.all([carregarPerfil(session.user.id), carregarFavs(session.user.id)]);
      } else {
        setPerfil(null);
        setFavs([]);
      }
      setCarregando(false);
    })();
  }, [session, carregarLojas, carregarColab, carregarRevs, carregarPerfil, carregarFavs]);

  const salvarInfo = useCallback(async (lojaId, patch) => {
    if (!session) return false;
    const { error } = await supabase.from("loja_colab").upsert({
      loja_id: lojaId, ticket_medio: patch.t, tipos_peca: patch.p, personalidade: patch.v,
      atualizado_por: session.user.id, atualizado_em: new Date().toISOString(),
    });
    if (error) { setErro(true); return false; }
    setColab((prev) => ({ ...prev, [lojaId]: patch }));
    setErro(false);
    return true;
  }, [session]);

  const salvarReview = useCallback(async (lojaId, { nota, comentario }) => {
    if (!session) return false;
    const { data, error } = await supabase.from("avaliacoes").insert({
      loja_id: lojaId, autor_id: session.user.id,
      autor_nome: (perfil && perfil.nome) || "Lojista", nota, comentario,
    }).select().single();
    if (error) { setErro(true); return false; }
    setRevs((prev) => ({
      ...prev,
      [lojaId]: [...(prev[lojaId] || []), {
        id: data.id, loja_id: lojaId, autor: data.autor_nome, nota: data.nota, comentario: data.comentario, data: data.created_at,
      }],
    }));
    setErro(false);
    return true;
  }, [session, perfil]);

  const toggleFav = useCallback(async (lojaId) => {
    if (!session) { setMostrarAuth(true); return; }
    const uid = session.user.id;
    if (favs.includes(lojaId)) {
      await supabase.from("favoritos").delete().eq("usuario_id", uid).eq("loja_id", lojaId);
      setFavs((f) => f.filter((x) => x !== lojaId));
    } else {
      await supabase.from("favoritos").insert({ usuario_id: uid, loja_id: lojaId });
      setFavs((f) => [...f, lojaId]);
    }
  }, [session, favs]);

  const enviarCuradoria = async (dados) => {
    if (!session) { setMostrarAuth(true); return false; }
    const { error } = await supabase.from("consultorias").insert({
      usuario_id: session.user.id,
      faixa_compra: dados.faixa || null,
      canal_venda: dados.canal || null,
      onde_compra: dados.onde || [],
      segmentos: dados.segmentos || [],
      tempo_loja: dados.tempo || null,
      frete: dados.frete || null,
      guia: dados.guia || null,
      observacao: dados.observacao || null,
    });
    if (error) { setErro(true); return false; }
    setErro(false);
    return true;
  };

  const salvarNomePerfil = async (nome) => {
    if (!session) return;
    await supabase.from("perfis").update({ nome: nome || "Lojista" }).eq("id", session.user.id);
    setPerfil((p) => ({ ...p, nome: nome || "Lojista" }));
    setMostrarPerfil(false);
  };

  const sair = async () => {
    await supabase.auth.signOut();
    setMostrarPerfil(false);
  };

  const updateLojaAdmin = async (id, patch) => {
    const { error } = await supabase.from("lojas").update(patch).eq("id", id);
    if (!error) setLojas((prev) => prev.map((l) => (l.id === id ? { ...l, nome: patch.nome, tel: patch.telefone, insta: patch.instagram } : l)));
    return !error;
  };

  const toggleDestaque = async (l) => {
    const novo = !l.destaque;
    const ordem = novo ? lojas.filter((x) => x.destaque).length + 1 : null;
    const { error } = await supabase.from("lojas")
      .update({ destaque: novo, destaque_ordem: ordem }).eq("id", l.id);
    if (!error) {
      setLojas((prev) => prev.map((x) => (x.id === l.id
        ? { ...x, destaque: novo, ordem: ordem == null ? 999 : ordem } : x)));
    }
  };

  const deleteReviewAdmin = async (reviewId, lojaId) => {
    const { error } = await supabase.from("avaliacoes").delete().eq("id", reviewId);
    if (!error) setRevs((prev) => ({ ...prev, [lojaId]: (prev[lojaId] || []).filter((r) => r.id !== reviewId) }));
  };

  const SEGMENTOS = useMemo(
    () => [...new Set(lojas.map((l) => l.segmento))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [lojas]
  );

  const filtradas = useMemo(() => {
    const q = norm(busca);
    const f = FAIXAS.find((x) => x.id === faixa);
    return lojas.filter((l) => {
      const d = colab[l.id];
      if (q) {
        const tagsMatch = d && d.p && d.p.some((t) => norm(t).includes(q));
        const vibeMatch = d && d.v && norm(d.v).includes(q);
        if (!norm(l.nome).includes(q) && !norm(l.segmento).includes(q) && !tagsMatch && !vibeMatch) return false;
      }
      if (catAtiva !== "todos" && l.segmento !== catAtiva) return false;
      if (shop !== "todos" && l.sh !== shop) return false;
      if (f && f.test && !f.test(d ? d.t : null)) return false;
      if (soFav && !favs.includes(l.id)) return false;
      return true;
    });
  }, [busca, catAtiva, shop, faixa, soFav, colab, favs, lojas]);

  // Destaques sobem pro topo, mas so na navegacao livre. Se ela buscou ou
  // filtrou, manda o que ela procurou.
  const navegandoLivre = !busca && catAtiva === "todos" && shop === "todos" && faixa === "todas" && !soFav;
  const ordenadas = useMemo(() => {
    if (!navegandoLivre) return filtradas;
    return [...filtradas].sort((a, b) => {
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      if (a.destaque && b.destaque) return a.ordem - b.ordem;
      return 0;
    });
  }, [filtradas, navegandoLivre]);

  const totalAvaliacoes = useMemo(() => Object.values(revs).reduce((s, r) => s + r.length, 0), [revs]);
  const lojistasAtivos = useMemo(() => {
    const nomes = new Set();
    Object.values(revs).forEach((lista) => lista.forEach((r) => nomes.add(norm(r.autor))));
    return nomes.size;
  }, [revs]);

  const gerarCsv = () => {
    const linhas = [["Loja", "Segmento", "Shopping", "Telefone", "WhatsApp", "Instagram", "Ticket Medio", "Tipo de Pecas", "Personalidade", "Nota Media", "Avaliacoes"]];
    lojas.forEach((l) => {
      const d = colab[l.id] || {}; const r = revs[l.id] || []; const m = media(r);
      linhas.push([
        l.nome, l.segmento, SHOPPINGS[l.sh].nome, l.tel || "", waLink(l.tel) || "",
        l.insta || "", d.t != null ? d.t : "", (d.p || []).join("; "), d.v || "",
        m != null ? m.toFixed(1) : "", r.length,
      ]);
    });
    setCsv(linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(csv); }
    catch (e) { const ta = document.getElementById("rt-csv-ta"); if (ta) { ta.select(); document.execCommand("copy"); } }
  };

  const waCta = PRIMAVERA_WHATSAPP
    ? `https://wa.me/${PRIMAVERA_WHATSAPP}?text=${encodeURIComponent("Oi! Vi o roteiro de lojas e quero ir comprar no Paraná com a Primavera Tur.")}`
    : null;

  if (session === undefined) {
    return <div className="rt"><div className="rt-load">carregando…</div></div>;
  }
  if (!session) {
    return (
      <div className="rt">
        <PortaEntrada onEntrar={() => setMostrarAuth(true)} />
        {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} />}
      </div>
    );
  }

  return (
    <div className="rt">
      <div className="rt-top">
        <div className="rt-top-wrap">
          <div className="rt-top-row">
            <div>
              <p className="rt-eyebrow">Arara</p>
              <h1 className="rt-title">O que você procura hoje?</h1>
            </div>
            <button className="rt-perfil-btn" onClick={() => (session ? setMostrarPerfil(true) : setMostrarAuth(true))}>
              {session ? (perfil ? perfil.nome.split(" ")[0] : "…") : "Entrar"}
            </button>
          </div>
          {!carregando && (
            <p className="rt-stat">
              <b>{lojas.length}</b> marcas no roteiro · <b>{totalAvaliacoes}</b> avaliações
              {lojistasAtivos > 0 && <> · <b>{lojistasAtivos}</b> lojista{lojistasAtivos > 1 ? "s" : ""} avaliando</>}
            </p>
          )}
          <div className="rt-infolinks">
            <button className="rt-infolink" onClick={() => setMostrarShoppings(true)}>Sobre os shoppings</button>
            <button className="rt-infolink" onClick={() => setMostrarComo(true)}>Como funciona</button>
            {perfil && perfil.papel === "admin" && (
              <button className="rt-infolink" onClick={() => setMostrarAdmin(true)}>Painel Admin</button>
            )}
          </div>

          <div className="rt-search">
            <input value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="camisa, vestido, jeans skinny, nome da marca…" aria-label="Buscar" />
            {busca ? <button className="rt-clear" onClick={() => setBusca("")} aria-label="Limpar">×</button>
              : <span className="rt-search-ico">⌕</span>}
          </div>

          <div className="rt-cats">
            <button className="rt-cat" data-on={catAtiva === "todos" ? "1" : "0"} onClick={() => setCatAtiva("todos")}>
              <span className="rt-cat-ico">🗂️</span><span>Todas</span>
            </button>
            {SEGMENTOS.map((s) => (
              <button key={s} className="rt-cat" data-on={catAtiva === s ? "1" : "0"} onClick={() => setCatAtiva(s)}>
                <span className="rt-cat-ico">{ICONES[s] || "🏷️"}</span><span>{s}</span>
              </button>
            ))}
          </div>

          <div className="rt-filters">
            <button className="rt-chip" data-on={shop === "todos" ? "1" : "0"} onClick={() => setShop("todos")}>Os 3 shoppings</button>
            {Object.entries(SHOPPINGS).map(([k, v]) => (
              <button key={k} className="rt-chip" data-on={shop === k ? "1" : "0"} onClick={() => setShop(k)}>
                <span className="dot" style={{ background: v.cor }} />{v.curto}
              </button>
            ))}
            {FAIXAS.map((f) => (
              <button key={f.id} className="rt-chip" data-on={faixa === f.id ? "1" : "0"} onClick={() => setFaixa(f.id)}>{f.label}</button>
            ))}
            <button className="rt-chip" data-on={soFav ? "1" : "0"} onClick={() => (session ? setSoFav(!soFav) : setMostrarAuth(true))}>❤️ Favoritas</button>
          </div>
        </div>
      </div>

      <div className="rt-wrap">
        {carregando ? (
          <div className="rt-load">carregando o roteiro…</div>
        ) : (
          <>
            <div className="rt-meta">
              <span className="rt-count">
                <b>{filtradas.length}</b> {filtradas.length === 1 ? "marca" : "marcas"}
                {erro && " · não deu pra salvar a última alteração"}
              </span>
              <button className="rt-export" onClick={gerarCsv}>Exportar planilha</button>
            </div>

            {filtradas.length === 0 ? (
              <div className="rt-vazio-busca">
                <p>Nenhuma marca encontrada.</p>
                <span>Tenta outra palavra ou tira um filtro.</span>
              </div>
            ) : (
              <div className="rt-feed">
                {ordenadas.map((l) => (
                  <Card key={l.id} l={l} info={colab[l.id]} revs={revs[l.id]}
                    isFav={favs.includes(l.id)} onOpen={setAberta} onFav={toggleFav} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rt-cta">
        <div className="rt-cta-in">
          <span className="rt-cta-txt">
            <b>Não sabe por onde começar?</b>
            Eu monto a lista das marcas certas pra sua loja
          </span>
          <div className="rt-cta-acoes">
            <button className="rt-cta-btn" onClick={() => (session ? setMostrarCuradoria(true) : setMostrarAuth(true))}>
              Quero minha curadoria
            </button>
            <a className="rt-cta-wa" href={waCta || "#"} target={waCta ? "_blank" : undefined}
               rel="noreferrer" aria-label="Tirar dúvida no WhatsApp" title="Tirar dúvida no WhatsApp">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.21 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {aberta && (
        <Sheet key={aberta.id} l={aberta} info={colab[aberta.id]} revs={revs[aberta.id]}
          session={session} perfil={perfil} isFav={favs.includes(aberta.id)}
          onSaveInfo={salvarInfo} onAddReview={salvarReview} onFav={toggleFav}
          onRequireLogin={() => setMostrarAuth(true)} onClose={() => setAberta(null)} />
      )}

      {mostrarCuradoria && (
        <CuradoriaModal perfil={perfil} onEnviar={enviarCuradoria} onClose={() => setMostrarCuradoria(false)} />
      )}
      {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} />}
      {mostrarPerfil && (
        <PerfilModal perfil={perfil} favsCount={favs.length} onSaveNome={salvarNomePerfil} onLogout={sair} onClose={() => setMostrarPerfil(false)} />
      )}
      {mostrarShoppings && <ShoppingsModal onClose={() => setMostrarShoppings(false)} />}
      {mostrarComo && <ComoFuncionaModal onClose={() => setMostrarComo(false)} />}
      {mostrarAdmin && (
        <AdminPanel lojas={lojas} revsByLoja={revs} onUpdateLoja={updateLojaAdmin}
          onDeleteReview={deleteReviewAdmin} onDestaque={toggleDestaque} onClose={() => setMostrarAdmin(false)} />
      )}

      {csv !== null && (
        <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setCsv(null)}>
          <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
            <h3 className="rt-modal-t">Exportar para planilha</h3>
            <p className="rt-hint">Copie e cole no Excel ou Google Sheets — inclui tudo que a comunidade já preencheu.</p>
            <textarea id="rt-csv-ta" className="rt-csv" readOnly value={csv} />
            <div className="rt-save-row">
              <button className="rt-btn" onClick={copiar}>Copiar</button>
              <button className="rt-btn ghost" onClick={() => setCsv(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
