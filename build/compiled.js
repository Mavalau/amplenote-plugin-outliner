(() => {
  // src/utils/note.ts
  function getCurrentNoteUUIDFromUrl(url) {
    const extractedUUID = /\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(url);
    return extractedUUID ? extractedUUID[1] : null;
  }
  function assertNoteContext(noteUUID) {
    if (!noteUUID) {
      console.log("No note is currently open.");
      return false;
    }
    return true;
  }

  // src/config/settings.ts
  function getColorMode(app) {
    const raw = app?.settings?.["color-mode"];
    const defaultColorMode = "dark";
    return String(raw).toLowerCase() === "light" ? "light" : defaultColorMode;
  }
  function getPollingInterval(app) {
    const pollingIntervalMs = app?.settings?.["polling-interval"];
    const pollingIntervalMsNum = Number(pollingIntervalMs);
    const defaultPollingIntervalMs = 1e3;
    return isFinite(pollingIntervalMsNum) && pollingIntervalMsNum > 0 ? pollingIntervalMsNum : defaultPollingIntervalMs;
  }

  // src/actions/actions.ts
  function calcAspectRatio() {
    return 0.5;
  }
  var noteOption = {
    "Open ToC in Sidebar": {
      check(app, noteUUID) {
        return assertNoteContext(noteUUID);
      },
      async run(app, noteUUID) {
        const colorMode = getColorMode(app);
        const pollingInterval = getPollingInterval(app);
        const aspectRatio = calcAspectRatio();
        await app.openSidebarEmbed(
          { id: "Table of Contents", aspectRatio },
          noteUUID,
          colorMode,
          pollingInterval
        );
      }
    }
  };
  var appOption = {
    "Open ToC in Sidebar": {
      check(app) {
        return true;
      },
      async run(app) {
        const url = app.context?.url || "";
        const noteUUID = getCurrentNoteUUIDFromUrl(url);
        const colorMode = getColorMode(app);
        const pollingInterval = getPollingInterval(app);
        const aspectRatio = calcAspectRatio();
        await app.openSidebarEmbed(
          { id: "Table of Contents", aspectRatio },
          noteUUID,
          colorMode,
          pollingInterval
        );
      }
    }
  };

  // src/utils/lodash.ts
  function escape(input) {
    const s = String(input ?? "");
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // src/embedCallHandler/outlineHtmlHandler/sections.ts
  var emptyHeadingText = "[untitled]";
  async function fetchSections(app, noteUUID) {
    const sections = await app.getNoteSections({ uuid: noteUUID });
    const processedSections = sections.map((section) => {
      const hasHeading = !!section.heading;
      if (!hasHeading) {
        return {
          anchor: null,
          level: 1,
          text: emptyHeadingText,
          // Yep, this will break (non-fatally) somewhere if you name your heading [untitled].
          index: section.index
        };
      }
      return {
        ...section.heading,
        index: section.index
      };
    });
    return processedSections;
  }
  function buildCollapsibleOutlineHtml(sections, maxOpenLevel = 6) {
    if (!sections || !sections.length)
      return "";
    let html = [];
    let openStack = [];
    const closeUntil = (targetLevel) => {
      while (openStack.length && openStack[openStack.length - 1] >= targetLevel) {
        html.push("</div></details>");
        openStack.pop();
      }
    };
    for (let i = 0; i < sections.length; i++) {
      const { anchor, level, text } = sections[i];
      const nextLevel = sections[i + 1]?.level;
      const isLast = i === sections.length - 1;
      closeUntil(level);
      const hasChildren = !isLast && nextLevel > level;
      const openAttrHtml = level < maxOpenLevel ? " open" : "";
      const textHtml = text === emptyHeadingText ? "<em>[untitled]</em>" : escape(text);
      const dataHeadingAttr = ` data-heading="${textHtml}"`;
      const dataAnchorAttr = anchor ? ` data-anchor="${escape(anchor)}"` : "";
      if (hasChildren) {
        html.push(
          `<details${openAttrHtml} class="lvl-${level}"><summary${dataHeadingAttr}${dataAnchorAttr}>${textHtml}</summary><div>`
        );
        openStack.push(level);
      } else {
        html.push(`<div class="leaf lvl-${level}"${dataHeadingAttr}${dataAnchorAttr}>${text}</div>`);
      }
    }
    closeUntil(1);
    return html.join("");
  }
  async function outlineHtml(app, noteUUID, maxOpenLevel = 6) {
    if (!assertNoteContext(noteUUID)) {
      return { noteUUID: null, html: "" };
    }
    const sections = await fetchSections(app, noteUUID);
    const html = sections.length ? buildCollapsibleOutlineHtml(sections, maxOpenLevel) : "<em>[No Sections]</em>";
    console.log(html);
    return { noteUUID, html };
  }

  // src/config/pluginState.ts
  var pluginState = {
    // Persists for a client session
    _isPluginActive: false
  };
  var pluginState_default = pluginState;

  // src/embedCallHandler/onEmbedCall.ts
  async function onEmbedCall(app, type, arg) {
    pluginState_default._isPluginActive = true;
    if (type === "currentNoteUUID") {
      const currentUrl = app.context?.url;
      if (!currentUrl) {
        return;
      }
      return getCurrentNoteUUIDFromUrl(currentUrl);
    }
    if (type === "navigateToHeading") {
      const { uuid, anchor } = arg || {};
      if (!uuid || !anchor)
        return false;
      const base = await app.getNoteURL({ uuid });
      const targetUrl = `${base}#${encodeURIComponent(anchor)}`;
      console.log(`Heading to: ${targetUrl}`);
      await app.navigate(targetUrl);
      return true;
    }
    if (type === "outlineHtml") {
      const { uuid, maxOpenLevel = 3 } = arg || {};
      if (!uuid || Number.isNaN(maxOpenLevel))
        return false;
      return outlineHtml(app, uuid, maxOpenLevel);
    }
    return null;
  }

  // src/rendering/body.template.ts
  function bodyTemplate({ colorMode }) {
    return (
      /*html*/
      `
<div id="toc-root" data-color-mode="${colorMode}">
  <div class="toolbar">
    <div class="left">
      <div class="control-group">
        <label class="maxlvl">
          <span>Max level:</span>
          <input id="maxLevel" type="number" min="1" max="3" value="3" /> <!-- default 3 -->
        </label>
        <span class="toggles">
          <button id="expandAll" class="btn btn-ghost" type="button">Expand all</button>
          <button id="collapseAll" class="btn btn-ghost" type="button">Collapse all</button>
        </span>
      </div>
    </div>
    <div class="right">
      <button id="refresh" class="btn" type="button">Refresh</button>
    </div>
  </div>
  <div id="toc">Loading...</div>
</div>
`
    );
  }

  // src/rendering/style.template.ts
  function styleTemplate() {
    return (
      /*css*/
      `
:root {
  --radius: 10px;
  --pad: 8px;
  --marker-w: 14px;
}

/* ===================================
   Color Modes
=================================== */
#toc-root[data-color-mode="light"] {
  --bg: #ffffff;
  --fg: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --hover: #f3f4f6;
}

#toc-root[data-color-mode="dark"] {
  --bg: #0f1115;
  --fg: #e5e7eb;
  --muted: #9ca3af;
  --border: #23262d;
  --hover: #1a1d24;
}

/* ===================================
   Container
=================================== */
#toc-root {
  position: relative;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--pad);
  height: 100%;
}

#toc-root.scrollable {
  max-height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===================================
   Toolbar
=================================== */
.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 8px;
  position: sticky;
  top: 0;
  background: linear-gradient(var(--bg) 85%, transparent);
  z-index: 2;
  padding-bottom: 6px;
}

.left {
  min-width: 0;
}

.control-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in oklab, var(--bg) 85%, transparent);
}

.maxlvl {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.maxlvl input {
  width: 52px;
  padding: 6px 8px;
  color: var(--fg);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.toggles {
  display: inline-flex;
  gap: 8px;
}

.right {
  display: flex;
  gap: 6px;
}

.btn {
  appearance: none;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background: var(--hover);
}

.btn-ghost {
  border-color: transparent;
}

.btn-ghost:hover {
  border-color: var(--border);
}

/* ===================================
   TOC Tree
=================================== */
#toc {
  font-size: 16px;
  line-height: 1.5;
  margin-top: 4px;
  padding-bottom: 8px;
}

#toc details {
  margin-top: 2px;
  margin-bottom: 2px;
}

#toc details > div {
  margin-left: 0;
}

#toc summary,
#toc .leaf {
  display: block;
  position: relative;
  box-sizing: border-box;
  padding-left: var(--marker-w);
  user-select: none;
  font-size: inherit;
}

#toc summary {
  list-style: none;
  cursor: pointer;
}

#toc summary::-webkit-details-marker {
  display: none;
}

/* ===================================
   Marker Triangles / Bullets
=================================== */

/* collapsed triangle (tilted left) */
/* Base marker (no rotation here) */
#toc details > summary::before {
  content:"";
  position:absolute;
  left:0;
  top:50%;
  width:0;
  height:0;
  border-left:6px solid currentColor;
  border-top:4px solid transparent;
  border-bottom:4px solid transparent;
  opacity:.9;
  transform: translateY(-50%);            /* only vertical centering */
  transition: transform .18s ease;         /* animate both states */
}

/* Explicit CLOSED state: slight tilt */
#toc details:not([open]) > summary::before {
  transform: translateY(-50%) rotate(0deg);  /* use 15deg; flip sign if you prefer the other tilt */
}

/* Explicit OPEN state: point down */
#toc details[open] > summary::before {
  transform: translateY(-50%) rotate(90deg);
}

/* leaf bullets */
#toc .leaf::before {
  content: "\\2022";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.9;
}

/* ===================================
   Levels
=================================== */
#toc details.lvl-1 > summary,
#toc .leaf.lvl-1 { margin-left: 0 !important; }

#toc details.lvl-2 > summary,
#toc .leaf.lvl-2 { margin-left: 20px !important; }

#toc details.lvl-3 > summary,
#toc .leaf.lvl-3 { margin-left: 40px !important; }

#toc details.lvl-4 > summary,
#toc .leaf.lvl-4 { margin-left: 60px !important; }

#toc details.lvl-5 > summary,
#toc .leaf.lvl-5 { margin-left: 80px !important; }

#toc details.lvl-6 > summary,
#toc .leaf.lvl-6 { margin-left: 100px !important; }

/* ===================================
   Hover Effects
=================================== */
#toc .leaf:hover,
#toc summary:hover {
  background: var(--hover);
  border-radius: 6px;
}
`
    );
  }

  // src/rendering/script.template.ts
  function scriptTemplate({
    initUUID,
    pollMs
  }) {
    return (
      /*html*/
      `
  <script>
  (async () => {
    /*
     * Important Elements
     */
    const rootEl = document.getElementById("toc-root");
    const tocEl  = document.getElementById("toc");
    const btn    = document.getElementById("refresh");
    const btnEx  = document.getElementById("expandAll");
    const btnCl  = document.getElementById("collapseAll");
    const maxInp = document.getElementById("maxLevel");

    /*
     * Utils
     */
    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

    const debounce = (fn, ms=300) => {
      let t;
      return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
      };
    };

    async function fetchCurrentUUID(){
      const newUUID = await window.callAmplenotePlugin("currentNoteUUID");
      uuid = newUUID || null;
    }

    /*
     * Storage
     */
    const STORAGE_KEY = "store:toc-max-level";
    const getSavedMax = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const v = clamp(parseInt(raw ?? "3", 10) || 3, 1, 6); // default 3
      return v;
    };
    const setSavedMax = (v) => localStorage.setItem(STORAGE_KEY, String(clamp(v,1,6)));

    /*
     * MAIN
     */
    maxInp.value = String(getSavedMax());

    let uuid = ${JSON.stringify(initUUID)};
    let lastUUID = uuid, lastHTML = "";

    async function load(force=false){
      await fetchCurrentUUID();
      if (!uuid) {
        tocEl.innerHTML = "<div class='empty'><em>[No note selected]</em></div>";
        lastUUID = null;
        lastHTML = "";
        return;
      }

      const maxLevel = clamp(parseInt(maxInp.value || "3", 10) || 3, 1, 6);
      // keep storage in sync in case value was changed externally
      if (String(maxLevel) !== localStorage.getItem(STORAGE_KEY)) setSavedMax(maxLevel);

      const payload = await window.callAmplenotePlugin("outlineHtml", { uuid, maxOpenLevel: maxLevel });
      if (!payload || !payload.noteUUID) {
        tocEl.innerHTML = "<div class='empty'><em>[No note selected]</em></div>";
        lastUUID = null;
        lastHTML = "";
        return;
      }

      const html = payload.html || '<div class="empty"><em>[No Sections]</em></div>';
      if (force || html !== lastHTML || uuid !== lastUUID) {
        tocEl.innerHTML = html;

        attachNavHandlers();
        applyOverflowMode();
  
        lastHTML = html;
        lastUUID = uuid;
      }
    }

   /*
    * Handle Collapsing
    */
    function expandAll(){
      tocEl.querySelectorAll("details").forEach(d => d.setAttribute("open",""));
    }
    function collapseAll(){
      tocEl.querySelectorAll("details").forEach(d => d.removeAttribute("open"));
    }

    maxInp.addEventListener("change", () => {
      const v = clamp(parseInt(maxInp.value || "3", 10) || 3, 1, 6);
      maxInp.value = String(v);
      setSavedMax(v);
      load(true);
    });
    maxInp.addEventListener("wheel", (e) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      const current = clamp(parseInt(maxInp.value || "3", 10) || 3, 1, 6);
      const next = clamp(current + dir, 1, 6);
      if (next !== current) {
        maxInp.value = String(next);
        setSavedMax(next);
        load(true);
      }
    });


    /*
     * Handle Reload
     */
    btn.addEventListener("click", debounce(() => load(true), 300));
    btnEx.addEventListener("click", expandAll);
    btnCl.addEventListener("click", collapseAll);

    const _pollHandle = setInterval(() => load(false), ${pollMs});
    window.addEventListener('unload', () => { clearInterval(_pollHandle); });

    /*
     * Handle Navigation
     */
    function attachNavHandlers(){
      if (tocEl._navBound) return;
      tocEl.addEventListener("click", async (e) => {
        const row = e.target.closest("summary, .leaf");
        if (!row || !uuid) return;
        const anchor = row.dataset.anchor;
        if (!anchor) return;
        if (row.tagName.toLowerCase() === "summary") e.preventDefault(); // Do not Collapse/Expand
        await window.callAmplenotePlugin("navigateToHeading", { uuid, anchor });
      });
      tocEl._navBound = true;
    }

    /*
     * Handle Display
     */
    function applyOverflowMode() {
      const overflow = rootEl.scrollHeight > rootEl.clientHeight;
      rootEl.classList.toggle("scrollable", overflow);
    }
    window.addEventListener("resize", applyOverflowMode);
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => applyOverflowMode());
      ro.observe(rootEl); ro.observe(document.documentElement);
    }

    /*
     * ENTRY
     */
    await load(true);
  })();
  </script>
`
    );
  }

  // src/rendering/embed.ts
  async function renderEmbed(app, ...args) {
    const initialUUID = args[0];
    const colorMode = args[1];
    const pollingIntervalMs = args[2];
    const body = bodyTemplate({ colorMode });
    const script = scriptTemplate({ initUUID: initialUUID, pollMs: pollingIntervalMs });
    const styles = styleTemplate();
    return `
${body}
<style>
${styles}
</style>
${script}`;
  }

  // src/plugin.ts
  var plugin = {
    /*
     * Actions
     */
    noteOption,
    appOption,
    /*
     * Rendering
     */
    onEmbedCall,
    renderEmbed
  };
  var plugin_default = plugin;
})();
