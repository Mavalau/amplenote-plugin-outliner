import { escape as escapeHtml } from '../../utils/lodash-impl';

import { App, Section } from '../../typing/amplenote-plugin-types';
import { assertNoteContext } from '../../utils/note';

type SectionFlat = {
  anchor?: Section['heading']['anchor'];
  level: Section['heading']['level'];
  text: Section['heading']['text'];
  index?: Section['index'];
};

const emptyHeadingText = '[untitled]';
/**
 * Fetches and preprocesses sections of a note.
 * Output will still be sorted according to order of appearance in note
 */
async function fetchSections(
  app: App,
  noteUUID: string,
): Promise<SectionFlat[]> {
  const sections: Section[] = await app.getNoteSections({ uuid: noteUUID });
  const processedSections = sections.map((section: any) => {
    const hasHeading = !!section.heading;

    if (!hasHeading) {
      return {
        anchor: null,
        level: 1,
        text: emptyHeadingText, // Yep, this will break (non-fatally) somewhere if you name your heading [untitled].
        index: section.index,
      };
    }

    return {
      ...section.heading,
      index: section.index,
    };
  });

  return processedSections;
}

/**
 * Builds a collapsible HTML outline from note sections.
 */
function buildCollapsibleOutlineHtml(
  sections: SectionFlat[],
  maxOpenLevel = 6,
): string {
  if (!sections?.length) return '';

  const html: string[] = [];

  const openStack: number[] = [];

  const closeUntil = (targetLevel: number) => {
    while (openStack.length && openStack[openStack.length - 1] >= targetLevel) {
      html.push('</div></details>');
      openStack.pop();
    }
  };

  for (let i = 0; i < sections.length; i++) {
    const { anchor, level, text } = sections[i];
    const nextLevel = sections[i + 1]?.level;
    const isLast = i === sections.length - 1;

    closeUntil(level);

    const hasChildren = !isLast && nextLevel > level;

    //TODO: Will cause a bug:
    //Steps to reproduce:
    //1. Have note with "Heading1" directly followed by "Heading3"
    //2. Set Max level to "2"
    //Expected behaviour:
    //- "Heading3" is not shown anymore
    //Actual behaviour:
    //- "Heading3" is still shown
    //Explanation:
    //We just open level 1 without making sure that things directly inside can be much lower level
    const openAttrHtml = level < maxOpenLevel ? ' open' : '';

    const textHtml =
      text === emptyHeadingText ? '<em>[untitled]</em>' : escapeHtml(text);

    const dataHeadingAttr = ` data-heading="${textHtml}"`;

    const dataAnchorAttr = anchor ? ` data-anchor="${escapeHtml(anchor)}"` : '';

    if (hasChildren) {
      html.push(
        `<details${openAttrHtml} class="lvl-${level}"><summary${dataHeadingAttr}${dataAnchorAttr}>${textHtml}</summary><div>`,
      );
      openStack.push(level);
    } else {
      html.push(
        `<div class="leaf lvl-${level}"${dataHeadingAttr}${dataAnchorAttr}>${text}</div>`,
      );
    }
  }

  closeUntil(1);
  return html.join('');
}

export async function outlineHtml(
  app: App,
  noteUUID: string,
  maxOpenLevel = 6,
) {
  if (!assertNoteContext(noteUUID)) {
    return { noteUUID: null, html: '' };
  }

  const sections = await fetchSections(app, noteUUID);
  const html = sections.length
    ? buildCollapsibleOutlineHtml(sections, maxOpenLevel)
    : '<em>[No Sections]</em>';
  console.log(html);
  return { noteUUID, html };
}
