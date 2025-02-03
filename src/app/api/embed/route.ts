    import { NextResponse } from "next/server";
    import { pipeline } from "@xenova/transformers";

    let embedder: any = null;

    export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        if (!text) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        if (!embedder) {
        embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        }

        const embedding = await embedder(text, { pooling: "mean", normalize: true });

        return NextResponse.json({ embedding: embedding.data });
    } catch (error) {
        console.error("Error generating embedding:", error);
        return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }
    }

