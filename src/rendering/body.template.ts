export function bodyTemplate({ colorMode }: { colorMode: string }) {
  return /*html*/ `
<div id="toc-root" data-color-mode="${colorMode}">
  <div class="toolbar">
    <div class="toolbar-main">
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
    <div class="toolbar-search">
      <label class="search" for="headingSearch">
        <span class="search-label">Search headings</span>
        <input
          id="headingSearch"
          type="search"
          placeholder="Find headings"
          autocomplete="off"
          spellcheck="false"
        />
      </label>
      <span id="searchStatus" class="search-status" aria-live="polite"></span>
    </div>
  </div>
  <div id="toc">Loading...</div>
</div>
`;
}
