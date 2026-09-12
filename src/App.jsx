import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import StreamingText from "./components/ui/streaming-text.jsx";
import { APP_NOME, PRIMAVERA_WHATSAPP, SHOPPING_INFO, SHOPPINGS, ICONES, SUGESTOES, FAIXAS } from "./lib/constants";
import { norm, iniciais, waLink, igLink, dataCurta, dataBR, maskDoc, docOk, tipoDoc, UFS, maskTelefone, media, statusMarca } from "./lib/helpers";

// ---------------------------------------------------------------------------
// Ícones SVG (inline, sem dependência extra)
// ---------------------------------------------------------------------------
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const IconWA = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.21 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>
);
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
);
const IconShop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const IconHeart = ({ filled }) => filled ? (
  <svg viewBox="0 0 24 24" fill="#A50E2D" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
);
const IconDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>
);
const IconSpark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
);
const IconLocal = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
);
const IconPiece = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.57 0 12.5 0S7 2.54 7 4.66c0 .46.07.9.18 1.34H5C3.9 6 3 6.9 3 8v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7.5-4c1.31 0 2.5 1.18 2.5 2.66 0 .46-.13.9-.36 1.34h-4.28C10.13 5.56 10 5.12 10 4.66 10 3.18 11.19 2 12.5 2z"/></svg>
);

const safeImgSrc = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//.test(trimmed) || /^data:/.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  
// ---------------------------------------------------------------------------
// Ícones adicionais para Sidebar/Dashboard
// ---------------------------------------------------------------------------
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

