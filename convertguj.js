import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

import { fileURLToPath } from 'url';

// Convert English digits to Gujarati
function toGujaratiDigits(numStr) {
    const eng = "0123456789";
    const guj = "૦૧૨૩૪૫૬૭૮૯";
    return String(numStr).split('').map(ch => {
        const index = eng.indexOf(ch);
        return index !== -1 ? guj[index] : ch;
    }).join('');
}

function convertFileName(flat) {
    const fileName = flat.replaceAll(" ", "_");
   
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
    console.log("quarterMonth ",quarterMonth);
    const start = getKeyfromValue(quarterMonth.startMonth.toString(), monthNoMap);
    const end = getKeyfromValue(quarterMonth.endMonth.toString(), monthNoMap);
    console.log("end ",end)
    return {
        start: monthMap[start],
        end: monthMap[end],
    };
}

// Convert a single row
function convertRow(row, serial) {
    // Trim keys & values
    for (const key in row) {
        row[key.trim()] = row[key].trim();
    }

    // Date
    const dateParts = row["Payment Date"].split(' ');
    const day = toGujaratiDigits(dateParts[0]);
    const month = monthMap[dateParts[1]] || dateParts[1];
    const year = toGujaratiDigits(dateParts[2]);

    const payment_for = getPaymentForDetail(dateParts[1]);
    // Receipt no
    const receiptNo = `202503${String(serial).padStart(2, '0')}`;
    console.log("payment_for ",payment_for)
    console.log("month ",month)
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
        "file_name": convertFileName(row["Flat No."]),
        "flat_no": convertFlat(row["Flat No."]),
        "amount": toGujaratiDigits(amount),
        "amount_word": amountWordsMap[amount] || "",
        "payment_mode": row["Mode of Payment"].toLowerCase() === "cash" ? "રોકડ" : "ઓનલાઈન",
        "utr_number": row["Transaction Id"] ? toGujaratiDigits(row["Transaction Id"]) : "",
        "payment_for": `${payment_for.start} થી ${payment_for.end} - ${year} નું મેઇન્ટેનન્સ`
    };
}


function createDateFromDMY(dateString) {
    const parts = dateString.split('-');
    // Parts will be [day, month, year]
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

function getQuarterMonths(month) {
    const quarter = Math.floor(month / 3);
    console.log("quarter ",quarter);
    const startMonthIndex = quarter * 3;
    const endMonthIndex = startMonthIndex + 2;

    // Return 1-indexed month numbers for user clarity
    return {
        startMonth: startMonthIndex + 1,
        endMonth: endMonthIndex + 1
    };
}

// Main function to process the CSV file
async function main() {
    const results = [];
    let serial = 1;


    // Convert the current module's URL to a file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fs.createReadStream(path.join(__dirname, 'input.csv'))
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data) => {
            results.push(convertRow(data, serial));
            serial++;
        })
        .on('end', () => {
            fs.writeFileSync('output.json', JSON.stringify(results, null, 2), 'utf-8');
            console.log("✅ Gujarati JSON created: output.json");
        })
        .on('error', (err) => {
            console.error("❌ An error occurred:", err);
        });
}

main();