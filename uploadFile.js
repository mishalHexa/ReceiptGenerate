import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

const CREDENTIALS_PATH = path.join(process.cwd(), "credential.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const parentId = "1EMxgQ-PgZ6KIrFTGyLpQqBSR2UZnBPmU";
async function loadSavedCredentialsIfExist() {
  try {
   
    const credentials = JSON.parse(
      Buffer.from(process.env.TOKEN_JSON, 'base64').toString('utf8')
    );
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  // const keys = JSON.parse(content);
  const keys = JSON.parse(
    Buffer.from(process.env.CLIENT_SECRET_JSON, 'base64').toString('utf8')
  );
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) return client;

  client = await authenticate({
    scopes: ["https://www.googleapis.com/auth/drive.file"],
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    console.log("client ",client);
    await saveCredentials(client);
  }
  return client;
}

// 👈 change to your folder path


async function createFolder(drive, name, parentId) {
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId], // 👈 parent folder ID
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id, name, webViewLink",
  });

  console.log(`📂 Folder created: ${res.data.name}`);
  console.log(`ID: ${res.data.id}`);
  console.log(`Link: ${res.data.webViewLink}`);
  return res.data.id;
}


async function folderExists(drive, folderName, parentId = null) {
  let q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files.length > 0) {
    console.log(`📂 Folder exists! ID: ${res.data.files[0].id}`);
    return res.data.files[0].id;
  } else {
    console.log("❌ Folder not found");
    return null;
  }
}

async function fileExists(drive, fileName, parentId = null) {
  let q = `name='${fileName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q,
    fields: "files(id, name, mimeType)",
    spaces: "drive",
  });

  if (res.data.files.length > 0) {
    console.log(`📄 File exists! ID: ${res.data.files[0].id}`);
    return res.data.files[0].id;
  } else {
    console.log("❌ File not found");
    return null;
  }
}


async function uploadAllFiles(auth) {
  const drive = google.drive({ version: "v3", auth });
  const raw = fs.readFileSync("data.json");
  const data = JSON.parse(raw);
  const folderPath = data.filePath; 
  const subFolder = data.subFolder; 
  const files = fs.readdirSync(folderPath); // you can also make this async if needed
  const folderParentId = await folderExists(drive, subFolder,parentId );
  if (!folderParentId){
    folderParentId = await createFolder(drive, subFolder,parentId )
  }
  for (const file of files) {
    console.log("📂 Processing:", file);
    const fileExist = await fileExists(drive, file, folderParentId );
    if(fileExist) continue;
    const fileMetadata = {
      name: file, // 👈 keep original filename
      parents: [folderParentId],
    };

    const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(path.join(folderPath, file)),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log("✅ Uploaded:", res.data);
  }
}

async function uploadFile(auth) {

  const fileMetadata = {
    name: "my-uploaded.pdf",
  };

  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream("A_101.pdf"), // 👈 replace with your file
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });

  console.log("✅ Uploaded:", res.data);
}

authorize().then(uploadAllFiles).catch(console.error);
