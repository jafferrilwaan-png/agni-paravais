import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // set maximum execution duration on Vercel Pro if available (otherwise hobby defaults to 10s/15s)
};

export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const { image, prompt } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    console.log("Vercel Serverless Function: initiating video generation via Veo...");

    // Generate video using Veo 3.1
    let operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: prompt || "A cinematic short animation revealing the lore of the mystic phoenix rising from the ancient temple, dramatic lighting, magical aura, soaring into the sky.",
      image: {
         imageBytes: base64Data,
      },
      config: {
        aspectRatio: "16:9",
        personGeneration: "DONT_ALLOW"
      }
    });

    console.log("Vercel Serverless Function: polling operation status...");
    let attempts = 0;
    // On Vercel hobby tier, functions timeout after 10-15 seconds.
    // We poll rapidly or return immediately if it's taking too long.
    while (!operation.done && attempts < 4) {
       await new Promise(resolve => setTimeout(resolve, 3000));
       operation = await ai.operations.getVideosOperation({ operation: operation });
       attempts++;
    }

    if (!operation.done) {
      // If still processing, return the URI if available or let them know it's queued.
      return res.status(202).json({ 
        status: "processing", 
        message: "Video generation is in progress. Please check again shortly."
      });
    }

    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (generatedVideo && generatedVideo.video) {
      if (generatedVideo.video.videoBytes) {
         return res.json({ videoBase64: generatedVideo.video.videoBytes, mimeType: generatedVideo.video.mimeType || "video/mp4" });
      } else if (generatedVideo.video.uri) {
         return res.json({ videoUri: generatedVideo.video.uri });
      } else {
         return res.status(500).json({ error: "No video data returned from Veo." });
      }
    } else {
       return res.status(500).json({ error: "Failed to generate video" });
    }
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
