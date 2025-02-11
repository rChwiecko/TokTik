import { pipeline } from "@xenova/transformers";

// Load embedding model
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

// Function to get embeddings for a sentence
async function getEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for embedding");
  }

  const embedding = await embedder(text, { pooling: "mean", normalize: true });

  // Convert Float32Array to a regular JavaScript array
  const embeddingArray = Array.from(embedding.data);

  return embeddingArray;
}

export default getEmbedding;
