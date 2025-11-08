import { noteOption, appOption } from "./actions/actions";
import { onEmbedCall } from "./embedCallHandler/onEmbedCall";
import { renderEmbed } from "./rendering/embed";

const plugin = {
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

export default plugin;
