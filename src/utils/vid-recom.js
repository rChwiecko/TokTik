import { getPineconeIndex } from './pinecone-client';

async function getUniqueVideoRecommendations({
    userPreferenceVector,
    excludeVideoIds = [],
    pageSize = 5
}) {
    const index = await getPineconeIndex();
    const bufferMultiplier = 3;
    const querySize = pageSize * bufferMultiplier;

    try {
        const queryResponse = await index.query({
            vector: userPreferenceVector,
            topK: querySize,
            includeMetadata: true,
            filter: {
                id: {
                    '$nin': excludeVideoIds
                },
            }
        });

        // Process the results to get unique videos
        const uniqueVideos = [];
        const seenUrls = new Set();

        for (const match of queryResponse.matches) {
            const videoUrl = match.metadata.videoUrl;
            
            if (seenUrls.has(videoUrl) || uniqueVideos.length >= pageSize) {
                continue;
            }

            uniqueVideos.push({
                id: match.id,
                score: match.score,
                ...match.metadata,
                similarityScore: match.score
            });

            seenUrls.add(videoUrl);
        }

        return uniqueVideos.slice(0, pageSize);
    } catch (error) {
        console.error('Error fetching video recommendations:', error);
        throw error;
    }
}

export default getUniqueVideoRecommendations;