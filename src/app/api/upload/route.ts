// src/app/api/upload/route.ts

import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getTokTikIndex } from "../../../utils/pinecone-client";
import getEmbedding from "@/utils/embedding";

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file with custom path (if needed)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Configure AWS S3
const s3 = new AWS.S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Define the shape of a video item.
interface Video {
  id: string; // Unique identifier for the video.
  vector: any; // For now, storing the embedding (derived from description).
  metadata?: {
    // Additional metadata.
    [key: string]: any;
  };
}

/**
 * Uses AWS Rekognition Video to analyze a video stored in S3 and returns a description
 * built from detected labels.
 *
 * This function starts a label detection job and polls for its completion.
 */
async function getVideoDescriptionRekognition(bucket: string, key: string): Promise<string> {
  const rekognition = new AWS.Rekognition({ region: "us-east-1" });
  
  // Start the label detection job.
  const startParams = {
    Video: { S3Object: { Bucket: bucket, Name: key } },
    MinConfidence: 50,
  };
  const startResponse = await rekognition.startLabelDetection(startParams).promise();
  const jobId = startResponse.JobId;
  console.log("Started label detection with JobId:", jobId);

  // Poll for job completion.
  let jobStatus = "";
  const maxTries = 20;
  let tries = 0;
  let labelDetections: any[] = [];

  while (tries < maxTries) {
    const getParams = { JobId: jobId };
    const getResponse = await rekognition.getLabelDetection(getParams).promise();
    jobStatus = getResponse.JobStatus;
    if (jobStatus === "SUCCEEDED") {
      labelDetections = getResponse.LabelDetections || [];
      break;
    } else if (jobStatus === "FAILED") {
      throw new Error("Label detection failed.");
    }
    console.log(`Job status: ${jobStatus}. Waiting 5 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
    tries++;
  }
  if (jobStatus !== "SUCCEEDED") {
    throw new Error("Label detection timed out.");
  }

  // Extract label names from the detection results.
  const labels = labelDetections
    .map(item => item.Label && item.Label.Name)
    .filter((name: any) => name);
  const description = labels.join(", ");
  console.log("Detected labels:", description);
  return description || "No description available";
}

/**
 * Upserts a video into Pinecone with the S3 URL automatically added to its metadata.
 * The video “vector” field is used here to store the embedding produced from the description.
 */
export async function upsertVideoWithS3Url(video: Video, s3Url: string) {
  try {
    // Initialize the Pinecone index.
    const index = await getTokTikIndex();

    // Merge the S3 URL into the video's metadata.
    const updatedMetadata = {
      ...video.metadata,
      s3Url,
    };

    // Build the vector object in the shape the docs require.
    const vectorObject = {
      id: video.id,
      values: video.vector, // Here, video.vector holds the embedding.
      metadata: updatedMetadata,
    };

    // Execute the upsert operation by passing an array of vector objects.
    const result = await index.upsert([vectorObject]);
    console.log("Upsert result:", result);
    return result;
  } catch (error) {
    console.error("Error upserting video:", error);
    throw error;
  }
}

/**
 * POST /api/upload
 * Expects a JSON body with:
 *   - fileName: string
 *   - contentType: string
 *
 * It returns a presigned S3 URL for uploading the video, then:
 *  1. Uses AWS Rekognition to generate a description (by analyzing the uploaded video in S3).
 *  2. Converts that description into an embedding via getEmbedding().
 *  3. Upserts the video metadata (with an auto-generated ID) into Pinecone.
 * The description embedding is saved in the vector field for now.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    // Validate required fields.
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: fileName or contentType" },
        { status: 400 }
      );
    }

    // Create a unique key for the file.
    const fileKey = `uploads/videos/${Date.now()}-${fileName}`;

    // Define S3 parameters.
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: 60, // URL expiry in seconds.
      ContentType: contentType,
    };

    // Generate a presigned URL for uploading to S3.
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Use AWS Rekognition to get a description from the S3 video.
    // const description = await getVideoDescriptionRekognition(BUCKET_NAME, fileKey);

    // Optionally, convert the description into an embedding (e.g., using a text embedding model).
    const encodedDescription = await getEmbedding("A football video of an eagle being released and flying around at a football game");

    // Generate a video ID.
    const videoId = `video-${Date.now()}`;

    // Build the video object.
    const video: Video = {
      id: videoId,
      vector: encodedDescription, // Save the embedding in the vector field.
      metadata: {
        originalFileName: fileName,
        contentType,
      },
    };

    // Upsert the video data into Pinecone.
    const upsertResult = await upsertVideoWithS3Url(video, s3Url);

    // Return the presigned URL, the final S3 URL, and the upsert result.
    return NextResponse.json({ uploadUrl, s3Url, upsertResult });
  } catch (error) {
    console.error("Error in POST /api/upload:", error);
    return NextResponse.json(
      { error: "Error generating presigned URL or upserting video" },
      { status: 500 }
    );
  }
}
