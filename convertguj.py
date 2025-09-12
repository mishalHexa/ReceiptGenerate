import csv
import json
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

# Convert English digits to Gujarati
def to_gujarati_digits(num_str):
    eng = "0123456789"
    guj = "૦૧૨૩૪૫૬૭૮૯"
    return "".join(guj[eng.index(ch)] if ch in eng else ch for ch in str(num_str))

# Map flat letters to Gujarati
flat_map = {"A": "એ", "B": "બી", "C": "સી", "D": "ડી"}
def convert_flat(flat):
    parts = flat.split()
    if parts[0] in flat_map:
        return f"{flat_map[parts[0]]} {to_gujarati_digits(parts[1])}"
    return to_gujarati_digits(flat)

# Month mapping
month_map = {
    "January": "જાન્યુઆરી", "February": "ફેબ્રુઆરી", "March": "માર્ચ",
    "April": "એપ્રિલ", "May": "મે", "June": "જૂન",
    "July": "જુલાઈ", "August": "ઑગસ્ટ", "September": "સપ્ટેમ્બર",
    "October": "ઑક્ટોબર", "November": "નવેમ્બર", "December": "ડિસેમ્બર"
}

# Amount words mapping
amount_words_map = {
    5100: "પાંચ હજાર એકસો પુરા",
    5700: "પાંચ હજાર સાતસો પુરા",
    6200: "છ હજાર બે સો પુરા"
}


def transliterate_name(name):
    replacements = {
        "Hemendrabhai Panchal": "હેમેન્દ્રભાઈ પંચાલ",
        "Hemendrabhai Patel": "હેમેન્દ્રભાઈ પટેલ",
        "Pankajbhai Roy": "પંકજભાઈ રોય",
        "Jashiben Rathod": "જશીબેન રાઠોડ",
        "Akashbhai Patel": "આકાશભાઈ પટેલ",
        "Dhavalbhai Patel": "ધવલભાઈ પટેલ",
        "Niruben Bharward": "નિરુબેન ભરવર્ડ",
        "Kokilaben Rajiubhai Soni": "કોકિલાબેન રાજીઉભાઈ સોની",
        "Meraji Vanzara": "મેરાજી વાનઝારા",
        "Jitendrabhai Vanzara": "જીતેન્દ્રભાઈ વાનઝારા",
        "Ektaben V. Ramchandani": "એકટાબેન વી. રામચંદાણી",
        "Jayantibhai M. Nayak (Chiragbhai)": "જયંતિભાઈ એમ. નાયક (ચિરાગભાઈ)",
        "Ishwarbhai Sonara": "ઈશ્વરભાઈ સોનારા",
        "Hardikbhai Patel": "હાર્દિકભાઈ પટેલ",
        "Manojbhai Manaukahni": "મનોજભાઈ મનૌકહાની",
        "Bharatbhai Chauhan": "ભરતભાઈ ચૌહાણ",
        "Bharatbhai Dobariya": "ભરતભાઈ ડોબરિયા",
        "Pushpalata Devi": "પુષ્પલતા દેવી",
        "Vijay Rathod": "વિજય રાઠોડ",
        "Mukeshbhai Patel": "મુકેશભાઈ પટેલ",
        "Bharatbhai Kourani": "ભરતભાઈ કૌરાણી",
        "Hardik": "હાર્દિક",
        "Sureshbhai Joshi (Shaun)": "સુરેશભાઈ જોશી (શોન)",
        "Jigneshkumar Prajapati": "જિગ્નેશકુમાર પ્રજાપતિ",
        "Dr Rajendra Rentiyal": "ડૉ. રાજેન્દ્ર રેંટીયલ",
        "Tusharbhai Patel": "તુષારભાઈ પટેલ",
        "Gautambhai Asodiya": "ગૌરાંગભાઈ અસોદિયા",
        "Ravindrabhai Rathod": "રવિન્દ્રભાઈ રાઠોડ",
        "Ajaybhai Prajapati": "અજયભાઈ પ્રજાપતિ",
        "Pareshbhai Prajapati": "પારેશભાઈ પ્રજાપતિ",
        "Hiteshbhai Prajapti": "હિતેશભાઈ પ્રજાપ્તિ",
        "Naraynbhai Parmar": "નરાયણભાઈ પાર્મર",
        "Yogeshbhai Prajapati": "યોગેશભાઈ પ્રજાપતિ",
        "Manishaben Parmar": "મનીષાબેન પાર્મર",
        "Viralbhai Rathod": "વિરલભાઈ રાઠોડ",
        "Maulikbhai Prajapati": "મૌલિકભાઈ પ્રજાપતિ",
        "Nisargbhai Rathod": "નિસર્ગભાઈ રાઠોડ",
        "Mahendrabhai Thakkar": "મહેન્દ્રભાઈ ઠક્કર",
        "Ghanshyambhai Parekh": "ઘનશ્યામભાઈ પારેખ",
        "Parthbhai Ranpura": "પાર્થીભાઈ રાંપૂરા",
        "Minaben Jadav": "મિનાબેન જાડાવ",
        "Yogeshbhai Patel": "યોગેશભાઈ પટેલ",
        "Milanbhai Soni": "મિલનભાઈ સોની",
        "Mishalbhai Parmar": "મિશાલભાઈ પાર્મર",
        "Savanbhai Maheriya": "સાવનભાઈ મહેરિયા",
        "Atulkumar Prarjapati": "અતુલકુમાર પ્રજાપતિ",
        "Gaurangbhai Baroniya": "ગૌરાંગભાઈ બારોનિયા",
        "Harikishan Rathod": "હરિકિશન રાઠોડ",
        "Rajendrakumar Modiya": "રાજેન્દ્રકુમાર મોદિયા",
        "Nimeshkumar Priyankar": "નિમેષકુમાર પ્રિયંકર",
        "Deepakbhai Thawani": "દીપકભાઈ થાવાણી",
        "Prakashbhai Thawani": "પ્રકાશભાઈ થાવાણી",
        "R. D. Thakor": "આર. ડી. ઠાકોર",
        "Nimuben Patel": "નિમુબેન પટેલ",
        "Amrutbhai Parmar": "અમૃતભાઈ પાર્મર",
        "Mukeshbhai Bharward": "મુકેશભાઈ ભરવર્ડ"
    }

    for k, v in replacements.items():
        name = name.replace(k, v)
    return name



