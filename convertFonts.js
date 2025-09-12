// convertFonts.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 Add all your fonts here
const fonts = [
  "Shruti.ttf",
  "Shruti-Bold.ttf",
  "NotoSansGujarati-Regular.ttf",
  "NotoSansGujarati-Bold.ttf",
  "NotoSansGujarati-ExtraBold.ttf",
];

let output = "export default {\n";

for (const font of fonts) {
  const fontPath = path.join(__dirname, font);
  if (!fs.existsSync(fontPath)) {
    console.warn(`⚠️ Font not found: ${font}`);
    continue;
  }
  const fontData = fs.readFileSync(fontPath).toString("base64");
  output += `  "${font}": "${fontData}",\n`;
}

output += "};\n";

fs.writeFileSync(path.join(__dirname, "vfs_fonts.js"), output);
console.log("✅ All fonts converted → vfs_fonts.js");
