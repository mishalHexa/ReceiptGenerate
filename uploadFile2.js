import { google } from "googleapis";
import fs from "fs";

const KEYFILEPATH = "./colin56-projet-f4bb7154fdec.json"; // your service account key
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

async function uploadFile() {
  try {
    const fileMetadata = {
      name: "A_101.pdf", // Name in Google Drive
      parents: ["1EMxgQ-PgZ6KIrFTGyLpQqBSR2UZnBPmU"],  // Optional: put inside folder
    };

      const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream("A_101.pdf"), // Path to your PDF
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log("✅ File uploaded successfully!");
    console.log("File ID:", response.data.id);
    console.log("View Link:", response.data.webViewLink);
    console.log("Download Link:", response.data.webContentLink);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

uploadFile();