# Convert one row
def convert_row(row, serial):
    # Trim all keys & values
    row = {k.strip(): v.strip() for k, v in row.items()}

    # Date
    date_parts = row["Payment Date"].split()
    day = to_gujarati_digits(date_parts[0])
    month = month_map.get(date_parts[1], date_parts[1])
    year = to_gujarati_digits(date_parts[2])

    # Receipt no
    receipt_no = f"202503{serial:02d}"

    # Amount
    amount = int(row["Amount Paid"])

    # Owner Name transliteration
    # guj_name = transliterate(row["Owner Name"], sanscript.ITRANS, sanscript.GUJARATI)
    guj_name = row["Owner Name"]

    return {
        "receipt_no": to_gujarati_digits(receipt_no),
        "date": f"{day} {month} {year}",
        "name": guj_name,
        "flat_no": convert_flat(row["Flat No."]),
        "amount": to_gujarati_digits(amount),
        "amount_word": amount_words_map.get(amount, ""),
        "payment_mode": "રોકડ" if row["Mode of Payment"].lower() == "cash" else "ઓનલાઈન",
        "utr_number": to_gujarati_digits(row["Transaction Id"]) if row["Transaction Id"] else "",
        "payment_for": f"જુલાઈ થી સપ્ટેમ્બર - {year} નું મેઇન્ટેનન્સ"
    }

# Main
data = []
with open("./input.csv", newline='', encoding="utf-8") as f:
    reader = csv.DictReader(f)
    reader.fieldnames = [h.strip() for h in reader.fieldnames]
    for i, row in enumerate(reader, 1):
        data.append(convert_row(row, i))

with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Gujarati JSON created: output.json")
