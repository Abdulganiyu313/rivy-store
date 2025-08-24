import { useEffect } from "react";

type Props = { scopeId: string };

/** Injects a CSS sheet scoped to #scopeId (uses !important to beat globals). */
export default function ScopedStyles({ scopeId }: Props) {
  useEffect(() => {
    const css = `
#${scopeId} { box-sizing:border-box !important; max-width:1200px !important; margin:0 auto !important; padding:16px !important; display:block !important; font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial !important; color:#111827 !important; }
#${scopeId} *, #${scopeId} *::before, #${scopeId} *::after { box-sizing:inherit !important; }
#${scopeId} .shell { display:grid !important; grid-template-columns:1fr !important; gap:16px !important; align-items:start !important; }
@media (min-width:960px){ #${scopeId} .shell { grid-template-columns:280px 1fr !important; gap:24px !important; } }
#${scopeId} .search { display:grid !important; grid-template-columns:1fr auto !important; gap:8px !important; margin:0 0 12px 0 !important; max-width:760px !important; }
#${scopeId} .filters h2 { margin:0 0 8px 0 !important; font-size:18px !important; }
#${scopeId} .filters .card { position:sticky !important; top:12px !important; border:1px solid #e5e7eb !important; border-radius:12px !important; padding:12px !important; background:#fff !important; display:grid !important; gap:12px !important; }
#${scopeId} .filters .row { display:flex !important; gap:8px !important; }
#${scopeId} .filters .range { display:grid !important; grid-template-columns:1fr 1fr !important; gap:8px !important; }
#${scopeId} .checkbox { display:flex !important; align-items:center !important; gap:8px !important; }
#${scopeId} .toolbar { display:flex !important; justify-content:space-between !important; align-items:center !important; gap:12px !important; padding:0 4px 8px !important; }
#${scopeId} .tabs { display:inline-flex !important; gap:8px !important; }
#${scopeId} .tab { padding:8px 10px !important; border:1px solid #e5e7eb !important; border-radius:8px !important; background:#fff !important; cursor:pointer !important; }
#${scopeId} .tab.active { background:#eefdf6 !important; border-color:#10b981 !important; }
#${scopeId} .grid { list-style:none !important; margin:0 !important; padding:12px 0 24px !important; display:grid !important; grid-template-columns:1fr 1fr !important; gap:12px !important; }
@media (min-width:720px){ #${scopeId} .grid { grid-template-columns:repeat(3,1fr) !important; } }
@media (min-width:1100px){ #${scopeId} .grid { grid-template-columns:repeat(4,1fr) !important; gap:16px !important; } }
#${scopeId} .grid.list { grid-template-columns:1fr !important; }
#${scopeId} .card { border:1px solid #e5e7eb !important; border-radius:12px !important; background:#fff !important; overflow:hidden !important; display:grid !important; grid-template-rows:auto 1fr !important; }
#${scopeId} .card.list { grid-template-columns:160px 1fr !important; grid-template-rows:auto !important; }
#${scopeId} .media img { width:100% !important; aspect-ratio:4/3 !important; object-fit:cover !important; display:block !important; }
#${scopeId} .body { padding:10px !important; display:grid !important; gap:8px !important; }
#${scopeId} .title { margin:0 !important; font-size:15px !important; line-height:1.3 !important; font-weight:600 !important; }
#${scopeId} .badges { display:flex !important; gap:8px !important; flex-wrap:wrap !important; }
#${scopeId} .badge { font-size:12px !important; border:1px solid #e5e7eb !important; padding:2px 6px !important; border-radius:999px !important; }
#${scopeId} .badge.alt { background:#eefdf6 !important; border-color:#10b981 !important; }
#${scopeId} .meta { display:flex !important; justify-content:space-between !important; font-size:13px !important; color:#6b7280 !important; }
#${scopeId} .actions { display:flex !important; gap:8px !important; }
#${scopeId} .pagination { margin:8px 0 24px !important; display:flex !important; align-items:center !important; gap:10px !important; flex-wrap:wrap !important; }
#${scopeId} .pages { display:inline-flex !important; gap:6px !important; }
#${scopeId} .pill { border:1px solid #e5e7eb !important; background:#fff !important; padding:6px 10px !important; border-radius:8px !important; cursor:pointer !important; }
#${scopeId} .pill.active { background:#eefdf6 !important; border-color:#10b981 !important; }
#${scopeId} .cat-list { display:grid !important; gap:10px !important; max-height:280px !important; overflow:auto !important; padding-right:6px !important; }
#${scopeId} .radio { display:flex !important; align-items:center !important; gap:10px !important; cursor:pointer !important; user-select:none !important; }
#${scopeId} .radio input { appearance:none !important; width:16px !important; height:16px !important; border:2px solid #94a3b8 !important; border-radius:999px !important; position:relative !important; }
#${scopeId} .radio input:checked { border-color:#10b981 !important; }
#${scopeId} .radio input:checked::after { content:"" !important; position:absolute !important; inset:3px !important; background:#10b981 !important; border-radius:999px !important; }
#${scopeId} .radio span { font-weight:600 !important; color:#111827 !important; }
`;
    const attr = `scoped-${scopeId}`;
    // Reuse if it exists to avoid duplicates on re-render
    let style = document.querySelector<HTMLStyleElement>(
      `style[data-scoped="${attr}"]`
    );
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-scoped", attr);
      document.head.appendChild(style);
    }
    style.textContent = css;

    // cleanup must return void
    return () => {
      const el = document.querySelector(`style[data-scoped="${attr}"]`);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, [scopeId]);

  return null;
}
