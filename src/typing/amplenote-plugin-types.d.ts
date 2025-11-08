//TODO: There is no proper TS typing provided by Amplenote yet.
export interface App {
  [key: string]: any;
}

// https://www.amplenote.com/help/developing_amplenote_plugins#section
export type Section = {
  heading: null | {
    anchor: string;
    href?: string;
    level: 1 | 2 | 3;
    text: string;
  },
  index?: number;
};
