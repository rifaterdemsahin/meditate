# Where to find your meditation data in MongoDB Atlas

You were on the **Atlas Search** screen (`.../clusters/atlasSearch/Cluster0`) — that page is for
search indexes, **not** your documents. Your meditation records live in the **Collections**
(a.k.a. Data Explorer / Browse Collections), not in Atlas Search.

## The data model this app writes

| Database | Collection | Document | What it holds |
| --- | --- | --- | --- |
| `meditate` | `counters` | `{ _id: "meditations", count: <number> }` | Total sessions completed worldwide |
| `meditate` | `presence` | `{ _id: <clientId>, at: <Date> }` | Live "meditating now" heartbeats (auto-expire) |

So the **meditation record** you're looking for is a single document in
**`meditate` → `counters`** with `_id: "meditations"`.

## How to find it (step by step)

1. Go to **cloud.mongodb.com** and open your project.
2. Left sidebar → **Clusters** → on **Cluster0**, click the **Browse Collections** button
   (also called **Collections** / **Data Explorer**).
   - Direct-ish URL shape: `https://cloud.mongodb.com/v2/<projectId>#/metrics/replicaSet/.../explorer`
     — easiest is just the **Browse Collections** button on the cluster card.
3. In the database list on the left, expand **`meditate`**.
   - If you don't see `meditate`, it means nothing has been written yet — complete one session
     on the site (or hit the API once) and it appears.
4. Click the **`counters`** collection.
5. You'll see one document:
   ```json
   { "_id": "meditations", "count": 1 }
   ```
   That `count` is the worldwide sessions number shown on the home page scoreboard.
6. Click **`presence`** to see live heartbeats — these come and go (a TTL index deletes each
   one ~60s after it's written), so this collection is often empty when no one is active.

## Why Atlas Search showed nothing

- **Atlas Search** indexes are a separate feature for full-text search. This app doesn't use it,
  so that screen will always look empty here.
- Make sure the **cluster name** matches (`Cluster0`) and you're in the **right project** — the
  app connects to the cluster in `cluster0.ldllrp9.mongodb.net`.

## Quick check from the command line

```bash
# prints the current worldwide count
node -e '
import("mongodb").then(async ({MongoClient})=>{
  const c=new MongoClient(process.env.MONGODB_URI); await c.connect();
  console.log(await c.db("meditate").collection("counters").findOne({_id:"meditations"}));
  await c.close();
})'
```

(Set `MONGODB_URI` first, e.g. from `.env.local`.)

## Note on the current count

During setup we ran a connectivity test that incremented `count` to **1**. If you want to launch
from zero, reset it in the Data Explorer (edit the document) or run:

```bash
# sets the worldwide counter back to 0
node -e '
import("mongodb").then(async ({MongoClient})=>{
  const c=new MongoClient(process.env.MONGODB_URI); await c.connect();
  await c.db("meditate").collection("counters").updateOne({_id:"meditations"},{$set:{count:0}},{upsert:true});
  console.log("reset to 0"); await c.close();
})'
```
