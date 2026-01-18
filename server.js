import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });

const OUTPUT_DIR = path.join(__dirname, "output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

app.get("/", (req, res) => {
  res.send("Audio compressor service is running");
});

app.post("/compress", upload.single("audio"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(
    OUTPUT_DIR,
    `${Date.now()}-compressed.mp3`
  );

  ffmpeg(inputPath)
    .audioBitrate("64k")
    .toFormat("mp3")
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).send("Compression failed");
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
