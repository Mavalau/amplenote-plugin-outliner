import { App } from "../typing/amplenote-plugin-types";
import { bodyTemplate } from "./body.template";
import { styleTemplate } from "./style.template";
import { scriptTemplate } from "./script.template";

// TODO: use proper frontend framework

/**
 * Generates the HTML for the sidebar embed.
 */
export async function renderEmbed(app: App, ...args: any[]): Promise<string> {
  //TODO: use typed args
  const initialUUID  = args[0];
  const colorMode    = args[1];
  const pollingIntervalMs = args[2];

  const body = bodyTemplate({ colorMode });
  const script = scriptTemplate({ initUUID: initialUUID, pollMs: pollingIntervalMs });
  const styles = styleTemplate();
  return `\n${body}\n<style>\n${styles}\n</style>\n${script}`;
}
