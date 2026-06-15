//NPM imports
import { fileURLToPath } from "url";
import express from "express";
import db_import from "better-sqlite3";
import { dirname, join } from "path";

import { logger_api } from "../src/libs/debug_config.mjs";

// Variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../database/app.db");

const db = db_import(dbPath);

const models_routes = express.Router();

var renders_query_string = `SELECT
	renders.render_id AS render_id,
	renders.name AS render_name,
	renders.display_name AS render_display_name,
	renders.description AS render_description
	FROM renders`;

const renders_query_promise = () => {
  return new Promise((resolve, reject) => {
    logger_api["super_verbose_api_db"](
      "Running query " + renders_query_string + "...",
    );
    const results = db.prepare(renders_query_string).all();
    logger_api["super_verbose_api_db"]("... query completed.");
    resolve(results);
  });
};

// API Route to get all shaders for a given shader set
models_routes.get("/api/renders", async (req, res) => {
  logger_api["info_api_db"]("Processing request: " + req.url);
  if (
    req.query.shader_set_name == null ||
    req.query.shader_set_name == undefined
  ) {
    var shader_set_name = "vert-colors";
  } else {
    var shader_set_name = req.query.shader_set_name as string;
  }
  try {
    logger_api["info_api_db"]("Querying database...");
    var message = await renders_query_promise();
    logger_api["info_api_db"]("...database query complete.");
    logger_api["super_verbose_api_db"]("Returning " + JSON.stringify(message));
    res.json({ success: true, message });
  } catch (err) {
    var e = err as Error;
    logger_api["error_api_db"]("Error processing query: " + err);
    res.status(500).json({ success: false, error: e.message });
  }
});

// API Route to test working
models_routes.get("/api/hello", async (req, res) => {
  res.json({ success: true, message: "hello" });
});

export { models_routes };
