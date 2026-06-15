import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { models_routes } from "./api/renders.mjs";

import { config } from "dotenv";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, "..");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

//Externally defined routes
app.use(models_routes);

//Log a couple of blank lines before program starts
console.log("");
console.log("");

app.get("/{*path}", (req, res) => {
  console.log(req.path);
  console.log("Test");
  res.sendFile(path.join(__dirname, "index.html"));
});

// API Fallback API Response
app.get("/api/{*path}", (req, res) => {
  res.status(404);
  res.json({ message: "Unknown API endpoint" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
