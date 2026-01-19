//TODO: There is no proper TS typing provided by Amplenote yet.
export type App = Record<string, any>;

// https://www.amplenote.com/help/developing_amplenote_plugins#section
export interface Section {
  heading: null | {
    anchor: string;
    href?: string;
    level: 1 | 2 | 3;
    text: string;
  };
  index?: number;
}
