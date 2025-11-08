import { css } from 'lit';

export function styleTemplate() {
  return css`
:root { --radius: 10px; --pad: 8px; --marker-w: 14px; }
#toc-root[data-color-mode=\"light\"] {
  --bg: #ffffff; --fg: #111827; --muted: #6b7280; --border: #e5e7eb; --hover: #f3f4f6;
}
#toc-root[data-color-mode=\"dark\"] {
  --bg: #0f1115; --fg: #e5e7eb; --muted: #9ca3af; --border: #23262d; --hover: #1a1d24;
}

/* Container */
#toc-root {
  position: relative;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--pad);
  height: 100%;
}
#toc-root.scrollable { max-height: 100%; overflow: auto; -webkit-overflow-scrolling: touch; }

.toolbar { display: grid; grid-template-columns: 1fr auto; align-items: start; gap: 8px; position: sticky; top: 0; background: linear-gradient(var(--bg) 85%, transparent); z-index: 2; padding-bottom: 6px; }
.left { min-width: 0; }
.control-group { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:6px 8px; border:1px solid var(--border); border-radius:8px; background: color-mix(in oklab, var(--bg) 85%, transparent); }
.maxlvl { display:inline-flex; align-items:center; gap:6px; }
.maxlvl input { width:52px; padding:6px 8px; color:var(--fg); background:transparent; border:1px solid var(--border); border-radius:6px; }
.toggles { display:inline-flex; gap:8px; }
.right { display:flex; gap:6px; }
.btn { appearance:none; border:1px solid var(--border); background:transparent; color:var(--fg); padding:6px 10px; border-radius:6px; cursor:pointer }
.btn:hover { background:var(--hover); }
.btn-ghost { border-color:transparent; }
.btn-ghost:hover { border-color:var(--border); }

#toc { font-size:16px; line-height:1.5; margin-top:4px; padding-bottom:8px; }
#toc details { margin-top:2px; margin-bottom:2px; }
#toc details > div { margin-left:0; }
#toc summary, #toc .leaf { display:block; position:relative; box-sizing:border-box; padding-left:var(--marker-w); user-select:none; font-size:inherit; }
#toc summary { list-style:none; cursor:pointer; }
#toc summary::-webkit-details-marker { display:none; }
#toc summary::before { content:""; position:absolute; left:0; top:50%; transform:translateY(-50%); width:0; height:0; border-left:6px solid currentColor; border-top:4px solid transparent; border-bottom:4px solid transparent; opacity:.9; }
details[open] > summary::before { transform:translateY(-50%) rotate(90deg); }
#toc .leaf::before { content:"\u2022"; position:absolute; left:0; top:50%; transform:translateY(-50%); opacity:.9; }
#toc details.lvl-1 > summary, #toc .leaf.lvl-1 { margin-left:0px !important; }
#toc details.lvl-2 > summary, #toc .leaf.lvl-2 { margin-left:20px !important; }
#toc details.lvl-3 > summary, #toc .leaf.lvl-3 { margin-left:40px !important; }
#toc details.lvl-4 > summary, #toc .leaf.lvl-4 { margin-left:60px !important; }
#toc details.lvl-5 > summary, #toc .leaf.lvl-5 { margin-left:80px !important; }
#toc details.lvl-6 > summary, #toc .leaf.lvl-6 { margin-left:100px !important; }
#toc .leaf:hover, #toc summary:hover { background:var(--hover); border-radius:6px; }
`;
}
