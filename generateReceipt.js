import fetch from "node-fetch";
import pdfMake from "pdfmake/build/pdfmake.js";
import vfsFonts from "./vfs_fonts.js";
import fs from "fs";
import { sign } from "crypto";
import path from 'path';
import csv from 'csv-parser';

import { fileURLToPath } from 'url';

const apiKey = "AIzaSyBCd5mTiIJpEcpAM-I29GUkHNq2KBB6eME";
const spreadsheetId = process.env.spreadsheetid;
const range = process.env.sheetname+"!A1:F57";

const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    
// const columnMapping = {
//   'Flat No.': ,
//     'Owner Name',
//     'Amount Paid',
//     'Payment Date',
//     'Mode of Payment',
//     'Transaction Id'
// };




// Convert English digits to Gujarati
function toGujaratiDigits(numStr) {
    const eng = "0123456789";
    const guj = "૦૧૨૩૪૫૬૭૮૯";
    return String(numStr).split('').map(ch => {
        const index = eng.indexOf(ch);
        return index !== -1 ? guj[index] : ch;
    }).join('');
}

function convertFileName(flat, quarter) {
    const fileName = "Receipts/"+quarter+"/"+flat.replaceAll(" ", "_")+".pdf";
    if (!fs.existsSync("Receipts/"+quarter+"/")){
      console.log("Create")
      fs.mkdirSync("Receipts/"+quarter,  { recursive: true });

    }
    const data = { filePath: "Receipts/"+quarter+"/", "subFolder": quarter };
    fs.writeFileSync("data.json", JSON.stringify(data));
    
   console.log("fileName ",fileName )
    return fileName;
}

// Map flat letters to Gujarati
const flatMap = { "A": "એ", "B": "બી", "C": "સી", "D": "ડી" };

function convertFlat(flat) {
    const parts = flat.split(' ');
    if (flatMap[parts[0]]) {
        return `${flatMap[parts[0]]}-${toGujaratiDigits(parts[1])}`;
    }
    return toGujaratiDigits(flat);
}

// Month mapping
const monthMap = {
    "January": "જાન્યુઆરી", "February": "ફેબ્રુઆરી", "March": "માર્ચ",
    "April": "એપ્રિલ", "May": "મે", "June": "જૂન",
    "July": "જુલાઈ", "August": "ઑગસ્ટ", "September": "સપ્ટેમ્બર",
    "October": "ઑક્ટોબર", "November": "નવેમ્બર", "December": "ડિસેમ્બર"
};

const monthNoMap = {
    "January": "1", "February": "2", "March": "3",
    "April": "4", "May": "5", "June": "6",
    "July": "7", "August": "8", "September": "9",
    "October": "10", "November": "11", "December": "12"
};

// Amount words mapping
const amountWordsMap = {
    5100: "પાંચ હજાર એકસો પુરા",
    5600: "પાંચ હજાર છસો પુરા",
    5700: "પાંચ હજાર સાતસો પુરા",
    6200: "છ હજાર બે સો પુરા",
};

function transliterateName(name) {
    for (const key in nameReplacements) {
        if (name.includes(key)) {
            name = name.replace(key, nameReplacements[key]);
        }
    }
    return name;
}
function getKeyfromValue(valueToFind, myObject){
    let foundKey;

    for (const key in myObject) {
        if (myObject.hasOwnProperty(key) && myObject[key] === valueToFind) {
            foundKey = key;
            break; // Exit the loop once the key is found
        }
    }
    return foundKey;
}

function getPaymentForDetail(month) {
    const monthNo = monthNoMap[month];
    const quarterMonth = getQuarterMonths(parseInt(monthNo));
    const start = getKeyfromValue(quarterMonth.startMonth.toString(), monthNoMap);
    const end = getKeyfromValue(quarterMonth.endMonth.toString(), monthNoMap);
    return {
        start: monthMap[start],
        end: monthMap[end],
        quarter: quarterMonth.quarter, 
    };
}

// Convert a single row
function convertRow(row, serial) {
    // Trim keys & values
    for (const key in row) {
        row[key.trim()] = row[key]?.trim();
    }
    // Date
    const dateParts = row["Payment Date"].split(' ');
    const day = toGujaratiDigits(dateParts[0]);
    const month = monthMap[dateParts[1]] || dateParts[1];
    const year = toGujaratiDigits(dateParts[2]);

    const payment_for = getPaymentForDetail(dateParts[1]);
    // Receipt no
    const receiptNo = `${dateParts[2]}${payment_for.quarter}${String(serial).padStart(2, '0')}`;
    // Amount
    const amount = parseInt(row["Amount Paid"]);

    // Owner Name transliteration
    // Note: The original code has a comment for a library that's not available in Node.js.
    // The provided manual map is used instead.
    const gujName = row["Owner Name"];

    return {
        "receipt_no": toGujaratiDigits(receiptNo),
        "date": `${day} ${month} ${year}`,
        "name": gujName,
        "file_name": convertFileName(row["Flat No."], `${dateParts[2]}-0${payment_for.quarter}`),
        "flat_no": convertFlat(row["Flat No."]),
        "amount": toGujaratiDigits(amount),
        "amount_word": amountWordsMap[amount] || "",
        "payment_mode": row["Mode of Payment"].toLowerCase() === "cash" ? "રોકડા" : "ઓનલાઈન",
        "utr_number": row["Transaction Id"] ? row["Transaction Id"] : "",
        "payment_for": `${payment_for.start} થી ${payment_for.end} - ${year} નું મેઇન્ટેનન્સ`
    };
}


// function createDateFromDMY(dateString) {
//     const parts = dateString.split('-');
//     // Parts will be [day, month, year]
//     const day = parseInt(parts[0], 10);
//     const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
//     const year = parseInt(parts[2], 10);

//     return new Date(year, month, day);
// }

function getQuarterMonths(month) {
    const quarter = Math.ceil(month / 3);
    const startMonthIndex = (quarter-1) * 3;
    const endMonthIndex = startMonthIndex + 2;    // Return 1-indexed month numbers for user clarity
    return {
        startMonth: startMonthIndex + 1,
        endMonth: endMonthIndex + 1,
        quarter: quarter
    };
}


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
    const fileName = file_name;
    fs.writeFileSync(fileName, buffer);
    console.log("✅ Gujarati receipt PDF generated");
  });
}



async function readSheet() {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values;
    const header = rows[0];
    let serial = 0;
    
    const mapped = rows.slice(1).map(row => {
        let obj = {};
        serial++;
        header.forEach((colName, idx) => {
            const key = colName; // map if defined, else keep original
            obj[key] = row[idx] || null;
        });
        const result =  convertRow(obj, serial);
        createReceiptPDF(result);
        return result;
    });

}

readSheet();