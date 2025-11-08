export function scriptTemplate({
  initUUID,
  pollMs,
}: {
  initUUID: string;
  pollMs: number;
}) {
  return /*html*/ `
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

        const isSummary = row.tagName.toLowerCase() === "summary";

        // If it's a summary, only navigate on Ctrl/Cmd+Click
        if (isSummary) {
          if (!e.ctrlKey && !e.metaKey) return;
          e.preventDefault(); // Prevent collapse/expand
        }

        // Always navigate if it's a leaf
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
`;
}
