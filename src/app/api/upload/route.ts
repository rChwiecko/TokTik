// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {getPineconeIndex} from "../../../utils/pinecone-client"

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file with custom path
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Configure AWS with your credentials and region
const s3 = new AWS.S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


// Define the shape of a video item.
interface Video {
  id: string;             // Unique identifier for the video.
  vector: number[];       // The numeric vector representation of the video (embedding).
  metadata?: {            // Additional metadata for the video.
    [key: string]: any;
  };
}

/**
 * Upserts a video into your Pinecone index, automatically adding the S3 URL to the metadata.
 * 
 * @param video - The video data containing an id, a vector (embedding), and optional metadata.
 * @param s3Url - The S3 URL where the video is stored.
 * @returns The result of the upsert operation.
 */
export async function upsertVideoWithS3Url(video: Video, s3Url: string) {
  try {
    // Get the Pinecone index instance.
    const index = await getPineconeIndex();

    // Merge the s3Url into the metadata object.
    const updatedMetadata = {
      ...video.metadata,
      s3Url, // Adds or overrides any existing s3Url field in the metadata.
    };

    // Build the upsert request.
    const upsertRequest = {
      vectors: [
        {
          id: video.id,
          values: video.vector,
          metadata: updatedMetadata,
        },
      ],
    };

    // Perform the upsert operation.
    const result = await index.upsert({ upsertRequest });
    console.log("Upsert result:", result);
    return result;
  } catch (error) {
    console.error("Error upserting video:", error);
    throw error;
  }
}


// Set your S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType" },
        { status: 400 }
      );
    }

    // Create a unique key for the file
    const fileKey = `uploads/videos/${Date.now()}-${fileName}`;

    // Set S3 parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: 60, // URL expiry in seconds
      ContentType: contentType,
    };

    // Generate a presigned URL for PUT requests
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    // Construct the final S3 URL (adjust based on your bucket configuration)
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    
    return NextResponse.json({ uploadUrl, s3Url });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Error generating presigned URL" },
      { status: 500 }
    );
  }
}
