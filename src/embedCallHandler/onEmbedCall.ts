import { outlineHtml } from './outlineHtmlHandler/sections';
import { App } from '../typing/amplenote-plugin-types';
import { getCurrentNoteUUIDFromUrl } from '../utils/note';
import pluginState from '../config/pluginState';

/**
 * Handles communication between plugin an native UI via actions based on the `type`.
 */
export async function onEmbedCall(
  this: any,
  app: App,
  type: string,
  arg: any,
): Promise<any> {
  pluginState._isPluginActive = true;

  if (type === 'currentNoteUUID') {
    const currentUrl = app.context?.url;
    if (!currentUrl) {
      return;
    }
    return getCurrentNoteUUIDFromUrl(currentUrl);
  }

  if (type === 'navigateToHeading') {
    const { uuid, anchor }: { uuid: string; anchor: string } = arg || {};
    //TODO: Validation
    if (!uuid || !anchor) return false;

    const base: string = await app.getNoteURL({ uuid });
    const linkUrl = new URL(base);
    linkUrl.hash = anchor;
    const targetUrl = linkUrl.toString();
    console.log(`Heading to: ${targetUrl}`);
    await app.navigate(targetUrl);
    return true;
  }

  if (type === 'outlineHtml') {
    const { uuid, maxOpenLevel = 3 }: { uuid: string; maxOpenLevel: number } =
      arg || {};
    //TODO: Validation
    if (!uuid || Number.isNaN(maxOpenLevel)) return false;

    return outlineHtml(app, uuid, maxOpenLevel);
  }

  return null;
}
