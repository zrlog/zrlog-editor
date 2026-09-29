const fs = require("node:fs");
const path = require("node:path");
const {version} = require("../package.json");

fs.writeFileSync(path.resolve(__dirname, "../src/editor/editor-version.ts"),
    `export const editorVersion = ${JSON.stringify(version)};\n`);
