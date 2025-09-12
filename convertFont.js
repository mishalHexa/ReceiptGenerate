// convertFont.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = path.join(__dirname, "NotoSansGujarati-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

// Convert to Base64
const base64 = fontData.toString("base64");

// Save as JS file for pdfmake vfs
fs.writeFileSync(
  path.join(__dirname, "vfs_fonts.js"),
  `export default { "NotoSansGujarati-Regular.ttf": "${base64}" };`
);

console.log("✅ Font converted to vfs_fonts.js");
