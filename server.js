import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const translate = require("node-google-translate-skidz");

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["jpg", "png", "gif"],
  })
);

app.post("/translate", (req, res) => {
  const { text, source, target } = req.body;

  translate({ text, source, target }, function (result) {
    if (result && result. translation) {
      res.json({ translation: result.translation });
    } else {
      res.status(500).json({ error: "Translation error" });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
