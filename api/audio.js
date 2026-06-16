import { BlobServiceClient } from "@azure/storage-blob";

// Stores generated meditation MP3s in an Azure Blob container under a "meditations/" folder.
// Configure AZURE_STORAGE_CONNECTION_STRING in your serverless environment.

const CONTAINER = "audio";
const FOLDER = "meditations";

let cachedClient = null;
function getContainer() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  }
  if (!cachedClient) {
    cachedClient = BlobServiceClient
      .fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
      .getContainerClient(CONTAINER);
  }
  return cachedClient;
}

// Read the raw request body (Vercel passes a Node stream).
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const container = getContainer();
    await container.createIfNotExists({ access: "blob" });

    if (req.method === "POST") {
      const name = (req.query.name || `meditation-${Date.now()}.mp3`).replace(/[^a-zA-Z0-9._-]/g, "-");
      const blobName = `${FOLDER}/${name}`;
      const body = await readBody(req);
      const block = container.getBlockBlobClient(blobName);
      await block.uploadData(body, { blobHTTPHeaders: { blobContentType: "audio/mpeg" } });
      return res.status(200).json({ name, url: block.url });
    }

    if (req.method === "GET") {
      const files = [];
      for await (const b of container.listBlobsFlat({ prefix: `${FOLDER}/` })) {
        files.push({
          name: b.name.replace(`${FOLDER}/`, ""),
          url: container.getBlockBlobClient(b.name).url,
        });
      }
      return res.status(200).json({ files });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
