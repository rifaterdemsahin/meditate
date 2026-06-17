import express from "express";
import { MongoClient } from "mongodb";
import { BlobServiceClient } from "@azure/storage-blob";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Local dev convenience: load .env.local if present (Fly injects real env vars in prod).
const envFile = join(__dirname, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const app = express();
const PORT = process.env.PORT || 8080;

// ---------- MongoDB (session counter + live presence) ----------
let dbPromise = null;
async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!dbPromise) {
    dbPromise = new MongoClient(process.env.MONGODB_URI).connect().then((c) => c.db("meditate"));
  }
  return dbPromise;
}

// Total completed sessions
app.get("/api/meditations", async (_req, res) => {
  try {
    const doc = await (await getDb()).collection("counters").findOne({ _id: "meditations" });
    res.json({ count: doc?.count ?? 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/meditations", async (_req, res) => {
  try {
    const r = await (await getDb()).collection("counters").findOneAndUpdate(
      { _id: "meditations" },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    res.json({ count: r?.value?.count ?? r?.count ?? 1 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Live presence: "people meditating right now"
const ACTIVE_WINDOW_MS = 30_000;
async function presence(req, res, record) {
  try {
    const db = await getDb();
    const presence = db.collection("presence");
    await presence.createIndex({ at: 1 }, { expireAfterSeconds: 60 }).catch(() => {});
    if (record) {
      const id = String(req.query.id || Math.random().toString(36).slice(2));
      await presence.updateOne({ _id: id }, { $set: { at: new Date() } }, { upsert: true });
    }
    const active = await presence.countDocuments({ at: { $gte: new Date(Date.now() - ACTIVE_WINDOW_MS) } });
    const totalDoc = await db.collection("counters").findOne({ _id: "meditations" });
    res.json({ active, total: totalDoc?.count ?? 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
app.get("/api/presence", (req, res) => presence(req, res, false));
app.post("/api/presence", (req, res) => presence(req, res, true));

// ---------- Azure Blob (generated meditation MP3s) ----------
const AZURE_CONTAINER = "audio";
const AZURE_FOLDER = "meditations";
let containerClient = null;
function getContainer() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  if (!containerClient) {
    containerClient = BlobServiceClient
      .fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
      .getContainerClient(AZURE_CONTAINER);
  }
  return containerClient;
}

app.post("/api/audio", express.raw({ type: "*/*", limit: "25mb" }), async (req, res) => {
  try {
    const container = getContainer();
    await container.createIfNotExists({ access: "blob" });
    const name = String(req.query.name || `meditation-${Date.now()}.mp3`).replace(/[^a-zA-Z0-9._-]/g, "-");
    const block = container.getBlockBlobClient(`${AZURE_FOLDER}/${name}`);
    await block.uploadData(req.body, { blobHTTPHeaders: { blobContentType: "audio/mpeg" } });
    res.json({ name, url: block.url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/audio", async (_req, res) => {
  try {
    const container = getContainer();
    await container.createIfNotExists({ access: "blob" });
    const files = [];
    for await (const b of container.listBlobsFlat({ prefix: `${AZURE_FOLDER}/` })) {
      files.push({ name: b.name.replace(`${AZURE_FOLDER}/`, ""), url: container.getBlockBlobClient(b.name).url });
    }
    res.json({ files });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- Static site ----------
app.use(express.static(__dirname, { extensions: ["html"] }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Meditate server listening on :${PORT}`));
