import { App } from '../typing/amplenote-plugin-types';
import { assertNoteContext, getCurrentNoteUUIDFromUrl } from '../utils/note';
import { getColorMode, getPollingInterval } from '../config/settings';

// https://www.amplenote.com/help/developing_amplenote_plugins#app.openSidebarEmbed
// We cannot really control the height of the Peek Viewer pane (total iFrame),
// but we know it likely has to be much bigger in height than in width.
// Anyways, it (not perfectly using the vertical space provided by the pane) is not that big of a deal,
// as our own container is scrollable as well.
function calcAspectRatio(): number {
  //TODO: Find a better heuristic
  return 0.5;
}

export const noteOption = {
  'Open ToC in Sidebar': {
    check(app: App, noteUUID: string): boolean {
      return assertNoteContext(noteUUID);
    },
    async run(app: App, noteUUID: string): Promise<void> {
      const colorMode = getColorMode(app);
      const pollingInterval = getPollingInterval(app);
      const aspectRatio = calcAspectRatio();
      await app.openSidebarEmbed(
        { id: 'Table of Contents', aspectRatio },
        noteUUID,
        colorMode,
        pollingInterval,
      );
    },
  },
};

export const appOption = {
  'Open ToC in Sidebar': {
    check(app: App): boolean {
      return true; // We handle the case when there is no noteUUID later
    },
    async run(app: App): Promise<void> {
      const url = app.context?.url || '';
      const noteUUID = getCurrentNoteUUIDFromUrl(url);

      const colorMode = getColorMode(app);
      const pollingInterval = getPollingInterval(app);
      const aspectRatio = calcAspectRatio();
      await app.openSidebarEmbed(
        { id: 'Table of Contents', aspectRatio },
        noteUUID,
        colorMode,
        pollingInterval,
      );
    },
  },
};

//TODO:
//  onNavigate: {
//    "Open ToC in Sidebar": {
//      check(app, /* url */) {
//        return true; // "won't be called for this action", like, never!
//      },
//      async run(app, url) {
//        // manual check
//        if(!this._isPluginActive) { return };
//        const noteUUID = this._getCurrentNoteUUIDFromUrl(url);
//        if(!this._assertNoteContext(noteUUID)) { return };
//
//        const colorMode = this._getColorMode(app);
//        await app.openSidebarEmbed(
//          { id: "Table of Contents", aspectRatio: this._calcAspectRatio() },
//          noteUUID,
//          colorMode
//        );
//      }
//    }
//  },
