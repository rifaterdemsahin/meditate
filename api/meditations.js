import { MongoClient } from "mongodb";

// Reuse the Mongo connection across warm serverless invocations.
let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

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
    const col = (await getDb()).collection("counters");

    if (req.method === "POST") {
      const r = await col.findOneAndUpdate(
        { _id: "meditations" },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      // mongodb v6 returns the doc directly; older versions wrap it in `.value`.
      const count = r?.value?.count ?? r?.count ?? 1;
      return res.status(200).json({ count });
    }

    if (req.method === "GET") {
      const doc = await col.findOne({ _id: "meditations" });
      return res.status(200).json({ count: doc?.count ?? 0 });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
