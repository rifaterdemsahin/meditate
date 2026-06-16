import { MongoClient } from "mongodb";

// Tracks "people meditating right now" via short-lived heartbeats in MongoDB.
// POST  -> record a heartbeat for a client id, returns { active, total }
// GET   -> returns { active, total } without recording

const ACTIVE_WINDOW_MS = 30_000; // a client counts as active for 30s after a heartbeat

let cached = global._mongoP;
if (!cached) cached = global._mongoP = { conn: null, promise: null };

async function getDb() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    cached.promise = client.connect().then((c) => c.db("meditate"));
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const presence = db.collection("presence");
    const counters = db.collection("counters");

    // TTL index so stale heartbeats disappear automatically.
    await presence.createIndex({ at: 1 }, { expireAfterSeconds: 60 }).catch(() => {});

    if (req.method === "POST") {
      const id = String(req.query.id || Math.random().toString(36).slice(2));
      await presence.updateOne({ _id: id }, { $set: { at: new Date() } }, { upsert: true });
    }

    const since = new Date(Date.now() - ACTIVE_WINDOW_MS);
    const active = await presence.countDocuments({ at: { $gte: since } });
    const totalDoc = await counters.findOne({ _id: "meditations" });

    return res.status(200).json({ active, total: totalDoc?.count ?? 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