// ---------------------------------------------------------------------------
// Sidebar (recolhível) — Dashboard
// ---------------------------------------------------------------------------
function Sidebar({ open, onToggle, papel, onNavigate, activeTab }) {
  const navItems = React.useMemo(() => {
    if (papel === "admin") {
      return [
        { id: "resumo", label: "Resumo", icon: <IconDashboard /> },
        { id: "curadorias", label: "Curadorias", icon: <IconUsers /> },
        { id: "lojistas", label: "Lojistas", icon: <IconUsers /> },
        { id: "lojas", label: "Lojas", icon: <IconStore /> },
        { id: "destaques", label: "Destaques", icon: <IconStar /> },
        { id: "papeis", label: "Papéis", icon: <IconShield /> },
        { id: "vitrine", label: "Vitrine", icon: <IconPackage /> },
      ];
    }
    if (papel === "marca") {
      return [
        { id: "dados", label: "Dados da Loja", icon: <IconStore /> },
        { id: "vitrine", label: "Minha Vitrine", icon: <IconPackage /> },
      ];
    }
    return [
      { id: "curadorias", label: "Curadorias", icon: <IconSpark /> },
      { id: "recomendacoes", label: "Sua Curadoria", icon: <IconStar /> },
      { id: "favoritos", label: "Favoritos", icon: <IconHeart /> },
      { id: "avaliacoes", label: "Avaliações", icon: <IconStar /> },
      { id: "dados", label: "Meus Dados", icon: <IconUser /> },
    ];
  }, [papel]);

  return (
    <aside
      className={`gc-sidebar-dashboard ${open ? "open" : "collapsed"}`}
      role="navigation"
      aria-label="Navegação do painel"
    >
      <div className="gc-sidebar-header">
        <div className="gc-sidebar-brand">
          {!open && <span className="gc-sidebar-logo-mini">GC</span>}
          {open && <span className="gc-sidebar-logo-full">GIRO CERTO</span>}
        </div>
        <button
          className="gc-sidebar-toggle"
          onClick={onToggle}
          aria-label={open ? "Recolher sidebar" : "Expandir sidebar"}
          aria-expanded={open}
        >
          {open ? <IconChevronLeft /> : <IconChevronRight />}
        </button>
      </div>

      <nav className="gc-sidebar-nav" aria-label="Menu principal">
        <ul className="gc-sidebar-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`gc-sidebar-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
                title={open ? "" : item.label}
              >
                <span className="gc-sidebar-item-icon">{item.icon}</span>
                {open && <span className="gc-sidebar-item-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gc-sidebar-footer">
        {open && (
          <button className="gc-sidebar-logout" onClick={() => onNavigate("logout")}>
            <span className="gc-sidebar-item-icon"><IconLogout /></span>
            <span className="gc-sidebar-item-label">Sair</span>
          </button>
        )}
        {!open && (
          <button className="gc-sidebar-logout-mini" onClick={() => onNavigate("logout")} title="Sair">
            <IconLogout />
          </button>
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// DashboardLayout — wrapper com sidebar recolhível
// ---------------------------------------------------------------------------
function DashboardLayout({ children, papel, activeTab, onNavigate, onClose }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="gc-dashboard-layout">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        papel={papel}
        onNavigate={onNavigate}
        activeTab={activeTab}
      />
      <div className="gc-dashboard-main">
        <header className="gc-dashboard-header">
          <button
            className="gc-dashboard-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <IconMenu />
          </button>
          <div className="gc-dashboard-title">
            {papel === "admin" && "Painel Super Admin"}
            {papel === "marca" && "Painel da Marca"}
            {papel === "lojista" && "Painel do Lojista"}
          </div>
          <button className="gc-dashboard-close" onClick={onClose} aria-label="Fechar painel">
            <IconX />
          </button>
        </header>
        <main className="gc-dashboard-content" role="main">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="gc-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

return null;
};

// ---------------------------------------------------------------------------
// Stars
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
        <button key={n} type="button" data-on={n <= value ? "1" : "0"}
          role="radio" aria-checked={n === value} aria-label={`${n} de 5`}
          onClick={() => onChange(n)}>{n <= value ? "★" : "☆"}</button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PremiumCard — card grande da Seleção Premium
// ---------------------------------------------------------------------------
function PremiumCard({ l, info, isFav, onOpen, onFav }) {
  if (!l) return null;
  const s = SHOPPINGS[l.sh] || {};
  const safeInfo = info || {};
  return (
    <button className="gc-pcard" onClick={() => onOpen(l)}>
      <button className="gc-pcard-fav" onClick={(e) => { e.stopPropagation(); onFav(l.id); }}
        aria-label={isFav ? "Remover favorito" : "Favoritar"}>
        {isFav ? "❤️" : "🤍"}
      </button>
      <div className="gc-pcard-body">
        <div className="gc-pcard-av" style={s.cor ? { borderColor: s.cor } : undefined}>{iniciais(l.nome)}</div>
        <div className="gc-pcard-info">
          <div className="gc-pcard-nome">{l.nome || "Marca"}</div>
          <div className="gc-pcard-meta">{l.segmento || "Segmento não informado"}{s.curto ? ` · ${s.curto}` : ""}</div>
          {safeInfo.t != null && (
            <div className="gc-pcard-preco">
              {safeInfo.mn != null && safeInfo.mx != null && safeInfo.mx > safeInfo.mn
                ? `R$ ${safeInfo.mn} – ${safeInfo.mx}`
                : `R$ ${safeInfo.t}`} /peça
            </div>
          )}
          {safeInfo.v && <div className="gc-pcard-vibe">{safeInfo.v}</div>}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// BrandCard — card de marca na listagem de browse
// ---------------------------------------------------------------------------
function BrandCard({ l, info, revs, isFav, onOpen, onFav, onRequireLogin, session }) {
  if (!l) return null;
  const s = SHOPPINGS[l.sh] || {};
  const safeInfo = info || {};
  const wa = waLink(l.tel);
  return (
    <div className="gc-brand-card">
      <button className="gc-brand-fav" onClick={(e) => { e.stopPropagation(); onFav(l.id); }}
        aria-label={isFav ? "Remover favorito" : "Favoritar"}>
        {isFav ? "❤️" : "🤍"}
      </button>

      <div className="gc-brand-card-center" onClick={() => onOpen(l)} style={{ cursor: "pointer" }}>
        <div className="gc-brand-av" style={s.cor ? { borderColor: s.cor } : undefined}>{iniciais(l.nome)}</div>
        <div className="gc-brand-nome">{l.nome || "Marca"}</div>
        <span className="gc-brand-shop-tag" style={s.cor ? { background: s.cor } : undefined}>{s.curto || "Shopping"}</span>
        {safeInfo.v && <div className="gc-brand-vibe">{safeInfo.v}</div>}
      </div>

      <div className="gc-brand-info">
        {safeInfo.t != null && (
          <div className="gc-brand-preco">
            {safeInfo.mn != null && safeInfo.mx != null && safeInfo.mx > safeInfo.mn
              ? `R$ ${safeInfo.mn} – ${safeInfo.mx}`
              : `R$ ${safeInfo.t}`} /peça
          </div>
        )}
        {(!safeInfo || !safeInfo.t) && (
          <div className="gc-brand-preco gc-brand-preco-empty">sem preço ainda</div>
        )}
      </div>

      {wa && session ? (
        <a className="gc-brand-wa" href={wa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          <IconWA /> Atendimento WhatsApp
        </a>
      ) : (
        <button className="gc-brand-wa" onClick={(e) => { e.stopPropagation(); session ? window.open(wa || "#") : onRequireLogin(); }}>
          <IconWA /> {session ? "Atendimento WhatsApp" : "Entre para ver contato"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sheet (detalhe da marca — slide da direita)
// ---------------------------------------------------------------------------
function Sheet({ l, info, revs, session, perfil, posts, onDeletePost, onShowVitrine, onSaveInfo, onAddReview, onFav, isFav, onRequireLogin, onClose }) {
  if (!l) return null;
  const s = SHOPPINGS[l.sh] || {};
  const safePerfil = perfil || {};
  const safeInfo = info || {};
  const safeRevs = Array.isArray(revs) ? revs : [];
  const safePosts = Array.isArray(posts) ? posts : [];
  const quem = safePerfil.nome_completo || safePerfil.nome
    ? `Oi! Sou ${safePerfil.nome_completo || safePerfil.nome}, da ${safePerfil.nome}` +
      (safePerfil.cidade ? `, de ${safePerfil.cidade}${safePerfil.estado ? "-" + safePerfil.estado : ""}` : "") +
      `. Vim pelo ${APP_NOME}. Queria saber sobre `
    : "";
  const wa = waLink(l.tel, quem ? quem + "as peças de vocês." : null);
  const ig = igLink(l.insta);
  const st = statusMarca(safeRevs);
  const m = media(safeRevs);
  const logado = !!session;

  const [editando, setEditando] = useState(false);
  const [ticket, setTicket] = useState(safeInfo && safeInfo.t != null ? String(safeInfo.t) : "");
  const [tipos, setTipos] = useState((safeInfo && safeInfo.p) || []);
  const [vibe, setVibe] = useState((safeInfo && safeInfo.v) || "");
  const [novo, setNovo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState("");
  const [nota, setNota] = useState(0);
  const [coment, setComent] = useState("");
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
    if (ok) { setNota(0); setComent(""); }
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
          <p className="rt-hero-seg">{l.segmento}</p>
          <span className="rt-hero-shop">{s.nome || "Shopping"}</span>
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
            {!editando && !(info && info.v) && <p className="rt-vibe-empty">Ninguém descreveu essa marca ainda. Seja a primeira pessoa a contar pra que ela serve.</p>}
            {!editando && (
              <button className="rt-btn ghost" style={{ marginTop: 8, padding: "7px 10px", fontSize: 12 }}
                onClick={() => (logado ? setEditando(true) : onRequireLogin())}>
                {safeInfo && safeInfo.v ? "Editar informações" : "+ Descrever essa marca"}
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

          {safeInfo && (safeInfo.min || safeInfo.pag || safeInfo.gr) && (
            <div>
              <p className="rt-block-lab">Como comprar</p>
              <div className="rt-comercial">
                {safeInfo.min && <div><span>Pedido mínimo</span><b>{safeInfo.min}</b></div>}
                {safeInfo.gr && <div><span>Grade</span><b>{safeInfo.gr}</b></div>}
                {safeInfo.pag && <div><span>Pagamento</span><b>{safeInfo.pag}</b></div>}
              </div>
              <p className="rt-hint" style={{ margin: "6px 0 0" }}>Informado pela própria marca. Confirme na conversa.</p>
            </div>
          )}

          <div className="rt-linkrow">
            {logado ? (
              <a className={"rt-link-btn wa" + (wa ? "" : " off")} href={wa || "#"} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            ) : (
              <button className="rt-link-btn wa" onClick={onRequireLogin}>Entrar pra falar no WhatsApp</button>
            )}
            <a className={"rt-link-btn ig" + (ig ? "" : " off")} href={ig || "#"} target="_blank" rel="noreferrer">
              Ver no Instagram
            </a>
          </div>

          <div>
            <p className="rt-block-lab">Vitrine da loja</p>
            {safePosts.length === 0 && <p className="rt-nenhuma">Ainda sem novidades.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {safePosts.map((p) => (
                <div key={p.id} style={{ border: "1.5px solid var(--rule)", borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <b style={{ fontSize: 13 }}>{p.titulo}</b>
                    {(safePerfil && (safePerfil.papel === "admin" || (safePerfil.papel === "marca" && safePerfil.marca_id === l.id))) && (
                      <button className="rt-btn ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => onDeletePost(p.id)}>Excluir</button>
                    )}
                  </div>
                  {p.descricao && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{p.descricao}</p>}
                  {p.preco != null && <p style={{ fontSize: 12, marginTop: 4 }}>R$ {Number(p.preco).toFixed(2)} /peça</p>}
                  {p.em_promocao && <span style={{ fontSize: 10, background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 99, marginTop: 4, display: "inline-block" }}>Promoção</span>}
                </div>
              ))}
            </div>
            {(safePerfil && (safePerfil.papel === "admin" || (safePerfil.papel === "marca" && safePerfil.marca_id === l.id))) && (
              <button className="rt-btn ghost" style={{ marginTop: 10, fontSize: 12 }} onClick={onShowVitrine}>+ Nova novidade</button>
            )}
          </div>

          <div>
            <p className="rt-block-lab">Avaliações da comunidade ({safeRevs ? safeRevs.length : 0})</p>
            {(!safeRevs || safeRevs.length === 0) && <p className="rt-nenhuma">Ainda sem avaliações. Se você já visitou, conta como foi.</p>}
            {safeRevs && safeRevs.slice().reverse().map((r) => (
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
                    onChange={(e) => setComent(e.target.value)} />
                  <button className="rt-btn" disabled={!nota || enviandoRev} onClick={enviarReview}>
                    {enviandoRev ? "Enviando…" : "Enviar avaliação"}
                  </button>
                  <p className="rt-hint" style={{ margin: 0 }}>
                    Publicada como <b>{(safePerfil && safePerfil.nome) || "Lojista"}</b>.
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

// ---------------------------------------------------------------------------
// Modais secundários (mantidos do original)
// ---------------------------------------------------------------------------
function ShoppingsModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Sobre os shoppings</h3>
        <p className="rt-hint">Toda viagem da Primavera Tur passa pelas duas cidades — Cianorte e Maringá — no mesmo pacote.</p>
        {SHOPPING_INFO.map((sh) => (
          <div className="rt-shopcard" key={sh.nome}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><h4>{sh.curto}</h4></div>
            <p className="cidade">{sh.cidade}</p>
            <span className="tag">{sh.tag}</span><br />
            <a href={"https://instagram.com/" + sh.insta} target="_blank" rel="noreferrer">@{sh.insta} no Instagram →</a>
          </div>
        ))}
        <button className="rt-btn ghost" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function AiAssistenteModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ maxWidth: 580, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="rt-modal-t" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <span>✨</span> Assistente AI — Giro Certo
          </h3>
          <button className="rt-btn ghost" onClick={onClose} style={{ fontSize: 20, padding: 0 }}>×</button>
        </div>
        <p className="rt-hint" style={{ marginBottom: 18 }}>Insights inteligentes em tempo real sobre tendências de mercado, marcas e vendas.</p>
        {typeof StreamingText === "function" ? <StreamingText /> : null}
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
          <li><span className="rt-step-n">01</span><div className="rt-step-txt"><b>Você se cadastra</b><p>Leva 1 minuto e libera as marcas dos 3 shoppings do polo, com telefone e Instagram de cada uma.</p></div></li>
          <li><span className="rt-step-n">02</span><div className="rt-step-txt"><b>Procura do seu jeito</b><p>Por tipo de peça, faixa de preço, shopping ou segmento. Dá pra favoritar o que gostou.</p></div></li>
          <li><span className="rt-step-n">03</span><div className="rt-step-txt"><b>Fala direto com a marca</b><p>Um toque abre o WhatsApp da loja com sua apresentação pronta.</p></div></li>
          <li><span className="rt-step-n">04</span><div className="rt-step-txt"><b>A loja vende pra você</b><p>Venda direta, com nota no seu nome. Sem atravessador.</p></div></li>
          <li><span className="rt-step-n">05</span><div className="rt-step-txt"><b>Eu junto tudo e despacho</b><p>Comprou de 3 marcas? Eu recolho em cada loja, monto um pacote só e envio pro seu endereço.</p></div></li>
        </ol>
        <div style={{ marginTop: 16 }}><button className="rt-btn ghost" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
}

// Curadoria
const CUR_PERGUNTAS = [
  { id: "faixa", multi: false, titulo: "Quanto você compra por mês, mais ou menos?", ops: ["Até R$ 5 mil", "R$ 5 a 10 mil", "R$ 10 a 20 mil", "Mais de R$ 20 mil", "Ainda não compro"] },
  { id: "canal", multi: false, titulo: "Como você vende hoje?", ops: ["Loja física", "Física + online", "Só online", "Sacoleira / pronta-entrega", "WhatsApp e redes"] },
  { id: "onde", multi: true, titulo: "Onde você compra hoje?", ops: ["Polo do Paraná", "Brás (SP)", "Goiânia", "Agreste (PE)", "Online direto das marcas", "Representante me visita", "Ainda não compro"] },
  { id: "segmentos", multi: true, titulo: "O que mais sai na sua loja?", ops: ["Feminina", "Masculina", "Jeans", "Infantil", "Plus Size Feminina", "Evangélica", "Íntima & Fitness", "Acessórios", "Perfumaria & Casa"] },
  { id: "tempo", multi: false, titulo: "Há quanto tempo tem a loja?", ops: ["Começando agora", "Até 1 ano", "1 a 3 anos", "Mais de 3 anos"] },
  { id: "frete", multi: false, titulo: "Costuma pagar frete?", ops: ["Sim, sempre", "Às vezes", "Nunca paguei"] },
  { id: "guia", multi: false, titulo: "Já tem alguém que te acompanha nas compras?", ops: ["Não, vou por conta", "Sim, tenho um guia", "Vou com excursão"] },
];

function CuradoriaModal({ perfil, onEnviar, onClose }) {
  const [resp, setResp] = useState({});
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const marcar = (q, op) => setResp((r) => !q.multi ? { ...r, [q.id]: op } : { ...r, [q.id]: (r[q.id] || []).includes(op) ? (r[q.id] || []).filter((x) => x !== op) : [...(r[q.id] || []), op] });
  const ativo = (q, op) => { const v = resp[q.id]; return q.multi ? (v || []).includes(op) : v === op; };
  const respondidas = CUR_PERGUNTAS.filter((q) => { const v = resp[q.id]; return q.multi ? (v || []).length > 0 : !!v; }).length;
  const enviar = async () => { setEnviando(true); const ok = await onEnviar({ ...resp, observacao: obs.trim() }); setEnviando(false); if (ok) setPronto(true); };

  if (pronto) return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>💛</div>
        <h3 className="rt-modal-t">Recebi!</h3>
        <p className="rt-hint" style={{ fontSize: 14 }}>Vou olhar seu perfil com calma e te chamo no WhatsApp em até 24h com as marcas que mais fazem sentido pra sua loja.</p>
        <button className="rt-btn" onClick={onClose}>Voltar pro roteiro</button>
      </div>
    </div>
  );

  return (
    <div className="rt-backdrop" style={{ alignItems: "flex-start", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Receba uma curadoria grátis</h3>
        <p className="rt-hint" style={{ fontSize: 13 }}>Me conta como é sua loja e eu monto uma lista com as marcas mais lucrativas pro seu público — sem custo, sem compromisso.</p>
        <div className="rt-cur-prog"><div className="rt-cur-prog-bar" style={{ width: `${(respondidas / CUR_PERGUNTAS.length) * 100}%` }} /></div>
        {CUR_PERGUNTAS.map((q) => (
          <div className="rt-cur-q" key={q.id}>
            <p className="rt-cur-tit">{q.titulo}{q.multi && <span className="rt-cur-multi">pode marcar mais de uma</span>}</p>
            <div className="rt-cur-ops">
              {q.ops.map((op) => <button key={op} className="rt-cur-op" data-on={ativo(q, op) ? "1" : "0"} onClick={() => marcar(q, op)}>{op}</button>)}
            </div>
          </div>
        ))}
        <div className="rt-cur-q">
          <p className="rt-cur-tit">Quer contar mais alguma coisa? <span className="rt-cur-multi">opcional</span></p>
          <textarea className="rt-area" value={obs} placeholder="O que você procura, dificuldade que tem, o que não quer…" onChange={(e) => setObs(e.target.value)} />
        </div>
        <div className="rt-save-row" style={{ marginTop: 14 }}>
          <button className="rt-btn" onClick={enviar} disabled={enviando || respondidas < 3}>{enviando ? "Enviando…" : "Quero minha curadoria"}</button>
          <button className="rt-btn ghost" onClick={onClose}>Agora não</button>
        </div>
        {respondidas < 3 && <p className="rt-hint" style={{ margin: "8px 0 0" }}>Responde pelo menos 3 pra eu conseguir te ajudar direito.</p>}
      </div>
    </div>
  );
}

function AuthModal({ onClose }) {
  const [modo, setModo] = useState("entrar");
  const [nome, setNome] = useState(""); const [nomeCompleto, setNomeCompleto] = useState("");
  const [cnpj, setCnpj] = useState(""); const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState(""); const [estado, setEstado] = useState("");
  const [dataNasc, setDataNasc] = useState(""); const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState(""); const [concluido, setConcluido] = useState(false);
  const [autenticadoAuto, setAutenticadoAuto] = useState(false);
  const [papel, setPapel] = useState("lojista");
  const cnpjOk = docOk(cnpj); const telOk = telefone.replace(/\D/g, "").length >= 10;
  const criarOk = nome.trim() && nomeCompleto.trim() && cnpjOk && telOk && cidade.trim() && estado && email && senha;

  const enviar = async () => {
    setCarregando(true); setMsg("");
    if (modo === "criar") {
      if (!criarOk) { setCarregando(false); setMsg("Preencha todos os campos corretamente para criar sua conta."); return; }
      const redirectUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { emailRedirectTo: redirectUrl, data: { nome: nome.trim() || "Lojista", nome_completo: nomeCompleto.trim(), cnpj: cnpj.trim(), telefone: telefone.trim(), cidade: cidade.trim(), estado, data_nascimento: dataNasc, papel } } });
      if (error) { setCarregando(false); setMsg(error.message); return; }
      if (data?.session) { setCarregando(false); setAutenticadoAuto(true); setConcluido(true); return; }
      const { data: loginData } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      setCarregando(false); if (loginData?.session) setAutenticadoAuto(true); setConcluido(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      setCarregando(false); if (error) { setMsg(error.message); return; } onClose();
    }
  };

  if (concluido) return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" style={{ textAlign: "center", padding: "28px 20px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, fontWeight: "bold" }}>✓</div>
        <h3 className="rt-modal-t" style={{ fontSize: 20, marginBottom: 8 }}>{autenticadoAuto ? "Conta criada e conectada!" : "Cadastro realizado!"}</h3>
        <p className="rt-hint" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 20, color: "var(--ink)" }}>{autenticadoAuto ? "Sua conta foi criada e você já está conectado." : `Verifique seu e-mail ${email} para confirmar.`}</p>
        <button className="rt-btn" style={{ width: "100%" }} onClick={() => { if (autenticadoAuto) onClose(); else { setConcluido(false); setModo("entrar"); } }}>{autenticadoAuto ? "Ir para o aplicativo" : "Entrar com minha conta"}</button>
      </div>
    </div>
  );

  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">{modo === "entrar" ? "Entrar" : "Criar conta"}</h3>
        <p className="rt-hint">{modo === "entrar" ? "Pra falar com as lojas no WhatsApp, avaliar e favoritar." : "Leva menos de um minuto."}</p>
        <div className="rt-mini-form">
          {modo === "criar" && (<>
            <input className="rt-input" value={nome} placeholder="Nome da sua loja" onChange={(e) => setNome(e.target.value)} />
            <input className="rt-input" value={nomeCompleto} placeholder="Seu nome completo" onChange={(e) => setNomeCompleto(e.target.value)} />
            <div>
              <input className="rt-input" value={cnpj} placeholder="CNPJ ou CPF" inputMode="numeric" onChange={(e) => setCnpj(maskDoc(e.target.value))} />
              <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginTop: 4 }}>{cnpj ? (cnpjOk ? `✓ ${tipoDoc(cnpj)}` : "Continue digitando…") : "Ainda não tem CNPJ? Pode usar seu CPF."}</span>
            </div>
            <input className="rt-input" value={telefone} placeholder="Telefone / WhatsApp" inputMode="tel" onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className="rt-input" value={cidade} placeholder="Sua cidade" style={{ flex: 1 }} onChange={(e) => setCidade(e.target.value)} />
              <select className="rt-input" value={estado} style={{ maxWidth: 92 }} onChange={(e) => setEstado(e.target.value)}><option value="">UF</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
            </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Data de nascimento <em style={{ opacity: .7 }}>(opcional)</em></span>
                <input className="rt-input" type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Você é</span>
                <select className="rt-input" value={papel} onChange={(e) => setPapel(e.target.value)}>
                  <option value="lojista">Lojista</option>
                  <option value="marca">Marca / Loja</option>
                </select>
              </div>
            </>)}
          <input className="rt-input" type="email" value={email} placeholder="seu@email.com" onChange={(e) => setEmail(e.target.value)} />
          <input className="rt-input" type="password" value={senha} placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <div className="rt-save-row">
            <button className="rt-btn" onClick={enviar} disabled={carregando || !email || !senha || (modo === "criar" && !criarOk)}>{carregando ? "Um instante…" : modo === "entrar" ? "Entrar" : "Criar conta"}</button>
            <button className="rt-btn ghost" onClick={() => { setModo(modo === "entrar" ? "criar" : "entrar"); setMsg(""); }}>{modo === "entrar" ? "Criar conta" : "Já tenho conta"}</button>
          </div>
          {msg && <p className="rt-hint" style={{ margin: 0 }}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}

function PrivacidadeModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3 className="rt-modal-t">Política de Privacidade</h3>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
          <p><b>Responsável Legal:</b> Oliveira Tur Viagens / Dioe Henrique (CNPJ 29.837.789/0001-11)</p>
          <p style={{ marginTop: 10 }}><b>Coleta de Dados:</b> Nome da loja, nome completo, CNPJ/CPF, telefone/WhatsApp, cidade, UF, data de nascimento e preferências de curadoria.</p>
          <p style={{ marginTop: 10 }}><b>Uso dos Dados:</b> Exclusivamente para conectar o lojista às marcas, realizar a curadoria gratuita e auxiliar no despacho logístico de mercadorias.</p>
          <p style={{ marginTop: 10 }}><b>Proteção:</b> Não vendemos nem compartilhamos dados com terceiros.</p>
        </div>
        <div className="rt-save-row" style={{ marginTop: 14 }}>
          <button className="rt-btn" onClick={onClose}>Entendi</button>
        </div>
      </div>
    </div>
  );
}

function TermosModal({ onClose }) {
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3 className="rt-modal-t">Termos de Uso</h3>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
          <p>• Uso 100% gratuito para o lojista.</p>
          <p style={{ marginTop: 10 }}>• O Giro Certo conecta o lojista diretamente com a marca para negociação direta (sem atravessador/intermediário no preço).</p>
          <p style={{ marginTop: 10 }}>• Serviços logísticos e despacho unificado de pacotes são combinados via WhatsApp de atendimento.</p>
        </div>
        <div className="rt-save-row" style={{ marginTop: 14 }}>
          <button className="rt-btn" onClick={onClose}>Entendi</button>
        </div>
      </div>
    </div>
  );
}

function Navbar({ pagina, setPagina, setMostrarShoppings, setMostrarComo, perfil, setPainelAba, setMostrarPerfil, IconUser: IconUserProp }) {
  const IconUser = IconUserProp || (() => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>);
  return (
    <nav className="gc-nav">
      <div className="gc-nav-left">
        <button className="gc-nav-link show-mobile" onClick={() => setPagina("home")} style={pagina === "home" ? { color: "#fff" } : {}}>Início</button>
        <button className="gc-nav-link" onClick={() => setMostrarShoppings(true)}>Shoppings</button>
      </div>
      <div className="gc-nav-logo">
        GIRO CERTO
        <small>BUSCAR</small>
      </div>
      <div className="gc-nav-right">
        <button className="gc-nav-link" onClick={() => setMostrarComo(true)}>Como funciona</button>
        {perfil && perfil.papel === "admin" && <button className="gc-nav-link" onClick={() => setPainelAba("superadmin")}>Admin</button>}
        {perfil && perfil.papel === "marca" && <button className="gc-nav-link" onClick={() => setPainelAba("marca")}>Painel</button>}
        <button className="gc-nav-icon-btn" onClick={() => setMostrarPerfil(true)} aria-label="Perfil"><IconUser /></button>
      </div>
    </nav>
  );
}

function BottomNav({ pagina, setPagina, session, setMostrarAuth, setMostrarPerfil, IconHome: IconHomeProp, IconShop: IconShopProp, IconHeart: IconHeartProp, IconProfile: IconProfileProp }) {
  const IconHome = IconHomeProp || (() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>);
  const IconShop = IconShopProp || (() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
  const IconHeart = IconHeartProp || (({ filled }) => filled ? <svg viewBox="0 0 24 24" fill="#A50E2D" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>);
  const IconProfile = IconProfileProp || (() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
  return (
    <nav className="gc-mobile-nav">
      <div className="gc-mobile-nav-inner">
        <button className={"gc-mobile-tab" + (pagina === "home" ? " active" : "")} onClick={() => setPagina("home")}>
          <IconHome /><span>Buscar</span>
        </button>
        <button className={"gc-mobile-tab" + (pagina === "browse" ? " active" : "")} onClick={() => setPagina("browse")}>
          <IconShop /><span>Shoppings</span>
        </button>
        <button className={"gc-mobile-tab" + (pagina === "favoritos" ? " active" : "")} onClick={() => { if (session) setPagina("favoritos"); else setMostrarAuth(true); }}>
          <IconHeart filled={pagina === "favoritos"} /><span>Favoritos</span>
        </button>
        <button className={"gc-mobile-tab" + (pagina === "perfil" ? " active" : "")} onClick={() => setMostrarPerfil(true)}>
          <IconProfile /><span>Perfil</span>
        </button>
      </div>
    </nav>
  );
}

function HomePage({
  busca, setBusca, setPagina, carregando, categoriasExpandidas, setCategoriasExpandidas,
  catAtiva, setCatAtiva, SEGMENTOS, ICONES, shop, setShop, SHOPPINGS, premiuns, ordenadas,
  colab, favs, setAberta, toggleFav, session, setMostrarCuradoria, setMostrarAuth,
  setMostrarShoppings, setMostrarComo, perfil, setPainelAba, setMostrarPerfil,
  setMostrarPrivacidade, setMostrarTermos, Navbar, BottomNav,
  IconSearch, IconArrow, IconSpark, IconShop, IconUser, IconHome, IconHeart, IconProfile
}) {
  return (
    <div className="gc-home">
      <Navbar
        pagina="home"
        setPagina={setPagina}
        setMostrarShoppings={setMostrarShoppings}
        setMostrarComo={setMostrarComo}
        perfil={perfil}
        setPainelAba={setPainelAba}
        setMostrarPerfil={setMostrarPerfil}
        IconUser={IconUser}
      />

      {/* Hero */}
      <div className="gc-hero">
        <div className="gc-hero-eyebrow">A curadoria definitiva</div>
        <h1 className="gc-hero-title">O que você procura hoje?</h1>
        <p className="gc-hero-subtitle">Encontre as marcas certas para a sua loja</p>
        <div className="gc-search-wrap">
          <input value={busca} onChange={(e) => { setBusca(e.target.value); if (e.target.value) setPagina("browse"); }}
            placeholder="Ex: Vestidos, Moda Íntima, Alfaiataria..." aria-label="Buscar" />
          <button className="gc-search-btn" aria-label="Buscar"><IconSearch /></button>
        </div>
      </div>

      {/* Categorias */}
      <div className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-label">Explorar Categorias</div>
          <p className="gc-section-subtitle">Navegue pelas seleções mais buscadas pelos lojistas.</p>
        </div>
        {carregando ? null : (
          <div className={"gc-cats-scroll" + (categoriasExpandidas ? " expandido" : "")}>
            <button className={"gc-cat-btn" + (catAtiva === "todos" ? " active" : "")} onClick={() => { setCatAtiva("todos"); setPagina("browse"); }}>
              <div className="gc-cat-ico"><img src={safeImgSrc("/categorias/todas.png") || "/categorias/todas.png"} alt="Todas" onError={(e) => { e.target.style.display = "none"; }} /></div>
              <span className="gc-cat-label">Todas</span>
            </button>
            {SEGMENTOS.map((s) => (
              <button key={s} className={"gc-cat-btn" + (catAtiva === s ? " active" : "")} onClick={() => { setCatAtiva(s); setPagina("browse"); }}>
                <div className="gc-cat-ico"><img src={safeImgSrc(ICONES[s] || "/categorias/todas.png") || "/categorias/todas.png"} alt={s} onError={(e) => { e.target.src = "/categorias/todas.png"; }} /></div>
                <span className="gc-cat-label">{s}</span>
              </button>
            ))}
            <button className="gc-cat-btn toggle-expand" onClick={() => setCategoriasExpandidas(!categoriasExpandidas)}>
              <div className="gc-cat-ico"><img src={safeImgSrc("/categorias/todas.png") || "/categorias/todas.png"} alt={categoriasExpandidas ? "Menos" : "Mais"} onError={(e) => { e.target.style.display = "none"; }} style={{ transform: categoriasExpandidas ? "rotate(45deg)" : "none" }} /></div>
              <span className="gc-cat-label">{categoriasExpandidas ? "Ver Menos" : "Ver Mais"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Por Shopping */}
      <div className="gc-section" style={{ paddingTop: 32 }}>
        <div className="gc-section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div className="gc-section-label">Por Shopping</div>
          </div>
          <button className="gc-ver-todas" style={{ marginBottom: 4 }} onClick={() => setMostrarShoppings(true)}>Ver mapa</button>
        </div>
        <div className="gc-shops-row">
          <button className={"gc-shop-pill" + (shop === "todos" ? " active" : "")} onClick={() => setShop("todos")}>Todos</button>
          {Object.entries(SHOPPINGS).map(([k, v]) => (
            <button key={k} className={"gc-shop-pill" + (shop === k ? " active" : "")} onClick={() => { setShop(k); setPagina("browse"); }}>{v.curto}</button>
          ))}
        </div>
      </div>

      {/* Seleção Premium */}
      <div className="gc-premium-head">
        <div>
          <div className="gc-premium-title">Seleção Premium</div>
          <p className="gc-section-subtitle">Marcas de destaque recomendadas por nossos curadores.</p>
        </div>
        <button className="gc-ver-todas" onClick={() => setPagina("browse")}>VER TODAS <IconArrow /></button>
      </div>
      {carregando ? <div className="rt-load">carregando…</div> : (
        <div className="gc-premium-scroll">
          {(premiuns.length > 0 ? premiuns : ordenadas).slice(0, 8).map((l) => (
            <PremiumCard key={l.id} l={l} info={colab[l.id]} isFav={favs.includes(l.id)} onOpen={setAberta} onFav={toggleFav} />
          ))}
        </div>
      )}

      {/* CTA Curadoria */}
      <div className="gc-cta-block">
        <div className="gc-cta-icon"><IconSpark /></div>
        <h2 className="gc-cta-title">Curadoria Especializada</h2>
        <p className="gc-cta-sub">Não sabe por onde começar? Nós montamos gratuitamente uma lista de marcas ideal para o perfil da sua loja.</p>
        <button className="gc-cta-btn" onClick={() => (session ? setMostrarCuradoria(true) : setMostrarAuth(true))}>
          Solicitar Curadoria Gratuita <IconArrow />
        </button>
      </div>

      {/* Footer */}
      <footer className="gc-footer">
        <div className="gc-footer-logo">GIRO CERTO</div>
        <div className="gc-footer-links">
          <button className="gc-footer-link" onClick={() => setMostrarPrivacidade(true)}>Privacidade</button>
          <button className="gc-footer-link" onClick={() => setMostrarTermos(true)}>Termos</button>
          <a className="gc-footer-link" href="https://wa.me/5566996983540?text=Oi!%20Vim%20pelo%20app%20Giro%20Certo%20e%20preciso%20de%20ajuda." target="_blank" rel="noopener noreferrer">Contato</a>
        </div>
        <p className="gc-footer-copy">© 2024 Giro Certo. O melhor da moda em um só lugar.</p>
      </footer>

      <BottomNav
        pagina="home"
        setPagina={setPagina}
        session={session}
        setMostrarAuth={setMostrarAuth}
        setMostrarPerfil={setMostrarPerfil}
        IconHome={IconHome}
        IconShop={IconShop}
        IconHeart={IconHeart}
        IconProfile={IconProfile}
      />
    </div>
  );
}

function BrowsePage({
  pagina,
  filtradas, shop, setShop, catAtiva, setCatAtiva, faixa, setFaixa, busca, setBusca,
  FAIXAS, lojas, SEGMENTOS, SHOPPINGS, carregando, visible, setVisible, ordenadas,
  colab, revs, favs, setAberta, toggleFav, session, setMostrarAuth, perfil, gerarCsv,
  setMostrarPrivacidade, setMostrarTermos, setPagina, setMostrarShoppings, setMostrarComo,
  setPainelAba, setMostrarPerfil, Navbar, BottomNav,
  IconSearch, IconShop, IconRefresh, IconDown, IconTag, IconUser, IconHome, IconHeart, IconProfile
}) {
  const filtrosAtivos = [
    shop !== "todos" && { label: SHOPPINGS[shop]?.curto, clear: () => setShop("todos") },
    catAtiva !== "todos" && { label: catAtiva, clear: () => setCatAtiva("todos") },
    faixa !== "todas" && { label: FAIXAS.find((f) => f.id === faixa)?.label, clear: () => setFaixa("todas") },
    busca && { label: `"${busca}"`, clear: () => setBusca("") },
  ].filter(Boolean);

  return (
    <div className="gc-browse">
      <Navbar
        pagina={pagina}
        setPagina={setPagina}
        setMostrarShoppings={setMostrarShoppings}
        setMostrarComo={setMostrarComo}
        perfil={perfil}
        setPainelAba={setPainelAba}
        setMostrarPerfil={setMostrarPerfil}
        IconUser={IconUser}
      />

      {/* Banner */}
      <div className="gc-browse-banner">
        <div className="gc-browse-breadcrumb">
          <span className="gc-breadcrumb-tag">MARCAS</span>
          <span className="gc-breadcrumb-desc">Conheça nossa seleção de confecções exclusivas.</span>
        </div>
        <div className="gc-browse-hero-row">
          <div>
            <h1 className="gc-browse-title">DESCUBRA<span>NOVAS MARCAS</span></h1>
          </div>
          <div className="gc-results-badge">
            <div className="gc-results-icon"><IconShop /></div>
            <div>
              <div className="gc-results-n">{filtradas.length}</div>
              <div className="gc-results-label">Marcas</div>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)", marginLeft: 4 }}>Resultados</div>
          </div>
        </div>
      </div>

      {/* Filtros ativos */}
      {filtrosAtivos.length > 0 && (
        <div className="gc-active-filters">
          <span className="gc-af-label">Filtros ativos:</span>
          {filtrosAtivos.map((f, i) => (
            <button key={i} className="gc-af-pill" onClick={f.clear}>
              {f.label} <span className="gc-af-pill-x">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Corpo: Sidebar + Grid */}
      <div className="gc-browse-body">
        {/* Sidebar */}
        <aside className="gc-sidebar">
          <div className="gc-sb-section">
            <div className="gc-sb-title"><IconShop /> Shopping</div>
            <div className="gc-sb-check">
              {Object.entries(SHOPPINGS).map(([k, v]) => {
                const count = lojas.filter((l) => l.sh === k).length;
                return (
                  <label key={k} className="gc-sb-check-item">
                    <input type="checkbox" checked={shop === k} onChange={() => setShop(shop === k ? "todos" : k)} />
                    <span className="gc-sb-check-label">{v.curto}</span>
                    <span className="gc-sb-check-count">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="gc-sb-section">
            <div className="gc-sb-title"><IconTag /> Segmento</div>
            <div className="gc-sb-seg-pills">
              {SEGMENTOS.map((s) => (
                <button key={s} className={"gc-sb-seg-pill" + (catAtiva === s ? " active" : "")} onClick={() => setCatAtiva(catAtiva === s ? "todos" : s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="gc-sb-section">
            <div className="gc-sb-title"><IconTag /> Faixa de Preço</div>
            <div className="gc-sb-faixas">
              <button className={"gc-sb-faixa" + (faixa === "a" ? " active" : "")} onClick={() => setFaixa(faixa === "a" ? "todas" : "a")}>
                <span className="gc-sb-faixa-label">Até R$50</span><span className="gc-sb-faixa-sym">$</span>
              </button>
              <button className={"gc-sb-faixa" + (faixa === "b" ? " active" : "")} onClick={() => setFaixa(faixa === "b" ? "todas" : "b")}>
                <span className="gc-sb-faixa-label">R$51-150</span><span className="gc-sb-faixa-sym">$$</span>
              </button>
              <button className={"gc-sb-faixa" + (faixa === "d" ? " active" : "")} onClick={() => setFaixa(faixa === "d" ? "todas" : "d")}>
                <span className="gc-sb-faixa-label">Acima R$150</span><span className="gc-sb-faixa-sym">$$$</span>
              </button>
            </div>
          </div>
          <button className="gc-sb-clear" onClick={() => { setShop("todos"); setCatAtiva("todos"); setFaixa("todas"); setBusca(""); }}>
            <IconRefresh /> LIMPAR FILTROS
          </button>
        </aside>

        {/* Grid */}
        <div className="gc-brands-area">
          {/* Busca (desktop — dentro do browse) */}
          <div style={{ position: "relative", marginTop: 24 }}>
            <input
              value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar marca, segmento, tipo de peça…"
              style={{ width: "100%", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", padding: "12px 40px 12px 16px", border: "1.5px solid var(--rule)", borderRadius: 10, background: "var(--paper)" }}
            />
            {busca ? <button onClick={() => setBusca("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer" }}>×</button>
                     : <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}><IconSearch /></span>}
          </div>

          {carregando ? <div className="rt-load">Carregando marcas…</div> : (
            <>
              <div className="gc-brands-grid">
                {ordenadas.slice(0, visible).map((l) => (
                  <BrandCard key={l.id} l={l} info={colab[l.id]} revs={revs[l.id]}
                    isFav={favs.includes(l.id)} onOpen={setAberta} onFav={toggleFav}
                    onRequireLogin={() => setMostrarAuth(true)} session={session} />
                ))}
              </div>
              {filtradas.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 8 }}>Nenhuma marca encontrada.</p>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>Tenta outra palavra ou limpa os filtros.</span>
                </div>
              )}
              {visible < ordenadas.length && (
                <button className="gc-load-more" onClick={() => setVisible((v) => v + 20)}>
                  CARREGAR MAIS MARCAS <IconDown />
                </button>
              )}
              {/* Export (admin) */}
              {perfil && perfil.papel === "admin" && (
                <div style={{ textAlign: "right", padding: "10px 0" }}>
                  <button className="rt-export" onClick={gerarCsv}>Exportar planilha</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="gc-footer" style={{ marginTop: 40 }}>
        <div className="gc-footer-logo">GIRO CERTO</div>
        <div className="gc-footer-links">
          <button className="gc-footer-link" onClick={() => setMostrarPrivacidade(true)}>Privacidade</button>
          <button className="gc-footer-link" onClick={() => setMostrarTermos(true)}>Termos</button>
          <a className="gc-footer-link" href="https://wa.me/5566996983540?text=Oi!%20Vim%20pelo%20app%20Giro%20Certo%20e%20preciso%20de%20ajuda." target="_blank" rel="noopener noreferrer">Contato</a>
        </div>
        <p className="gc-footer-copy">© 2024 Giro Certo. O melhor da moda em um só lugar.</p>
      </footer>

      <BottomNav
        pagina={pagina}
        setPagina={setPagina}
        session={session}
        setMostrarAuth={setMostrarAuth}
        setMostrarPerfil={setMostrarPerfil}
        IconHome={IconHome}
        IconShop={IconShop}
        IconHeart={IconHeart}
        IconProfile={IconProfile}
      />
    </div>
  );
}

function PerfilModal({ perfil, favsCount, onSaveNome, onLogout, onClose, onOpenPainel }) {
  const [nome, setNome] = useState((perfil && perfil.nome) || "");
  return (
    <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
        <h3 className="rt-modal-t">Seu perfil</h3>
        <p className="rt-hint">Esse nome aparece junto das avaliações que você publicar.</p>
        <input className="rt-input" value={nome} placeholder="Ex: Ana, da Boutique Flor" onChange={(e) => setNome(e.target.value)} autoFocus />
        <p className="rt-hint" style={{ marginTop: 10 }}><b>{favsCount}</b> loja{favsCount === 1 ? "" : "s"} favoritada{favsCount === 1 ? "" : "s"}.</p>
        <div className="rt-save-row" style={{ marginTop: 8 }}>
          <button className="rt-btn" onClick={() => onSaveNome(nome.trim())}>Salvar nome</button>
          <button className="rt-btn ghost" onClick={onLogout}>Sair</button>
          <button className="rt-btn ghost" onClick={onClose}>Fechar</button>
        </div>
        {perfil && perfil.papel === "admin" && <button className="rt-btn" style={{ marginTop: 10 }} onClick={() => { onClose(); onOpenPainel("superadmin"); }}>Abrir painel admin</button>}
        {perfil && perfil.papel === "marca" && <button className="rt-btn" style={{ marginTop: 10 }} onClick={() => { onClose(); onOpenPainel("marca"); }}>Abrir painel da marca</button>}
        {perfil && perfil.papel === "lojista" && <button className="rt-btn" style={{ marginTop: 10 }} onClick={() => { onClose(); onOpenPainel("lojista"); }}>Abrir painel do lojista</button>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SuperAdminPanel (mantido do original)
// ---------------------------------------------------------------------------
function SuperSuperSuperAdminLojaRow({ l, info, salvando, onSave, onDestaque }) {
  const [abrir, setAbrir] = useState(false);
  const [nome, setNome] = useState(l.nome); const [tel, setTel] = useState(l.tel || ""); const [insta, setInsta] = useState(l.insta || "");
  const [ticket, setTicket] = useState(info && info.t != null ? String(info.t) : ""); const [pmin, setPmin] = useState(info && info.mn != null ? String(info.mn) : ""); const [pmax, setPmax] = useState(info && info.mx != null ? String(info.mx) : "");
  const [tipos, setTipos] = useState((info && info.p ? info.p.join(", ") : "")); const [vibe, setVibe] = useState((info && info.v) || ""); const [pmin2, setPmin2] = useState((info && info.min) || ""); const [pag, setPag] = useState((info && info.pag) || ""); const [grade, setGrade] = useState((info && info.gr) || "");
  const [foto, setFoto] = useState(l.foto_url || "");
  const [criandoAcesso, setCriandoAcesso] = useState(false);
  const [acessoEmail, setAcessoEmail] = useState("");
  const [acessoSenha, setAcessoSenha] = useState("");
  const [acessoMsg, setAcessoMsg] = useState("");
  const sujoLoja = nome !== l.nome || tel !== (l.tel || "") || insta !== (l.insta || "") || foto !== (l.foto_url || "");
  const sujoColab = ticket !== (info && info.t != null ? String(info.t) : "") || pmin !== (info && info.mn != null ? String(info.mn) : "") || pmax !== (info && info.mx != null ? String(info.mx) : "") || tipos !== (info && info.p ? info.p.join(", ") : "") || vibe !== ((info && info.v) || "") || pmin2 !== ((info && info.min) || "") || pag !== ((info && info.pag) || "") || grade !== ((info && info.gr) || "");
  const salvar = () => { const n = parseFloat(String(ticket).replace(",", ".")); onSave(sujoLoja ? { nome, telefone: tel || null, instagram: insta || null, foto_url: foto || null } : null, sujoColab ? { t: isNaN(n) ? null : Math.round(n), mn: pmin ? Math.round(parseFloat(pmin.replace(",", "."))) : null, mx: pmax ? Math.round(parseFloat(pmax.replace(",", "."))) : null, p: tipos.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean), v: vibe.trim(), min: pmin2.trim() || null, pag: pag.trim() || null, gr: grade.trim() || null } : null); };
  const uploadFoto = async (file) => {
    setAcessoMsg("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `lojas/${l.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("marca-fotos").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("marca-fotos").getPublicUrl(path);
      const url = pub.publicUrl;
      if (!url) throw new Error("URL pública da foto não foi retornada.");
      setFoto(url);
      await supabase.from("lojas").update({ foto_url: url }).eq("id", l.id);
      setAcessoMsg("Foto atualizada com sucesso!");
    } catch (e) {
      console.error("uploadFoto loja", e);
      setAcessoMsg("Não foi possível enviar a foto agora.");
    }
  };
  const criarAcessoMarca = async () => {
    setAcessoMsg("");
    if (!acessoEmail || !acessoSenha) { setAcessoMsg("Preencha e-mail e senha."); return; }
    try {
      const { data, error } = await supabase.auth.signUp({ email: acessoEmail, password: acessoSenha });
      if (error) { setAcessoMsg("Erro: " + error.message); return; }
      if (!data.user) { setAcessoMsg("Erro ao criar usuário."); return; }
      const { error: perfilError } = await supabase.from("perfis").insert({
        id: data.user.id,
        papel: "marca",
        marca_id: l.id,
        nome: acessoEmail.split("@")[0],
        nome_completo: l.nome,
      });
      if (perfilError) { setAcessoMsg("Usuário criado, mas erro ao salvar perfil: " + perfilError.message); return; }
      setAcessoMsg("Acesso criado com sucesso!");
      setAcessoEmail("");
      setAcessoSenha("");
      setCriandoAcesso(false);
    } catch (e) {
      setAcessoMsg("Erro inesperado: " + e.message);
    }
  };
  return (
    <div className="rt-loja-adm">
      <div className="rt-loja-adm-top">
        <button className="rt-star-btn" data-on={l.destaque ? "1" : "0"} title={l.destaque ? "Tirar dos destaques" : "Fixar na primeira tela"} onClick={() => onDestaque(l)}>{l.destaque ? "★" : "☆"}</button>
        <button className="rt-loja-adm-nome" onClick={() => setAbrir(!abrir)}><b>{l.nome}</b><span className="rt-lead-sub">{l.segmento} · {SHOPPINGS[l.sh].curto}{info && info.t != null ? ` · R$ ${info.t}` : " · sem preço"}</span></button>
        <span className="rt-loja-adm-seta">{abrir ? "▲" : "▼"}</span>
      </div>
      {abrir && (
        <div className="rt-mini-form" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            {(() => { const src = safeImgSrc(foto); return src ? <img src={src} alt="Foto da loja" onError={(e) => { e.target.style.display = "none"; }} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--rule)" }} /> : null; })()}
            <div>
              <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Foto da loja</span>
              <input className="rt-input" type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) uploadFoto(f); }} />
            </div>
          </div>
          <input className="rt-input" value={nome} placeholder="Nome da marca" onChange={(e) => setNome(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}><input className="rt-input" value={tel} placeholder="Telefone" onChange={(e) => setTel(e.target.value)} /><input className="rt-input" value={insta} placeholder="Instagram" onChange={(e) => setInsta(e.target.value)} /></div>
          <div className="rt-money"><span>Preço R$</span><input className="rt-input" style={{ maxWidth: 82 }} inputMode="decimal" value={pmin} placeholder="de" onChange={(e) => { setPmin(e.target.value); if (!ticket) setTicket(e.target.value); }} /><span>até</span><input className="rt-input" style={{ maxWidth: 82 }} inputMode="decimal" value={pmax} placeholder="até" onChange={(e) => setPmax(e.target.value)} /></div>
          <div className="rt-money"><span>Ticket médio R$</span><input className="rt-input" style={{ maxWidth: 90 }} inputMode="decimal" value={ticket} placeholder="0" onChange={(e) => setTicket(e.target.value)} /></div>
          <p className="rt-hint" style={{ margin: 0 }}>A faixa (de/até) é o que faz a marca aparecer nos filtros de preço.</p>
          <input className="rt-input" value={tipos} placeholder="Tipos de peça, separados por vírgula" onChange={(e) => setTipos(e.target.value)} />
          <input className="rt-input" value={vibe} maxLength={140} placeholder="Que tipo de loja compra mais dessa marca" onChange={(e) => setVibe(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}><input className="rt-input" value={pmin2} placeholder="Pedido mínimo" onChange={(e) => setPmin2(e.target.value)} /><input className="rt-input" value={grade} placeholder="Grade de tamanhos" onChange={(e) => setGrade(e.target.value)} /></div>
          <input className="rt-input" value={pag} placeholder="Formas de pagamento" onChange={(e) => setPag(e.target.value)} />
          {(sujoLoja || sujoColab) && <button className="rt-btn" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar alterações"}</button>}
          <button className="rt-btn ghost" style={{ marginTop: 8 }} onClick={() => setCriandoAcesso(!criandoAcesso)}>{criandoAcesso ? "Cancelar" : "Criar Acesso para Marca"}</button>
          {criandoAcesso && <div style={{ marginTop: 10, border: "1.5px solid var(--rule)", borderRadius: 8, padding: 10 }}>
            <p style={{ fontSize: 12, marginBottom: 6 }}>Criar acesso para {l.nome}</p>
            <input className="rt-input" placeholder="E-mail da marca" value={acessoEmail} onChange={(e) => setAcessoEmail(e.target.value)} />
            <input className="rt-input" type="password" placeholder="Senha" value={acessoSenha} onChange={(e) => setAcessoSenha(e.target.value)} />
            <button className="rt-btn" disabled={!acessoEmail || !acessoSenha} onClick={criarAcessoMarca}>Criar acesso</button>
            {acessoMsg && <p style={{ fontSize: 11, marginTop: 4, color: acessoMsg.includes("Erro") ? "var(--red)" : "green" }}>{acessoMsg}</p>}
          </div>}
        </div>
      )}
    </div>
  );
}

function MarcaPanel({ loja, info, posts, onSaveColab, onCreatePost, onDeletePost, onClose }) {
  if (!loja) return null;
  const safeInfo = info || {};
  const lojaPosts = posts.filter((p) => p.loja_id === loja.id);
  const [aba, setAba] = useState("dados");
  const [edit, setEdit] = useState(false);
  const [nomeLoja, setNomeLoja] = useState(loja.nome || "");
  const [segmento, setSegmento] = useState(loja.segmento || "");
  const [shopping, setShopping] = useState(loja.shopping || "");
  const [telefone, setTelefone] = useState(loja.tel || "");
  const [instagram, setInstagram] = useState(loja.insta || "");
  const [ticket, setTicket] = useState(safeInfo.t != null ? String(safeInfo.t) : "");
  const [pmin, setPmin] = useState(safeInfo.mn != null ? String(safeInfo.mn) : "");
  const [pmax, setPmax] = useState(safeInfo.mx != null ? String(safeInfo.mx) : "");
  const [tipos, setTipos] = useState((safeInfo.p || []).join(", "));
  const [vibe, setVibe] = useState(safeInfo.v || "");
  const [min, setMin] = useState(safeInfo.min || "");
  const [pag, setPag] = useState(safeInfo.pag || "");
  const [grade, setGrade] = useState(safeInfo.gr || "");
  const [novo, setNovo] = useState({ titulo: "", descricao: "", preco: "", em_promocao: false, foto_url: "" });
  const [fotoLoja, setFotoLoja] = useState(loja.foto_url || "");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const uploadImagem = async (file) => {
    setEnviandoFoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `lojas/${loja.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("marca-fotos").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("marca-fotos").getPublicUrl(path);
      const url = pub.publicUrl;
      if (!url) throw new Error("URL pública da foto não foi retornada.");
      setFotoLoja(url);
      await supabase.from("lojas").update({ foto_url: url }).eq("id", loja.id);
    } catch (e) {
      console.error("uploadImagem", e);
      alert("Não foi possível enviar a imagem agora.");
    } finally {
      setEnviandoFoto(false);
    }
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const n = parseFloat(String(ticket).replace(",", "."));
      await onSaveColab(loja.id, { t: isNaN(n) ? null : Math.round(n), mn: pmin ? Math.round(parseFloat(pmin.replace(",", "."))) : null, mx: pmax ? Math.round(parseFloat(pmax.replace(",", "."))) : null, p: tipos.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean), v: vibe.trim(), min: min.trim() || null, pag: pag.trim() || null, gr: grade.trim() || null });
      await supabase.from("lojas").update({ nome: nomeLoja, segmento, shopping, telefone: telefone || null, instagram: instagram || null }).eq("id", loja.id);
      setEdit(false);
    } catch (e) {
      console.error("salvar marca", e);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="gc-browse" style={{ paddingTop: 60 }}>
      <nav className="gc-nav">
        <div className="gc-nav-left">
          <button className="gc-nav-link show-mobile" onClick={() => setPainelAba(null)}>← Voltar</button>
        </div>
        <div className="gc-nav-logo">
          GIRO CERTO
          <small>Painel da Marca</small>
        </div>
        <div className="gc-nav-right">
          <button className="gc-nav-link" onClick={onClose}>Sair</button>
        </div>
      </nav>
      <div className="gc-browse-body">
        <div className="gc-brands-area">
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 4 }}>{loja.nome}</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Gerencie os dados da sua marca e publique novidades na vitrine.</p>
          </div>
          <div className="gc-admin-abas" style={{ marginBottom: 14 }}>
            <button className={"gc-admin-aba" + (aba === "dados" ? " active" : "")} onClick={() => setAba("dados")}>Dados da Loja</button>
            <button className={"gc-admin-aba" + (aba === "vitrine" ? " active" : "")} onClick={() => setAba("vitrine")}>Minha Vitrine</button>
          </div>
          {aba === "dados" && <div className="gc-admin-card">
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            {(() => { const src = safeImgSrc(fotoLoja); return src ? <img src={src} alt="Foto da loja" onError={(e) => { e.target.style.display = "none"; }} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--rule)" }} /> : null; })()}
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Foto da loja</span>
                <input className="rt-input" type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) uploadImagem(f); }} disabled={enviandoFoto} />
              </div>
            </div>
            <div className="gc-mini-form">
              <input className="rt-input" value={nomeLoja} placeholder="Nome da marca" onChange={(e) => setNomeLoja(e.target.value)} disabled={!edit} />
              <div style={{ display: "flex", gap: 8 }}>
                <select className="rt-input" value={shopping} onChange={(e) => setShopping(e.target.value)} disabled={!edit}>
                  <option value="">Shopping</option>
                  {Object.entries(SHOPPINGS).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}
                </select>
                <select className="rt-input" value={segmento} onChange={(e) => setSegmento(e.target.value)} disabled={!edit}>
                  <option value="">Segmento</option>
                  {Object.keys(ICONES).map((sg) => <option key={sg} value={sg}>{sg}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="rt-input" value={telefone} placeholder="Telefone" onChange={(e) => setTelefone(e.target.value)} disabled={!edit} />
                <input className="rt-input" value={instagram} placeholder="Instagram" onChange={(e) => setInstagram(e.target.value)} disabled={!edit} />
              </div>
              <div className="gc-money"><span>Ticket médio R$</span><input className="rt-input" style={{ maxWidth: 100 }} inputMode="decimal" value={ticket} placeholder="0" onChange={(e) => setTicket(e.target.value)} disabled={!edit} /></div>
              <div className="gc-money"><span>Faixa R$</span><input className="rt-input" style={{ maxWidth: 90 }} inputMode="decimal" value={pmin} placeholder="de" onChange={(e) => setPmin(e.target.value)} disabled={!edit} /><span>até</span><input className="rt-input" style={{ maxWidth: 90 }} inputMode="decimal" value={pmax} placeholder="até" onChange={(e) => setPmax(e.target.value)} disabled={!edit} /></div>
              <input className="rt-input" value={tipos} placeholder="Tipos de peça, separados por vírgula" onChange={(e) => setTipos(e.target.value)} disabled={!edit} />
              <input className="rt-input" value={vibe} maxLength={140} placeholder="Personalidade da marca" onChange={(e) => setVibe(e.target.value)} disabled={!edit} />
              <div style={{ display: "flex", gap: 8 }}>
                <input className="rt-input" value={min} placeholder="Pedido mínimo" onChange={(e) => setMin(e.target.value)} disabled={!edit} />
                <input className="rt-input" value={grade} placeholder="Grade de tamanhos" onChange={(e) => setGrade(e.target.value)} disabled={!edit} />
              </div>
              <input className="rt-input" value={pag} placeholder="Formas de pagamento" onChange={(e) => setPag(e.target.value)} disabled={!edit} />
              {edit ? <button className="rt-btn" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar alterações"}</button> : <button className="rt-btn" onClick={() => setEdit(true)}>Editar dados</button>}
            </div>
          </div>}
          {aba === "vitrine" && <div className="gc-admin-card">
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input className="rt-input" placeholder="Título" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} />
              <button className="rt-btn" disabled={!novo.titulo.trim()} onClick={() => { onCreatePost(loja.id, novo.titulo, novo.descricao, novo.preco, novo.em_promocao, novo.foto_url); setNovo({ titulo: "", descricao: "", preco: "", em_promocao: false, foto_url: "" }); }}>Publicar</button>
            </div>
            <div className="gc-mini-form">
              <textarea className="rt-area" placeholder="Descrição (opcional)" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} />
              <input className="rt-input" placeholder="Preço R$ (opcional)" inputMode="decimal" value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: e.target.value })} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><input type="checkbox" checked={novo.em_promocao} onChange={(e) => setNovo({ ...novo, em_promocao: e.target.checked })} /> Em promoção</label>
              <input className="rt-input" placeholder="URL da foto (opcional)" value={novo.foto_url} onChange={(e) => setNovo({ ...novo, foto_url: e.target.value })} />
              <div>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Ou envie uma imagem</span>
                <input className="rt-input" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const ext = f.name.split(".").pop() || "jpg"; const path = `posts/${loja.id}/${Date.now()}.${ext}`; const { error } = await supabase.storage.from("marca-fotos").upload(path, f, { upsert: true, cacheControl: "3600", contentType: f.type }); if (error) throw error; const { data: pub } = supabase.storage.from("marca-fotos").getPublicUrl(path); setNovo((prev) => ({ ...prev, foto_url: pub.publicUrl })); } catch (err) { console.error("upload post", err); } }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {lojaPosts.map((p) => (
                <div key={p.id} style={{ border: "1.5px solid var(--rule)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{p.titulo}</b>
                    {p.descricao && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{p.descricao}</p>}
                    {p.preco != null && <p style={{ fontSize: 12, marginTop: 4 }}>R$ {Number(p.preco).toFixed(2)} /peça</p>}
                    {p.em_promocao && <span style={{ fontSize: 10, background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 99, marginTop: 4, display: "inline-block" }}>Promoção</span>}
                  </div>
                  <button className="rt-btn ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => onDeletePost(p.id)}>Excluir</button>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

function LojistaPanel({ perfil, favs, revsByLoja, lojas, colab, onSalvarDados, onClose }) {
  const [aba, setAba] = useState("curadorias");
  const [dados, setDados] = useState({ nome: perfil && perfil.nome ? perfil.nome : "", cidade: perfil && perfil.cidade ? perfil.cidade : "", estado: perfil && perfil.estado ? perfil.estado : "", telefone: perfil && perfil.telefone ? perfil.telefone : "" });
  const [salvando, setSalvando] = useState(false);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [feedback, setFeedback] = useState({});
  const lojasFav = lojas.filter((l) => favs.includes(l.id));
  const avaliacoes = Object.entries(revsByLoja).flatMap(([lojaId, rs]) => rs.map((r) => ({ ...r, lojaId })));
  const lojaNome = (id) => { const l = lojas.find((x) => x.id === id); return l ? l.nome : "Loja"; };

  useEffect(() => {
    if (!perfil?.id) return;
    carregarCuradoriaItensDoLojista(perfil.id).then(setRecomendacoes);
  }, [perfil]);

  const carregarCuradoriaItensDoLojista = async (lojistaId) => {
    const { data } = await supabase.from("consultorias").select("id").eq("usuario_id", lojistaId).eq("status", "concluida").order("created_at", { ascending: false }).limit(1);
    const curadoria = data && data[0];
    if (!curadoria) return [];
    return carregarCuradoriaItens(curadoria.id);
  };

  const salvarDados = async () => {
    setSalvando(true);
    await onSalvarDados({ nome: dados.nome || "Lojista", cidade: dados.cidade, estado: dados.estado, telefone: dados.telefone });
    setSalvando(false);
  };

  const marcarFeedback = async (itemId, tipo) => {
    setFeedback((prev) => ({ ...prev, [itemId]: tipo }));
  };

  return (
    <div className="rt-backdrop" style={{ alignItems: "flex-start", justifyContent: "center" }} onClick={onClose}>
      <div className="rt-modal-c rt-admin" onClick={(e) => e.stopPropagation()}>
        <div className="rt-admin-top"><h3 className="rt-modal-t" style={{ margin: 0 }}>Painel do Lojista</h3><button className="rt-btn ghost" onClick={onClose}>×</button></div>
        <div className="rt-admin-abas">
          <button className={"rt-admin-aba" + (aba === "curadorias" ? " active" : "")} onClick={() => setAba("curadorias")}>Curadorias</button>
          <button className={"rt-admin-aba" + (aba === "recomendacoes" ? " active" : "")} onClick={() => setAba("recomendacoes")}>Sua Curadoria Personalizada</button>
          <button className={"rt-admin-aba" + (aba === "favoritos" ? " active" : "")} onClick={() => setAba("favoritos")}>Favoritos</button>
          <button className={"rt-admin-aba" + (aba === "avaliacoes" ? " active" : "")} onClick={() => setAba("avaliacoes")}>Avaliações</button>
          <button className={"rt-admin-aba" + (aba === "dados" ? " active" : "")} onClick={() => setAba("dados")}>Meus dados</button>
        </div>
        {aba === "curadorias" && <div><p className="rt-hint">Aqui você acompanha seus pedidos de curadoria.</p><p className="rt-nenhuma">Funcionalidade em breve: visualize status e histórico.</p></div>}
        {aba === "recomendacoes" && <div>
          <p className="rt-hint" style={{ marginBottom: 10 }}>Estas marcas foram selecionadas pela nossa equipe para você.</p>
          {recomendacoes.length === 0 && <p className="rt-nenhuma">Nenhuma recomendação personalizada ainda. Faça uma curadoria para receber sugestões.</p>}
          {recomendacoes.map((item) => {
            const l = lojas.find((x) => x.id === item.loja_id);
            if (!l) return null;
            const info = colab[l.id];
            const fb = feedback[item.id];
            return (<div key={item.id} style={{ border: "1.5px solid var(--rule)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <b style={{ fontSize: 14 }}>{l.nome}</b>
                  <span className="rt-lead-sub" style={{ marginLeft: 8 }}>{l.segmento} · {SHOPPINGS[l.sh].curto}</span>
                  {info && info.t != null && <span className="rt-lead-sub" style={{ marginLeft: 8 }}>R$ {info.t} /peça</span>}
                </div>
              </div>
              {item.observacao && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Obs: {item.observacao}</p>}
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={"rt-chip" + (fb === "gostei" ? " active" : "")} onClick={() => marcarFeedback(item.id, "gostei")}>Gostei</button>
                <button className={"rt-chip" + (fb === "nao" ? " active" : "")} onClick={() => marcarFeedback(item.id, "nao")}>Não faz meu estilo</button>
                <a className="rt-chip" href={waLink(l.tel)} target="_blank" rel="noreferrer">Entrar em Contato</a>
              </div>
            </div>);
          })}
        </div>}
        {aba === "favoritos" && <div>
          <p className="rt-hint">{lojasFav.length} lojas favoritadas</p>
          {lojasFav.length === 0 && <p className="rt-nenhuma">Você ainda não favoritou nenhuma marca.</p>}
          {lojasFav.map((l) => <div key={l.id} className="rt-loja-adm" style={{ marginTop: 8 }}><b>{l.nome}</b><span className="rt-lead-sub">{l.segmento} · {SHOPPINGS[l.sh].curto}</span></div>)}
        </div>}
        {aba === "avaliacoes" && <div>
          <p className="rt-hint">{avaliacoes.length} avaliações publicadas</p>
          {avaliacoes.length === 0 && <p className="rt-nenhuma">Você ainda não avaliou nenhuma marca.</p>}
          {avaliacoes.map((r) => <div key={r.id} className="rt-review" style={{ marginTop: 8 }}><div className="rt-review-top"><span className="rt-review-autor">{lojaNome(r.lojaId)}</span><span className="rt-review-data">{dataCurta(r.data)}</span></div><Stars value={r.nota} />{r.comentario && <p className="rt-review-txt">{r.comentario}</p>}</div>)}
        </div>}
        {aba === "dados" && <div>
          <div className="rt-mini-form">
            <input className="rt-input" value={dados.nome} placeholder="Nome da loja" onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
            <input className="rt-input" value={dados.cidade} placeholder="Cidade" onChange={(e) => setDados({ ...dados, cidade: e.target.value })} />
            <select className="rt-input" value={dados.estado} onChange={(e) => setDados({ ...dados, estado: e.target.value })}><option value="">UF</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
            <input className="rt-input" value={dados.telefone} placeholder="WhatsApp" onChange={(e) => setDados({ ...dados, telefone: e.target.value })} />
            <button className="rt-btn" disabled={salvando} onClick={salvarDados}>{salvando ? "Salvando…" : "Salvar dados"}</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

function SuperAdminPanel({ lojas, colab, revsByLoja, posts, onDeletePost, onUpdateLoja, onSaveColab, onCriarLoja, onDeleteReview, onDestaque, onReordenar, onClose }) {
  const [aba, setAba] = useState("resumo");
  const [curadorias, setCuradorias] = useState(null); const [lojistas, setLojistas] = useState(null);
  const [busca, setBusca] = useState(""); const [buscaUser, setBuscaUser] = useState(""); const [filtroStatus, setFiltroStatus] = useState("todos");
  const [salvandoId, setSalvandoId] = useState(null); const [novaLoja, setNovaLoja] = useState(null);
  const [curadoriaAberta, setCuradoriaAberta] = useState(null);
  const [lojasSelecionadas, setLojasSelecionadas] = useState([]);
  const [obsSelecionadas, setObsSelecionadas] = useState({});
  useEffect(() => {
    supabase.from("consultorias").select("*").order("created_at", { ascending: false }).then(({ data }) => setCuradorias(data || []));
    supabase.from("perfis").select("*").order("created_at", { ascending: false }).then(({ data }) => setLojistas(data || []));
  }, []);
  const perfilDe = (uid) => (lojistas || []).find((u) => u.id === uid) || {};
  const mudarStatus = async (c, novoStatus) => { await supabase.from("consultorias").update({ status: novoStatus }).eq("id", c.id); setCuradorias((prev) => prev.map((x) => x.id === c.id ? { ...x, status: novoStatus } : x)); };
  const mudarPapel = async (uid, novoPapel) => { await supabase.from("perfis").update({ papel: novoPapel }).eq("id", uid); setLojistas((prev) => (prev || []).map((u) => u.id === uid ? { ...u, papel: novoPapel } : u)); };
  const abrirCuradoria = async (c) => {
    setCuradoriaAberta(c);
    const itens = await carregarCuradoriaItens(c.id);
    setLojasSelecionadas(itens.map((i) => i.loja_id));
    setObsSelecionadas(itens.reduce((acc, i) => ({ ...acc, [i.loja_id]: i.observacao || "" }), {}));
  };
  const salvarCuradoria = async () => {
    if (!curadoriaAberta) return;
    await salvarItensCuradoria(curadoriaAberta.id, lojasSelecionadas, obsSelecionadas);
    setCuradoriaAberta(null);
    setLojasSelecionadas([]);
    setObsSelecionadas({});
  };
  const curFiltradas = (curadorias || []).filter((c) => filtroStatus === "todos" || c.status === filtroStatus);
  const novos = (curadorias || []).filter((c) => c.status === "novo").length;
  const destaques = lojas.filter((l) => l.destaque).sort((a, b) => a.ordem - b.ordem);
  const lojasFiltradas = lojas.filter((l) => norm(l.nome).includes(norm(busca)));
  const usersFiltrados = (lojistas || []).filter((u) => norm(u.nome || "").includes(norm(buscaUser)) || norm(u.nome_completo || "").includes(norm(buscaUser)) || (u.cnpj || "").includes(buscaUser) || norm(u.cidade || "").includes(norm(buscaUser)));
  const comDados = lojas.filter((l) => colab[l.id] && colab[l.id].t != null).length;
  const totalRev = Object.values(revsByLoja).reduce((s, r) => s + r.length, 0);
  const waDe = (u) => waLink(u.telefone, `Oi ${(u.nome_completo || u.nome || "").split(" ")[0]}! Aqui é do Giro Certo. Vi seu pedido de curadoria.`);
  const baixarCSV = (linhas, nome) => { const csv = linhas.map((r) => r.map((c) => `"${String(c == null ? "" : c).replace(/"/g, '""')}"`) .join(",")).join("\n"); const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv); a.download = nome; a.click(); };
  const ABAS = [{ id: "resumo", nome: "Resumo" }, { id: "curadorias", nome: `Curadorias${novos ? ` (${novos})` : ""}` }, { id: "lojistas", nome: "Lojistas" }, { id: "lojas", nome: "Lojas" }, { id: "destaques", nome: `Destaques (${destaques.length})` }, { id: "papeis", nome: "Papéis" }, { id: "vitrine", nome: "Vitrine" }];

  return (
    <DashboardLayout papel="admin" activeTab={aba} onNavigate={setAba} onClose={onClose}>
        {aba === "resumo" && <div><div className="rt-kpis"><div className="rt-kpi"><b>{lojistas ? lojistas.length : "—"}</b><span>lojistas cadastradas</span></div><div className="rt-kpi destaque"><b>{novos}</b><span>curadorias novas</span></div><div className="rt-kpi"><b>{lojas.length}</b><span>marcas no roteiro</span></div><div className="rt-kpi"><b>{comDados}</b><span>marcas com preço</span></div><div className="rt-kpi"><b>{destaques.length}</b><span>marcas indicadas</span></div><div className="rt-kpi"><b>{totalRev}</b><span>avaliações</span></div></div>{novos > 0 && <button className="rt-btn" style={{ marginTop: 10 }} onClick={() => setAba("curadorias")}>Ver {novos} pedido{novos > 1 ? "s" : ""} de curadoria</button>}</div>}
        {aba === "curadorias" && <div>
          <div className="rt-admin-filtros">{["todos", "novo", "falei", "cliente", "nao"].map((st) => <button key={st} className="rt-chip" data-on={filtroStatus === st ? "1" : "0"} onClick={() => setFiltroStatus(st)}>{st === "todos" ? "Todos" : st === "novo" ? "Novos" : st === "falei" ? "Já falei" : st === "cliente" ? "Virou cliente" : "Não deu"}</button>)}</div>
          {curadorias === null && <p className="rt-hint">Carregando…</p>}
          {curFiltradas.map((c) => { const u = perfilDe(c.usuario_id); return (<div className="rt-lead" key={c.id} data-status={c.status}>
            <div className="rt-lead-top"><div><b>{u.nome || "Lojista"}</b><span className="rt-lead-sub">{u.nome_completo || ""}{u.cidade ? ` · ${u.cidade}` : ""}</span></div><span className="rt-lead-sub">{dataBR((c.created_at || "").slice(0, 10))}</span></div>
            <div className="rt-lead-tags">{c.faixa_compra && <span className="rt-lead-tag forte">{c.faixa_compra}</span>}{c.canal_venda && <span className="rt-lead-tag">{c.canal_venda}</span>}</div>
            {c.observacao && <p className="rt-lead-obs">"{c.observacao}"</p>}
            <div className="rt-lead-acoes">
              {waDe(u) && <a className="rt-btn" style={{ textDecoration: "none", padding: "8px 12px", fontSize: 12 }} href={waDe(u)} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}
              <button className="rt-btn" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => abrirCuradoria(c)}>Recomendar Marcas</button>
              <select className="rt-input" style={{ maxWidth: 150, padding: "8px 10px", fontSize: 12 }} value={c.status} onChange={(e) => mudarStatus(c, e.target.value)}><option value="novo">Novo</option><option value="falei">Já falei</option><option value="cliente">Virou cliente</option><option value="nao">Não deu</option></select>
            </div>
          </div>); })}
          {curadoriaAberta && <div style={{ marginTop: 20, border: "1.5px solid var(--rule)", borderRadius: 10, padding: 14 }}>
            <p style={{ marginBottom: 8 }}><b>Recomendar marcas para:</b> {perfilDe(curadoriaAberta.usuario_id).nome_completo || perfilDe(curadoriaAberta.usuario_id).nome}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
              {lojas.map((l) => {
                const ativo = lojasSelecionadas.includes(l.id);
                const info = colab[l.id];
                return (<div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--rule)" }}>
                  <input type="checkbox" checked={ativo} onChange={(e) => { const next = e.target.checked ? [...lojasSelecionadas, l.id] : lojasSelecionadas.filter((id) => id !== l.id); setLojasSelecionadas(next); }} />
                  <div style={{ flex: 1 }}><b>{l.nome}</b><span className="rt-lead-sub">{l.segmento} · {SHOPPINGS[l.sh].curto}{info && info.t != null ? ` · R$ ${info.t}` : ""}</span></div>
                  {ativo && <input className="rt-input" placeholder="Observação" value={obsSelecionadas[l.id] || ""} onChange={(e) => setObsSelecionadas({ ...obsSelecionadas, [l.id]: e.target.value })} style={{ maxWidth: 160 }} />}
                </div>);
              })}
            </div>
            <div className="rt-save-row" style={{ marginTop: 10 }}>
              <button className="rt-btn" disabled={!lojasSelecionadas.length} onClick={salvarCuradoria}>Salvar recomendação</button>
              <button className="rt-btn ghost" onClick={() => { setCuradoriaAberta(null); setLojasSelecionadas([]); setObsSelecionadas({}); }}>Cancelar</button>
            </div>
          </div>}
        </div>}
        {aba === "lojistas" && <div><input className="rt-input" value={buscaUser} placeholder="Buscar por nome, CNPJ/CPF ou cidade…" onChange={(e) => setBuscaUser(e.target.value)} /><p className="rt-hint" style={{ margin: "8px 0" }}>{usersFiltrados.length} de {lojistas ? lojistas.length : 0} cadastradas</p><div>{usersFiltrados.map((u) => <div className="rt-lead" key={u.id}><div className="rt-lead-top"><div><b>{u.nome}</b><span className="rt-lead-sub">{u.nome_completo || "—"}</span></div></div><p className="rt-lead-linha">{u.cnpj || "sem documento"}{u.telefone ? ` · ${u.telefone}` : ""}{u.cidade ? ` · ${u.cidade}` : ""}</p>{waLink(u.telefone) && <a style={{ color: "var(--red)", fontSize: 12 }} href={waLink(u.telefone)} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}</div>)}</div></div>}
        {aba === "lojas" && <div><div style={{ display: "flex", gap: 8 }}><input className="rt-input" value={busca} placeholder="Buscar marca para editar…" onChange={(e) => setBusca(e.target.value)} /><button className="rt-btn" style={{ whiteSpace: "nowrap" }} onClick={() => setNovaLoja({ nome: "", segmento: "Feminina", shopping: "M", telefone: "", instagram: "" })}>+ Nova</button></div>{novaLoja && <div className="rt-loja-adm" style={{ borderColor: "var(--red)", marginTop: 12 }}><p className="rt-block-lab" style={{ marginTop: 0 }}>Adicionar marca</p><div className="rt-mini-form"><input className="rt-input" value={novaLoja.nome} placeholder="Nome da marca" onChange={(e) => setNovaLoja({ ...novaLoja, nome: e.target.value })} autoFocus /><div style={{ display: "flex", gap: 8 }}><select className="rt-input" value={novaLoja.shopping} onChange={(e) => setNovaLoja({ ...novaLoja, shopping: e.target.value })}>{Object.entries(SHOPPINGS).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}</select><select className="rt-input" value={novaLoja.segmento} onChange={(e) => setNovaLoja({ ...novaLoja, segmento: e.target.value })}>{Object.keys(ICONES).map((sg) => <option key={sg} value={sg}>{sg}</option>)}</select></div><div style={{ display: "flex", gap: 8 }}><input className="rt-input" value={novaLoja.telefone} placeholder="Telefone" onChange={(e) => setNovaLoja({ ...novaLoja, telefone: e.target.value })} /><input className="rt-input" value={novaLoja.instagram} placeholder="Instagram" onChange={(e) => setNovaLoja({ ...novaLoja, instagram: e.target.value })} /></div><div className="rt-save-row"><button className="rt-btn" disabled={!novaLoja.nome.trim()} onClick={async () => { const ok = await onCriarLoja(novaLoja); if (ok) setNovaLoja(null); }}>Adicionar</button><button className="rt-btn ghost" onClick={() => setNovaLoja(null)}>Cancelar</button></div></div></div>}<div style={{ marginTop: 12 }}>{lojasFiltradas.slice(0, 30).map((l) => <SuperSuperSuperAdminLojaRow key={l.id} l={l} info={colab[l.id]} salvando={salvandoId === l.id} onSave={async (patch, patchColab) => { setSalvandoId(l.id); if (patch) await onUpdateLoja(l.id, patch); if (patchColab) await onSaveColab(l.id, patchColab); setSalvandoId(null); }} onDestaque={onDestaque} />)}{lojasFiltradas.length > 30 && <p className="rt-hint">Mostrando 30 de {lojasFiltradas.length} — refine a busca.</p>}</div></div>}
        {aba === "destaques" && <div><p className="rt-hint">Estas marcas aparecem primeiro pra todo mundo, com o selo «Indicada».</p>{destaques.length === 0 && <p className="rt-nenhuma">Nenhuma marca destacada. Use a estrela na aba «Lojas».</p>}{destaques.map((l, i) => <div className="rt-dest-row" key={l.id}><span className="rt-dest-n">{i + 1}</span><div style={{ flex: 1 }}><b>{l.nome}</b><span className="rt-lead-sub">{l.segmento} · {SHOPPINGS[l.sh].curto}</span></div><button className="rt-mini-btn" disabled={i === 0} onClick={() => onReordenar(l, -1)}>↑</button><button className="rt-mini-btn" disabled={i === destaques.length - 1} onClick={() => onReordenar(l, 1)}>↓</button><button className="rt-mini-btn tirar" onClick={() => onDestaque(l)}>✕</button></div>)}</div>}
        {aba === "papeis" && <div><input className="rt-input" value={buscaUser} placeholder="Buscar por nome, CNPJ/CPF ou cidade…" onChange={(e) => setBuscaUser(e.target.value)} /><p className="rt-hint" style={{ margin: "8px 0" }}>{usersFiltrados.length} de {lojistas ? lojistas.length : 0} cadastradas</p><div>{usersFiltrados.map((u) => <div className="rt-lead" key={u.id}><div className="rt-lead-top"><div><b>{u.nome}</b><span className="rt-lead-sub">{u.nome_completo || "—"}</span></div><select className="rt-input" style={{ maxWidth: 130, padding: "6px 8px", fontSize: 12 }} value={u.papel || "lojista"} onChange={(e) => mudarPapel(u.id, e.target.value)}><option value="admin">Admin</option><option value="marca">Marca</option><option value="lojista">Lojista</option></select></div><p className="rt-lead-linha">{u.cnpj || "sem documento"}{u.telefone ? ` · ${u.telefone}` : ""}{u.cidade ? ` · ${u.cidade}` : ""}</p>{waLink(u.telefone) && <a style={{ color: "var(--red)", fontSize: 12 }} href={waLink(u.telefone)} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}</div>)}</div></div>}
        {aba === "vitrine" && <div><p className="rt-hint">Gerencie os posts de todas as lojas.</p><input className="rt-input" value={busca} placeholder="Buscar marca…" onChange={(e) => setBusca(e.target.value)} />{lojasFiltradas.slice(0, 30).map((l) => { const lojaPosts = (posts || []).filter((p) => p.loja_id === l.id); return <div key={l.id} style={{ border: "1.5px solid var(--rule)", borderRadius: 10, padding: 12, marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><b style={{ fontSize: 14 }}>{l.nome}</b><span className="rt-lead-sub">{SHOPPINGS[l.sh].curto}</span></div><p className="rt-hint" style={{ margin: "6px 0" }}>{lojaPosts.length} post{lojaPosts.length === 1 ? "" : "s"}</p><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{lojaPosts.map((p) => <span key={p.id} style={{ fontSize: 11, background: "var(--bone)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--rule)" }}>{p.titulo} <button style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }} onClick={() => onDeletePost(p.id)}>×</button></span>)}</div></div>; })}</div>}
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Porta de entrada
// ---------------------------------------------------------------------------
function PortaEntrada({ onEntrar }) {
  return (
    <div className="rt-porta">
      <div className="rt-porta-in">
        <p style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--red)", marginBottom: 8 }}>Giro Certo</p>
        <h1 className="rt-porta-tit">As marcas do polo,<br />na palma da sua mão.</h1>
        <p className="rt-porta-sub">Master Cianorte, Paraná Moda Park, Vest Sul e Shopping Brasil reunidos num roteiro só — com contato direto de cada marca, tipo de peça e faixa de preço.</p>
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

// ---------------------------------------------------------------------------
// App Principal
// ---------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(undefined);
  const [perfil, setPerfil] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [colab, setColab] = useState({});
  const [revs, setRevs] = useState({});
  const [favs, setFavs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [posts, setPosts] = useState([]);
  const [mostrarVitrine, setMostrarVitrine] = useState(false);
  const [novoPost, setNovoPost] = useState({ titulo: "", descricao: "", preco: "", em_promocao: false, foto_url: "" });

  // Navegação
  const [pagina, setPagina] = useState("home"); // "home" | "browse" | "favoritos" | "perfil"
  const [aberta, setAberta] = useState(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("todos");
  const [shop, setShop] = useState("todos");
  const [faixa, setFaixa] = useState("todas");
  const [soFav, setSoFav] = useState(false);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState(false);
  const [visible, setVisible] = useState(20); // paginação

  // Modais
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarShoppings, setMostrarShoppings] = useState(false);
  const [mostrarComo, setMostrarComo] = useState(false);
  const [painelAba, setPainelAba] = useState(null);
  const [mostrarCuradoria, setMostrarCuradoria] = useState(false);
  const [mostrarAi, setMostrarAi] = useState(false);
  const [csv, setCsv] = useState(null);
  const [mostrarPrivacidade, setMostrarPrivacidade] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);

  // Sessão
  useEffect(() => {
    let mounted = true;
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (mounted) setSession(data.session);
      }).catch((e) => {
        console.error("getSession falhou", e);
        if (mounted) setSession(null);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
        if (mounted) setSession(s);
      });
      return () => { mounted = false; sub.subscription.unsubscribe(); };
    } catch (e) {
      console.error("auth init falhou", e);
      if (mounted) setSession(null);
    }
  }, []);

  const mapLoja = (l) => ({
    id: l.id, nome: l.nome, segmento: l.segmento, sh: l.shopping,
    tel: l.telefone || null, insta: l.instagram || null, exc: !!l.exclusiva,
    destaque: !!l.destaque, ordem: l.destaque_ordem == null ? 999 : l.destaque_ordem,
  });

  const carregarLojas = useCallback(async (logado) => {
    try {
      const { data, error } = logado
        ? await supabase.from("lojas").select("*").order("nome")
        : await supabase.from("lojas_publicas").select("*").order("nome");
      if (!error && data) setLojas(data.map(mapLoja));
    } catch (e) {
      console.error("carregarLojas", e);
    }
  }, []);
  const carregarColab = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("loja_colab").select("*");
      if (!error && data) { const m = {}; data.forEach((c) => { m[c.loja_id] = { t: c.ticket_medio, mn: c.preco_min, mx: c.preco_max, p: c.tipos_peca || [], v: c.personalidade, min: c.pedido_minimo, pag: c.formas_pagamento, gr: c.grade_tamanhos }; }); setColab(m); }
    } catch (e) {
      console.error("carregarColab", e);
    }
  }, []);
  const carregarRevs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("avaliacoes").select("*").order("created_at");
      if (!error && data) { const m = {}; data.forEach((r) => { (m[r.loja_id] = m[r.loja_id] || []).push({ id: r.id, loja_id: r.loja_id, autor: r.autor_nome, nota: r.nota, comentario: r.comentario, data: r.created_at }); }); setRevs(m); }
    } catch (e) {
      console.error("carregarRevs", e);
    }
  }, []);
  const carregarPerfil = useCallback(async (uid) => {
    try {
      const { data } = await supabase.from("perfis").select("*").eq("id", uid).single();
      if (data) setPerfil(data);
    } catch (e) {
      console.error("carregarPerfil", e);
    }
  }, []);
  const carregarFavs = useCallback(async (uid) => {
    try {
      const { data } = await supabase.from("favoritos").select("loja_id").eq("usuario_id", uid);
      if (data) setFavs(data.map((f) => f.loja_id));
    } catch (e) {
      console.error("carregarFavs", e);
    }
  }, []);

  const carregarPosts = useCallback(async (lojaId) => {
    try {
      const { data, error } = await supabase.from("lojas_posts").select("*").eq("loja_id", lojaId).order("created_at", { ascending: false });
      if (!error && data) setPosts(data || []);
    } catch (e) {
      console.error("carregarPosts", e);
    }
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    (async () => {
      try {
        setCarregando(true);
        await Promise.all([carregarLojas(!!session), carregarColab(), carregarRevs()]);
        if (session) await Promise.all([carregarPerfil(session.user.id), carregarFavs(session.user.id)]);
        else { setPerfil(null); setFavs([]); }
      } catch (e) {
        console.error("carregamento inicial", e);
      } finally {
        setCarregando(false);
      }
    })();
  }, [session, carregarLojas, carregarColab, carregarRevs, carregarPerfil, carregarFavs]);

  useEffect(() => {
    if (!aberta) return;
    carregarPosts(aberta.id);
  }, [aberta, carregarPosts]);

  const salvarInfo = useCallback(async (lojaId, patch) => {
    if (!session) return false;
    const { error } = await supabase.from("loja_colab").upsert({ loja_id: lojaId, ticket_medio: patch.t, tipos_peca: patch.p, personalidade: patch.v, atualizado_por: session.user.id, atualizado_em: new Date().toISOString() });
    if (error) { setErro(true); return false; }
    setColab((prev) => ({ ...prev, [lojaId]: { ...(prev[lojaId] || {}), ...patch } })); setErro(false); return true;
  }, [session]);

  const salvarReview = useCallback(async (lojaId, { nota, comentario }) => {
    if (!session) return false;
    const { data, error } = await supabase.from("avaliacoes").insert({ loja_id: lojaId, autor_id: session.user.id, autor_nome: (perfil && perfil.nome) || "Lojista", nota, comentario }).select().single();
    if (error) { setErro(true); return false; }
    setRevs((prev) => ({ ...prev, [lojaId]: [...(prev[lojaId] || []), { id: data.id, loja_id: lojaId, autor: data.autor_nome, nota: data.nota, comentario: data.comentario, data: data.created_at }] })); setErro(false); return true;
  }, [session, perfil]);

  const toggleFav = useCallback(async (lojaId) => {
    if (!session) { setMostrarAuth(true); return; }
    const uid = session.user.id;
    if (favs.includes(lojaId)) { await supabase.from("favoritos").delete().eq("usuario_id", uid).eq("loja_id", lojaId); setFavs((f) => f.filter((x) => x !== lojaId)); }
    else { await supabase.from("favoritos").insert({ usuario_id: uid, loja_id: lojaId }); setFavs((f) => [...f, lojaId]); }
  }, [session, favs]);

  const enviarCuradoria = async (dados) => {
    if (!session) { setMostrarAuth(true); return false; }
    const { error } = await supabase.from("consultorias").insert({ usuario_id: session.user.id, faixa_compra: dados.faixa || null, canal_venda: dados.canal || null, onde_compra: dados.onde || [], segmentos: dados.segmentos || [], tempo_loja: dados.tempo || null, frete: dados.frete || null, guia: dados.guia || null, observacao: dados.observacao || null, status: "pendente" });
    if (error) { setErro(true); return false; } setErro(false); return true;
  };
  const carregarCuradoriaItens = useCallback(async (curadoriaId) => {
    const { data } = await supabase.from("curadoria_itens").select("*").eq("curadoria_id", curadoriaId);
    return data || [];
  }, []);
  const salvarItensCuradoria = async (curadoriaId, lojasIds, obsMap) => {
    await supabase.from("curadoria_itens").delete().eq("curadoria_id", curadoriaId);
    const inserts = lojasIds.map((lojaId) => ({ curadoria_id: curadoriaId, loja_id: lojaId, observacao: obsMap[lojaId] || null }));
    if (inserts.length) await supabase.from("curadoria_itens").insert(inserts);
    await supabase.from("consultorias").update({ status: "concluida" }).eq("id", curadoriaId);
  };
  const criarPost = async (lojaId, titulo, descricao, preco, em_promocao, foto_url) => {
    if (!session) return;
    const precoNum = preco ? parseFloat(String(preco).replace(",", ".")) : null;
    const { error } = await supabase.from("lojas_posts").insert({ loja_id: lojaId, titulo: titulo.trim(), descricao: descricao.trim() || null, preco: isNaN(precoNum) ? null : precoNum, em_promocao: !!em_promocao, foto_url: foto_url.trim() || null });
    if (!error) { setPosts((prev) => [{ id: Date.now(), loja_id: lojaId, titulo: titulo.trim(), descricao: descricao.trim() || null, preco: isNaN(precoNum) ? null : precoNum, em_promocao: !!em_promocao, foto_url: foto_url.trim() || null, created_at: new Date().toISOString() }, ...prev]); }
  };
  const excluirPost = async (postId) => {
    const { error } = await supabase.from("lojas_posts").delete().eq("id", postId);
    if (!error) setPosts((prev) => prev.filter((p) => p.id !== postId));
  };
  const salvarNomePerfil = async (nome) => { if (!session) return; await supabase.from("perfis").update({ nome: nome || "Lojista" }).eq("id", session.user.id); setPerfil((p) => ({ ...p, nome: nome || "Lojista" })); setMostrarPerfil(false); };
  const salvarDadosLojista = async (patch) => { if (!session) return; await supabase.from("perfis").update(patch).eq("id", session.user.id); setPerfil((p) => ({ ...p, ...patch })); };
  const sair = async () => { await supabase.auth.signOut(); setMostrarPerfil(false); };
  const updateLojaAdmin = async (id, patch) => { const { error } = await supabase.from("lojas").update(patch).eq("id", id); if (!error) setLojas((prev) => prev.map((l) => l.id === id ? { ...l, nome: patch.nome, tel: patch.telefone, insta: patch.instagram, foto_url: patch.foto_url || l.foto_url } : l)); return !error; };
  const toggleDestaque = async (l) => { const novo = !l.destaque; const ordem = novo ? lojas.filter((x) => x.destaque).length + 1 : null; const { error } = await supabase.from("lojas").update({ destaque: novo, destaque_ordem: ordem }).eq("id", l.id); if (!error) setLojas((prev) => prev.map((x) => x.id === l.id ? { ...x, destaque: novo, ordem: ordem == null ? 999 : ordem } : x)); };
  const criarLoja = async (nova) => { const { data, error } = await supabase.from("lojas").insert({ nome: nova.nome.trim(), segmento: nova.segmento, shopping: nova.shopping, telefone: nova.telefone.trim() || null, instagram: nova.instagram.trim() || null, exclusiva: true }).select().single(); if (error) { setErro(true); return false; } setLojas((prev) => [...prev, mapLoja(data)].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))); return true; };
  const reordenarDestaque = async (l, dir) => { const lista = lojas.filter((x) => x.destaque).sort((a, b) => a.ordem - b.ordem); const i = lista.findIndex((x) => x.id === l.id); const j = i + dir; if (j < 0 || j >= lista.length) return; const a = lista[i], b = lista[j]; await Promise.all([supabase.from("lojas").update({ destaque_ordem: b.ordem }).eq("id", a.id), supabase.from("lojas").update({ destaque_ordem: a.ordem }).eq("id", b.id)]); setLojas((prev) => prev.map((x) => x.id === a.id ? { ...x, ordem: b.ordem } : x.id === b.id ? { ...x, ordem: a.ordem } : x)); };
  const salvarColabAdmin = async (lojaId, patch) => { const { error } = await supabase.from("loja_colab").upsert({ loja_id: lojaId, ticket_medio: patch.t, preco_min: patch.mn, preco_max: patch.mx, tipos_peca: patch.p, personalidade: patch.v, pedido_minimo: patch.min, formas_pagamento: patch.pag, grade_tamanhos: patch.gr, atualizado_por: session.user.id, atualizado_em: new Date().toISOString() }); if (!error) setColab((prev) => ({ ...prev, [lojaId]: { ...(prev[lojaId] || {}), ...patch } })); return !error; };
  const deleteReviewAdmin = async (reviewId, lojaId) => { const { error } = await supabase.from("avaliacoes").delete().eq("id", reviewId); if (!error) setRevs((prev) => ({ ...prev, [lojaId]: (prev[lojaId] || []).filter((r) => r.id !== reviewId) })); };

  const SEGMENTOS = useMemo(() => [...new Set(lojas.map((l) => l.segmento))].sort((a, b) => a.localeCompare(b, "pt-BR")), [lojas]);

  const filtradas = useMemo(() => {
    const q = norm(busca);
    const f = FAIXAS.find((x) => x.id === faixa);
    const base = pagina === "favoritos" ? lojas.filter((l) => favs.includes(l.id)) : lojas;
    return base.filter((l) => {
      const d = colab[l.id];
      if (q) { const tagsMatch = d && d.p && d.p.some((t) => norm(t).includes(q)); const vibeMatch = d && d.v && norm(d.v).includes(q); if (!norm(l.nome).includes(q) && !norm(l.segmento).includes(q) && !tagsMatch && !vibeMatch) return false; }
      if (catAtiva !== "todos" && l.segmento !== catAtiva) return false;
      if (shop !== "todos" && l.sh !== shop) return false;
      if (f && f.faixa) { if (!d || d.t == null) return false; const mn = d.mn != null ? d.mn : d.t; const mx = d.mx != null ? d.mx : d.t; if (mn > f.faixa[1] || mx < f.faixa[0]) return false; }
      if (soFav && !favs.includes(l.id)) return false;
      return true;
    });
  }, [busca, catAtiva, shop, faixa, soFav, colab, favs, lojas, pagina]);

  const navegandoLivre = !busca && catAtiva === "todos" && shop === "todos" && faixa === "todas" && !soFav;
  const ordenadas = useMemo(() => {
    if (!navegandoLivre) return filtradas;
    return [...filtradas].sort((a, b) => { if (a.destaque !== b.destaque) return a.destaque ? -1 : 1; if (a.destaque && b.destaque) return a.ordem - b.ordem; return 0; });
  }, [filtradas, navegandoLivre]);

  const premiuns = useMemo(() => lojas.filter((l) => l.destaque).sort((a, b) => a.ordem - b.ordem), [lojas]);
  const waCta = PRIMAVERA_WHATSAPP ? `https://wa.me/${PRIMAVERA_WHATSAPP}?text=${encodeURIComponent("Oi! Vi o roteiro de lojas e quero ir comprar no Paraná com a Primavera Tur.")}` : null;
  const totalAvaliacoes = useMemo(() => Object.values(revs).reduce((s, r) => s + r.length, 0), [revs]);

  const gerarCsv = () => {
    const linhas = [["Loja", "Segmento", "Shopping", "Telefone", "WhatsApp", "Instagram", "Ticket Medio", "Tipo de Pecas", "Nota Media", "Avaliacoes"]];
    lojas.forEach((l) => { const d = colab[l.id] || {}; const r = revs[l.id] || []; const m = media(r); linhas.push([l.nome, l.segmento, SHOPPINGS[l.sh].nome, l.tel || "", waLink(l.tel) || "", l.insta || "", d.t != null ? d.t : "", (d.p || []).join("; "), m != null ? m.toFixed(1) : "", r.length]); });
    setCsv(linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`) .join(",")).join("\n"));
  };
  const copiar = async () => { try { await navigator.clipboard.writeText(csv); } catch (e) { const ta = document.getElementById("rt-csv-ta"); if (ta) { ta.select(); document.execCommand("copy"); } } };

  // ── Loading e porta ──────────────────────────────
  if (session === undefined) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#18181b" }}><div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#666" }}>carregando…</div></div>;
  if (!session) return <><PortaEntrada onEntrar={() => setMostrarAuth(true)} />{mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} />}</>;




  // ── Render ──────────────────────────────────────
  const isBrowse = pagina === "browse" || pagina === "favoritos" || busca;
  const marcaPage = painelAba === "marca" && perfil && perfil.marca_id ? lojas.find((l) => l.id === perfil.marca_id) : null;

  return (
    <>
      {marcaPage ? (
        <MarcaPanel loja={marcaPage} info={colab[marcaPage.id]} posts={posts.filter((p) => p.loja_id === marcaPage.id)} onSaveColab={salvarColabAdmin} onCreatePost={criarPost} onDeletePost={excluirPost} onClose={() => setPainelAba(null)} />
      ) : (
        <>
          {isBrowse ? (
            <BrowsePage
              filtradas={filtradas}
              shop={shop}
              setShop={setShop}
              catAtiva={catAtiva}
              setCatAtiva={setCatAtiva}
              faixa={faixa}
              setFaixa={setFaixa}
              busca={busca}
              setBusca={setBusca}
              FAIXAS={FAIXAS}
              lojas={lojas}
              SEGMENTOS={SEGMENTOS}
              SHOPPINGS={SHOPPINGS}
              carregando={carregando}
              visible={visible}
              setVisible={setVisible}
              ordenadas={ordenadas}
              colab={colab}
              revs={revs}
              favs={favs}
              setAberta={setAberta}
              toggleFav={toggleFav}
              session={session}
              setMostrarAuth={setMostrarAuth}
              perfil={perfil}
              setMostrarPrivacidade={setMostrarPrivacidade}
              setMostrarTermos={setMostrarTermos}
              gerarCsv={gerarCsv}
              setPagina={setPagina}
              setMostrarShoppings={setMostrarShoppings}
              setMostrarComo={setMostrarComo}
              setPainelAba={setPainelAba}
              setMostrarPerfil={setMostrarPerfil}
              Navbar={Navbar}
              BottomNav={BottomNav}
              IconSearch={IconSearch}
              IconShop={IconShop}
              IconRefresh={IconRefresh}
              IconDown={IconDown}
              IconTag={IconTag}
              IconUser={IconUser}
              IconHome={IconHome}
              IconHeart={IconHeart}
              IconProfile={IconProfile}
            />
          ) : (
            <HomePage
              busca={busca}
              setBusca={setBusca}
              setPagina={setPagina}
              carregando={carregando}
              categoriasExpandidas={categoriasExpandidas}
              setCategoriasExpandidas={setCategoriasExpandidas}
              catAtiva={catAtiva}
              setCatAtiva={setCatAtiva}
              SEGMENTOS={SEGMENTOS}
              ICONES={ICONES}
              shop={shop}
              setShop={setShop}
              SHOPPINGS={SHOPPINGS}
              premiuns={premiuns}
              ordenadas={ordenadas}
              colab={colab}
              favs={favs}
              setAberta={setAberta}
              toggleFav={toggleFav}
              session={session}
              setMostrarCuradoria={setMostrarCuradoria}
              setMostrarAuth={setMostrarAuth}
              setMostrarShoppings={setMostrarShoppings}
              setMostrarComo={setMostrarComo}
              perfil={perfil}
              setPainelAba={setPainelAba}
              setMostrarPerfil={setMostrarPerfil}
              setMostrarPrivacidade={setMostrarPrivacidade}
              setMostrarTermos={setMostrarTermos}
              Navbar={Navbar}
              BottomNav={BottomNav}
              IconSearch={IconSearch}
              IconArrow={IconArrow}
              IconSpark={IconSpark}
              IconShop={IconShop}
              IconUser={IconUser}
              IconHome={IconHome}
              IconHeart={IconHeart}
              IconProfile={IconProfile}
            />
          )}

          {/* Sheet de detalhes */}
          {aberta && (
            <Sheet key={aberta.id} l={aberta} info={colab[aberta.id]} revs={revs[aberta.id]}
              session={session} perfil={perfil} isFav={favs.includes(aberta.id)}
              posts={posts} onDeletePost={excluirPost} onShowVitrine={() => setMostrarVitrine(true)}
              onSaveInfo={salvarInfo} onAddReview={salvarReview} onFav={toggleFav}
              onRequireLogin={() => setMostrarAuth(true)} onClose={() => setAberta(null)} />
          )}

          {mostrarCuradoria && <CuradoriaModal perfil={perfil} onEnviar={enviarCuradoria} onClose={() => setMostrarCuradoria(false)} />}
          {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} />}
          {mostrarPerfil && <PerfilModal perfil={perfil} favsCount={favs.length} onSaveNome={salvarNomePerfil} onLogout={sair} onClose={() => setMostrarPerfil(false)} onOpenPainel={(aba) => setPainelAba(aba)} />}
          {mostrarShoppings && <ShoppingsModal onClose={() => setMostrarShoppings(false)} />}
          {mostrarComo && <ComoFuncionaModal onClose={() => setMostrarComo(false)} />}
          {mostrarAi && <AiAssistenteModal onClose={() => setMostrarAi(false)} />}
          {mostrarPrivacidade && <PrivacidadeModal onClose={() => setMostrarPrivacidade(false)} />}
          {mostrarTermos && <TermosModal onClose={() => setMostrarTermos(false)} />}
          {painelAba === "superadmin" && (
            <SuperAdminPanel lojas={lojas} colab={colab} revsByLoja={revs} posts={posts} onDeletePost={excluirPost} onUpdateLoja={updateLojaAdmin}
              onSaveColab={salvarColabAdmin} onCriarLoja={criarLoja} onDeleteReview={deleteReviewAdmin}
              onDestaque={toggleDestaque} onReordenar={reordenarDestaque}
              onClose={() => setPainelAba(null)} />
          )}
          {painelAba === "lojista" && (
            <LojistaPanel perfil={perfil} favs={favs} revsByLoja={revs} lojas={lojas} colab={colab} onSalvarDados={salvarDadosLojista} onClose={() => setPainelAba(null)} />
          )}
          {mostrarVitrine && aberta && (
            <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setMostrarVitrine(false)}>
              <div className="rt-modal-c" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <h3 className="rt-modal-t">Nova novidade</h3>
                <div className="rt-mini-form">
                  <input className="rt-input" placeholder="Título" value={novoPost.titulo} onChange={(e) => setNovoPost({ ...novoPost, titulo: e.target.value })} />
                  <textarea className="rt-area" placeholder="Descrição (opcional)" value={novoPost.descricao} onChange={(e) => setNovoPost({ ...novoPost, descricao: e.target.value })} />
                  <input className="rt-input" placeholder="Preço R$ (opcional)" inputMode="decimal" value={novoPost.preco} onChange={(e) => setNovoPost({ ...novoPost, preco: e.target.value })} />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={novoPost.em_promocao} onChange={(e) => setNovoPost({ ...novoPost, em_promocao: e.target.checked })} /> Em promoção
                  </label>
                  <input className="rt-input" placeholder="URL da foto (opcional)" value={novoPost.foto_url} onChange={(e) => setNovoPost({ ...novoPost, foto_url: e.target.value })} />
                  <div className="rt-save-row">
                    <button className="rt-btn" disabled={!novoPost.titulo.trim()} onClick={() => criarPost(aberta.id)}>Publicar</button>
                    <button className="rt-btn ghost" onClick={() => setMostrarVitrine(false)}>Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {csv !== null && (
            <div className="rt-backdrop" style={{ alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setCsv(null)}>
              <div className="rt-modal-c" onClick={(e) => e.stopPropagation()}>
                <h3 className="rt-modal-t">Exportar para planilha</h3>
                <p className="rt-hint">Copie e cole no Excel ou Google Sheets.</p>
                <textarea id="rt-csv-ta" className="rt-csv" readOnly value={csv} />
                <div className="rt-save-row">
                  <button className="rt-btn" onClick={copiar}>Copiar</button>
                  <button className="rt-btn ghost" onClick={() => setCsv(null)}>Fechar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
