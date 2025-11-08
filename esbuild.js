import dotenv from "dotenv"
import esbuild from "esbuild"

dotenv.config();

const result = await esbuild.build({
  entryPoints: [`src/plugin.ts`],
  bundle: true,
  format: "iife",
  outfile: "build/compiled.js",
  //packages: "external", //TODO: In general, using external packages gives problems.
  legalComments: "inline", // Keep inline, because "eof" would break Amplenote Plugin Builder
  platform: "node",
  write: true,
});

console.log("Build result", result)
