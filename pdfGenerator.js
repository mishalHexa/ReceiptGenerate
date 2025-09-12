// pdfGenerator.js
import pdfMake from "pdfmake/build/pdfmake.js";
import vfsFonts from "./vfs_fonts.js";
import fs from "fs";

// Load Gujarati font into pdfmake vfs
pdfMake.vfs = {
  "NotoSansGujarati-Regular.ttf": vfsFonts["NotoSansGujarati-Regular.ttf"],
};

// Register font
pdfMake.fonts = {
  NotoSansGujarati: {
    normal: "NotoSansGujarati-Regular.ttf",
    bold: "NotoSansGujarati-Regular.ttf",
    italics: "NotoSansGujarati-Regular.ttf",
    bolditalics: "NotoSansGujarati-Regular.ttf",
  },
};

const docDefinition = {
  content: [
    { text: "હેલો વર્લ્ડ", font: "NotoSansGujarati", fontSize: 22 },
    { text: "આ ગુજરાતી PDF સાચા આકારમાં છે !", font: "NotoSansGujarati", fontSize: 16 },
  ],
  defaultStyle: {
    font: "NotoSansGujarati",
  },
};

// Generate and save PDF
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBuffer((buffer) => {
  fs.writeFileSync("gujarati.pdf", buffer);
  console.log("✅ Gujarati PDF generated: gujarati.pdf");
});
