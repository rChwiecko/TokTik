// pages/api/describe-video.js

import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';

const client = new VideoIntelligenceServiceClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body' });
  }

  try {
    // Set up the request for label detection.
    const request = {
      inputUri: videoUrl,
      features: ['LABEL_DETECTION'],
      // Optionally, you can set a segment or shot detection, etc.
    };

    // Start the asynchronous video annotation request.
    const [operation] = await client.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    
    // Wait for the operation to complete.
    const [operationResult] = await operation.promise();

    // Extract the first (and only) result.
    const annotations = operationResult.annotationResults[0];

    // Get label annotations from the result.
    const labels = annotations.labelAnnotations || [];

    // Create a description by combining the labels (you can customize this logic)
    const description = labels
      .map((label) => label.entity.description)
      .filter((desc) => desc)  // Filter out any empty values
      .join(', ');

    return res.status(200).json({ description });
  } catch (error) {
    console.error('Error processing video:', error);
    return res.status(500).json({ error: error.message });
  }
}
