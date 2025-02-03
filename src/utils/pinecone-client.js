import { Pinecone } from "@pinecone-database/pinecone"; // Correct import
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file with custom path
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing Pinecone API key");
}

if (!process.env.PINECONE_ENVIRONMENT) {
  throw new Error("Missing Pinecone environment");
}

if (!process.env.PINECONE_INDEX) {
  throw new Error("Missing Pinecone index name");
}

// Create Pinecone instance
const client = new Pinecone();

async function initPinecone() {
  try {
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    return client;
  } catch (error) {
    console.error("Error initializing Pinecone client:", error);
    throw error;
  }
}

// Return the index if initialized, otherwise initialize it
async function getPineconeIndex() {
  const pinecone = await initPinecone();
  return pinecone.index(process.env.PINECONE_INDEX);
}

export { getPineconeIndex };
