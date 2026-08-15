import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { PRIMAVERA_WHATSAPP, SHOPPING_INFO, SHOPPINGS, ICONES, SUGESTOES, FAIXAS } from "./lib/constants";
import { norm, iniciais, waLink, igLink, dataCurta, dataBR, maskCNPJ, maskTelefone, media, statusMarca } from "./lib/helpers";

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
        {m != null && <Stars value={m} />}
        <span className={"rt-status-txt " + st.tone}>{st.label}</span>
      </div>
    </button>
  );
}

function Sheet({ l, info, revs, session, perfil, onSaveInfo, onAddReview, onFav, isFav, onRequireLogin, onClose }) {
  const s = SHOPPINGS[l.sh];
  const rep = !l.exc;
  const wa = waLink(l.tel);
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
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Como funciona</h3>
        <ol className="rt-steps" style={{ marginTop: 14 }}>
          <li><span className="rt-step-n">01</span><div className="rt-step-txt">
            <b>Navegue à vontade</b><p>Segmento, faixa de preço, o que a comunidade já avaliou — isso fica sempre aberto pra qualquer lojista.</p>
          </div></li>
          <li><span className="rt-step-n">02</span><div className="rt-step-txt">
            <b>Fala direto no WhatsApp</b><p>Achou a loja certa? Um toque abre a conversa direto com ela — sem intermediário, sem esperar aprovação.</p>
          </div></li>
          <li><span className="rt-step-n">03</span><div className="rt-step-txt">
            <b>O fechamento é sempre direto</b><p>Entre você e a loja, do jeito que já funciona hoje — presencial ou com a consultora da marca.</p>
          </div></li>
          <li><span className="rt-step-n">04</span><div className="rt-step-txt">
            <b>A gente cuida do resto</b><p>Viagem quinzenal (Cianorte + Maringá, sem custo de passagem e hospedagem pro CNPJ), entrega sem frete na região e troca garantida na próxima viagem pra maioria das marcas.</p>
          </div></li>
        </ol>
        <div className="rt-quem">
          Há 10+ anos levando lojistas ao polo atacadista do Paraná. Viagens quinzenais + pedidos online direto das fábricas. Do embarque à entrega, a gente cuida de tudo.
        </div>
        <div style={{ marginTop: 16 }}><button className="rt-btn ghost" onClick={onClose}>Fechar</button></div>
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
  const [dataNasc, setDataNasc] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState("");

  const cnpjOk = cnpj.replace(/\D/g, "").length === 14;
  const telOk = telefone.replace(/\D/g, "").length >= 10;
  const criarOk = nome.trim() && nomeCompleto.trim() && cnpjOk && telOk && dataNasc && email && senha;

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
              <input className="rt-input" value={cnpj} placeholder="CNPJ" inputMode="numeric"
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))} />
              <input className="rt-input" value={telefone} placeholder="Telefone / WhatsApp" inputMode="tel"
                onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Data de nascimento</span>
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

function AdminPanel({ lojas, revsByLoja, onUpdateLoja, onDeleteReview, onClose }) {
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
            <AdminLojaRow key={l.id} l={l} salvando={salvandoId === l.id} onSave={(patch) => salvarLinha(l, patch)} />
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

function AdminLojaRow({ l, salvando, onSave }) {
  const [nome, setNome] = useState(l.nome);
  const [tel, setTel] = useState(l.tel || "");
  const [insta, setInsta] = useState(l.insta || "");
  const sujo = nome !== l.nome || tel !== (l.tel || "") || insta !== (l.insta || "");
  return (
    <div className="rt-mini-form" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 10, marginBottom: 10 }}>
      <input className="rt-input" value={nome} onChange={(e) => setNome(e.target.value)} />
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

  return (
    <div className="rt">
      <div className="rt-top">
        <div className="rt-top-wrap">
          <div className="rt-top-row">
            <div>
              <p className="rt-eyebrow">Primavera Tur</p>
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
            {perfil && perfil.papel === "admin"" && (
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
                {filtradas.map((l) => (
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
          <span className="rt-cta-txt"><b>Bora comprar no Paraná?</b>Viagem quinzenal com a Primavera Tur</span>
          <a className="rt-cta-btn" href={waCta || "#"} target={waCta ? "_blank" : undefined} rel="noreferrer">
            Falar agora
          </a>
        </div>
      </div>

      {aberta && (
        <Sheet key={aberta.id} l={aberta} info={colab[aberta.id]} revs={revs[aberta.id]}
          session={session} perfil={perfil} isFav={favs.includes(aberta.id)}
          onSaveInfo={salvarInfo} onAddReview={salvarReview} onFav={toggleFav}
          onRequireLogin={() => setMostrarAuth(true)} onClose={() => setAberta(null)} />
      )}

      {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} />}
      {mostrarPerfil && (
        <PerfilModal perfil={perfil} favsCount={favs.length} onSaveNome={salvarNomePerfil} onLogout={sair} onClose={() => setMostrarPerfil(false)} />
      )}
      {mostrarShoppings && <ShoppingsModal onClose={() => setMostrarShoppings(false)} />}
      {mostrarComo && <ComoFuncionaModal onClose={() => setMostrarComo(false)} />}
      {mostrarAdmin && (
        <AdminPanel lojas={lojas} revsByLoja={revs} onUpdateLoja={updateLojaAdmin} onDeleteReview={deleteReviewAdmin} onClose={() => setMostrarAdmin(false)} />
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
