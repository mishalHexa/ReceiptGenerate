import pdfMake from "pdfmake/build/pdfmake.js";
import vfsFonts from "./vfs_fonts.js";
import fs from "fs";
import { sign } from "crypto";

// Load Gujarati font into pdfmake vfs

pdfMake.vfs = vfsFonts;

pdfMake.fonts = {
  Shruti: {
    normal: "Shruti.ttf",
    bold: "Shruti-Bold.ttf",
  },
  NotoSansGujarati: {
    normal: "NotoSansGujarati-Regular.ttf",
    bold: "NotoSansGujarati-Bold.ttf",
  },
  NotoSansGujaratiExtraBold: {
    normal: "NotoSansGujarati-ExtraBold.ttf",
    bold: "NotoSansGujarati-ExtraBold.ttf",
  },
};
const signBase64 = fs.readFileSync("./sign.png").toString("base64");
function createReceiptPDF({
  file_name,
  flat_no,
  receipt_no,
  date,
  name,
  payment_for,
  amount,
  amount_word,
  payment_mode,
  utr_number,
}) {
  const width = 400;
  const height = 250;
  const borderColor = "#BE0028";
  const inputColor = "#000000";
  const leftmargin = 15;
  const yAlign = {
    societyname: 35,
    societyregno: 50,
    societyAddress: 60,
    middleline: 65,
    dateandnumber: 75,
    name: 95,
    paymentrelated: 115,
    ruppeeword: 135,
    utr: 155,
    acceptsentenance: 175,
    ruppeeNumber: 199,
    sign: 230,
  };

  const pageSize = { width: width, height: height };
  const docDefinition = {
    pageSize: pageSize, // Custom receipt size
    pageMargins: [0, 0, 0, 0], // No margins
    defaultStyle: {
      font: "Shruti",
      fontSize: 9,
    },
    content: [
      // 🔲 Outer border (absolute position)
      {
        canvas: [
          {
            type: "rect",
            x: 5,
            y: 5,
            w: width - 10,
            h: height - 10,
            lineColor: borderColor,
            lineWidth: 1.5,
          },
        ],
        absolutePosition: { x: 0, y: 0 },
      },
      // 🔲 Outer border thinner (absolute position)
      {
        canvas: [
          {
            type: "rect",
            x: 8,
            y: 8,
            w: width - 16,
            h: height - 16,
            lineColor: borderColor,
            lineWidth: 0.5,
          },
        ],
        absolutePosition: { x: 0, y: 0 },
      },

      // 🔲 Header Red Border Box block for Block number
      {
        canvas: [
          {
            type: "rect",
            x: 8,
            y: 8,
            w: 85,
            h: 20,
            lineColor: borderColor,
            lineWidth: 1.5,
            absolutePosition: { x: 0, y: 0 },
          },
          {
            type: "rect",
            x: 8,
            y: 8,
            w: 35,
            h: 20,
            color: borderColor,
            absolutePosition: { x: 0, y: 0 },
          },
        ],
      },
      // 🔲 Header red block
      {
        text: "Block",
        fontSize: 10,
        bold: true,
        height: 20,
        color: "white",
        absolutePosition: { x: 12, y: 10 },
      },

      {
        text: flat_no,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 12,
        color: inputColor,
        absolutePosition: { x: leftmargin + 30, y: 12 },
      },

      // 🔲 Gujarati Title
      {
        text: "|| ૐ ||",
        font: "NotoSansGujarati",
        fontSize: 10,
        alignment: "center",
        width: "auto",
        color: borderColor,
        bold: true,
        absolutePosition: { x: 0, y: 10 }, // adjust placement
      },
      // 🔲 Gujarati Title
      {
        text: "ધી કોલીન-પ૬ કો.ઓ.હાઉસિંગ સર્વિસ સોસાયટી લી.",
        font: "NotoSansGujaratiExtraBold",
        fontSize: 13,
        alignment: "center",
        color: borderColor,
        width: "auto",
        bold: true,
        absolutePosition: { x: 0, y: yAlign.societyname }, // adjust placement
      },

      {
        text: "આરઆઈજી/એએસડી/સા(હ) ૧૩૩૬૮ / તા. ૦૨/૦૯/૨૦૨૦",
        font: "NotoSansGujarati",
        fontSize: 8,
        alignment: "center",
        color: borderColor,
        bold: true,
        width: "auto",
        absolutePosition: { x: 0, y: yAlign.societyregno },
      },
      {
        text: "મણીલાલ પાર્ટી પ્લોટની સામે, મોટેરા-સુધાર રોડ મોટેરા, સાબરમતી, અમદાવાદ-૩૮૦૦૦૫",
        font: "NotoSansGujarati",
        fontSize: 7,
        alignment: "center",
        color: borderColor,
        bold: true,
        width: "auto",
        absolutePosition: { x: 0, y: yAlign.societyAddress },
      },
      {
        // text: "____________________________________________________________________________________________________",
        text: "*****************************************************************",
        font: "Shruti",
        w: "auto",
        alignment: "center",
        bold: true,
        color: borderColor,
        absolutePosition: { x: 5, y: yAlign.middleline },
      },
      // 🔲 Receipt details
      {
        text: "નંબર : ",
        font: "Shruti",
        bold: true,
        color: borderColor,
        absolutePosition: { x: leftmargin, y: yAlign.dateandnumber },
      },
      {
        text: receipt_no,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 30, y: yAlign.dateandnumber },
      },
      {
        text: "તા. ",
        font: "Shruti",
        bold: true,
        color: borderColor,
        absolutePosition: { x: 260, y: yAlign.dateandnumber },
      },
      {
        text: date,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: 260 + 14, y: yAlign.dateandnumber },
      },
      {
        text: "શ્રી/શ્રીમતી ______________________________________________________________________",
        font: "Shruti",
        bold: true,
        color: borderColor,
        absolutePosition: { x: leftmargin, y: yAlign.name },
      },
      {
        text: name,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 50, y: yAlign.name },
      },
      {
        text: "જત આપના તરફથી ______________________________________________________________",
        font: "Shruti",
        color: borderColor,
        bold: true,
        absolutePosition: { x: leftmargin, y: yAlign.paymentrelated },
      },
      {
        text: payment_for,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 80, y: yAlign.paymentrelated },
      },
      {
        text: "અંકે રૂ. _______________________________________________________________પેટે મળ્યા છે. ",
        font: "Shruti",
        color: borderColor,
        bold: true,
        absolutePosition: { x: leftmargin, y: yAlign.ruppeeword },
      },
       {
        text: amount_word,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 40, y: yAlign.ruppeeword },
      },
      {
        text: "ચુકવણી પદ્ધતિ ___________ યુટીઆર નં.  ___________________________________________ ",
        font: "Shruti",
        bold: true,
        color: borderColor,
        absolutePosition: { x: leftmargin, y: yAlign.utr },
      },
      {
        text: payment_mode,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 65, y: yAlign.utr },
      },
      {
        text: utr_number,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 10,
        color: inputColor,
        absolutePosition: { x: leftmargin + 170, y: yAlign.utr },
      },
      {
        text: "જે આભાર સ્વીકારવામાં આવે છે.",
        font: "Shruti",
        bold: true,
        color: borderColor,
        absolutePosition: { x: leftmargin, y: yAlign.acceptsentenance },
      },
      // 🔲 Rupee box
      {
        canvas: [
          {
            type: "rect",
            x: leftmargin + 10,
            y: yAlign.ruppeeNumber - 30,
            w: 80,
            h: 25,
            lineColor: borderColor,
            lineWidth: 1.5,
            absolutePosition: { x: 0, y: 0 },
          },
          {
            type: "rect",
            x: leftmargin + 10,
            y: yAlign.ruppeeNumber - 30,
            w: 20,
            h: 25,
            color: borderColor,
            absolutePosition: { x: 0, y: 0 },
          },
        ],
      },
      {
        text: "₹",
        font: "NotoSansGujarati",
        fontSize: 18,
        bold: true,
        color: "#FFFFFF",
        absolutePosition: { x: leftmargin + 15, y: yAlign.ruppeeNumber },
      },
       {
        text: amount,
        font: "NotoSansGujarati",
        bold: true,
        fontSize: 15,
        color: inputColor,
        absolutePosition: { x: leftmargin + 40, y: yAlign.ruppeeNumber },
      },
      {
        image: "data:image/png;base64," + signBase64,
        width: 40 * 2.31,
        height: 40,
        absolutePosition: { x: 290, y: yAlign.sign - 35 },
      },
      // 🔲 Signature box
      // {
      //   canvas: [
      //     {
      //       type: "rect",
      //       x: 320,
      //       y: -50,
      //       w: 50,
      //       h: 50,
      //       lineWidth: 1,
      //       lineColor: borderColor,
      //       absolutePosition: { x: 0, y: 0 },
      //     },
      //   ],
      // },
      
      {
        text: "નાણાં લેનારની સહી",
        font: "NotoSansGujarati",
        w: 50,
        fontSize: 8,
        color: borderColor,
        absolutePosition: { x: 300, y: yAlign.sign },
      }

    ],
  };

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getBuffer((buffer) => {
    const fileName = file_name+".pdf";
    fs.writeFileSync(fileName, buffer);
    console.log("✅ Gujarati receipt PDF generated");
  });
}

// Example call
// createReceiptPDF({
//   receipt_no: "૨૫૦૪૦૦૧",
//   date: "૦૧-૧૦-૨૦૨૫",
//   name: "મિશાલ પરમાર",
//   payment_for: "ઓક્ટોબર થી ડિસેમ્બર - ૨૦૨૫ નું મેઇન્ટેનન્સ",
//   amount: "૫૧૦૦",
//   amount_word: "એકાવન સો પુરા",
//   payment_mode: "રોકડા",
//   utr_number: "xxx",
// });

fs.readFile('./output.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    // Parse JSON
    const jsonData = JSON.parse(data);

    jsonData.forEach((item) => {
      console.log("item:", item);
      // console.log("Date:", item.date);
      // console.log("Name:", item.name);
      // console.log("Flat No:", item.flat_no);
      // console.log("Amount:", item.amount);
      // console.log("Amount in words:", item.amount_word);
      // console.log("Payment Mode:", item.payment_mode);
      // console.log("UTR Number:", item.utr_number);
      // console.log("Payment For:", item.payment_for);
      // console.log("------------------------------");
      createReceiptPDF(item);
    });
    
});
