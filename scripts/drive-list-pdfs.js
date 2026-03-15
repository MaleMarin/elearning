/**
 * Lista y lee el contenido (texto) de archivos PDF en una carpeta de Google Drive
 * usando una Service Account.
 *
 * Uso: node scripts/drive-list-pdfs.js <FOLDER_ID>
 * Requisitos: npm install googleapis pdf-parse
 * Compartir la carpeta con el email de la Service Account.
 */

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "..", "service-account-drive.json");

async function getDriveClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

async function listPdfsInFolder(folderId) {
  const drive = await getDriveClient();
  const q = "'" + folderId + "' in parents and mimeType = 'application/pdf' and trashed = false";
  const res = await drive.files.list({
    q,
    fields: "files(id, name)",
    orderBy: "name",
  });
  return res.data.files || [];
}

async function downloadFile(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );
  return Buffer.from(res.data);
}

async function extractTextFromPdf(buffer) {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (e) {
    return "[Error al extraer texto: " + e.message + "]";
  }
}

async function listAndReadPdfsInFolder(folderId) {
  const drive = await getDriveClient();
  const files = await listPdfsInFolder(folderId);
  const results = [];

  for (const file of files) {
    const buffer = await downloadFile(drive, file.id);
    const text = await extractTextFromPdf(buffer);
    results.push({ id: file.id, name: file.name, text: text.trim() });
  }

  return results;
}

async function main() {
  const folderId = process.argv[2];
  if (!folderId) {
    console.error("Uso: node scripts/drive-list-pdfs.js <FOLDER_ID>");
    process.exit(1);
  }

  try {
    const items = await listAndReadPdfsInFolder(folderId);
    console.log("Encontrados " + items.length + " PDF(s):\n");
    for (const item of items) {
      console.log("--- " + item.name + " (" + item.id + ") ---");
      console.log(item.text.slice(0, 500) + (item.text.length > 500 ? "..." : ""));
      console.log("");
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { listPdfsInFolder, listAndReadPdfsInFolder, getDriveClient };
