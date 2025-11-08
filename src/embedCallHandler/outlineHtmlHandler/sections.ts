import { escape as escapeHtml } from "lodash";

import { App, Section } from "../../typing/amplenote-plugin-types";
import { assertNoteContext } from "../../utils/note";

type SectionFlat = {
  anchor?: Section['heading']['anchor'],
  level: Section['heading']['level'],
  text: Section['heading']['text'],
  index?: Section['index'],
}

const emptyHeadingText = "[untitled]"
/**
 * Fetches and preprocesses sections of a note.
 * Output will still be sorted according to order of appearance in note
 */
async function fetchSections(app: App, noteUUID: string): Promise<SectionFlat[]> {
  const sections: Section[] = await app.getNoteSections({ uuid: noteUUID });
  const processedSections = sections.map((section: any) => {
    const hasHeading = !!section.heading;

    if (!hasHeading) {
      return {
        anchor: null,
        level: 1,
        text: emptyHeadingText, // Yep, this will break (non-fatally) somewhere if you name your heading [untitled].
        index: section.index,
      }
    }

    return {
      ...section.heading,
      index: section.index
    };
  });

  return processedSections;
}

/**
 * Builds a collapsible HTML outline from note sections.
 */
function buildCollapsibleOutlineHtml(sections: SectionFlat[], maxOpenLevel = 6): string {
  if (!sections || !sections.length) return "";

  let html: string[] = [];

  let openStack: number[] = [];

  const closeUntil = (targetLevel: number) => {
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
    
    const textHtml = text === emptyHeadingText ? "<em>[untitled]</em>" : escapeHtml(text);

    const dataHeadingAttr = ` data-heading="${textHtml}"`;

    const dataAnchorAttr = anchor ? ` data-anchor="${escapeHtml(anchor)}"` : "";

    if (hasChildren) {
      html.push(
        `<details${openAttrHtml} class="lvl-${level}"><summary${dataHeadingAttr}${dataAnchorAttr}>${textHtml}</summary><div>`
      );
      openStack.push(level);
    } else {
      html.push(`<div class="leaf lvl-${level}"${dataHeadingAttr}>${text}</div>`);
    }
  }

  closeUntil(1);
  return html.join("");
}

export async function outlineHtml(app: App, noteUUID: string, maxOpenLevel = 6) {
    if (!assertNoteContext(noteUUID)) {
      return { noteUUID: null, html: "" };
    }

    const sections = await fetchSections(app, noteUUID);
    const html = sections.length ? buildCollapsibleOutlineHtml(sections, maxOpenLevel) : "<em>[No Sections]</em>";
    return { noteUUID, html };
}
