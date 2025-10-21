import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json({ limit: "10mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");

app.use(express.static(__dirname));  // index.htmlやjsを提供

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// データ受信 (POST)
app.post("/upload", (req, res) => {
  const { filename, data } = req.body;
  fs.writeFileSync(path.join(dataDir, filename), data, "utf8");
  res.send("File saved: " + filename);
});

// データ一覧表示 (GET)
app.get("/data", (req, res) => {
  const files = fs.readdirSync(dataDir);
  res.send(`<h2>Uploaded CSV Files</h2><ul>${files.map(f => `<li><a href="/data/${f}">${f}</a></li>`).join("")}</ul>`);
});

// CSVファイル閲覧
app.get("/data/:filename", (req, res) => {
  res.sendFile(path.join(dataDir, req.params.filename));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

