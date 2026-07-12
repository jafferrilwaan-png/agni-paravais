import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for Veo video generation
  app.post("/api/generate-video", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const { image, prompt } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      // Initialize SDK
      const ai = new GoogleGenAI({ apiKey });

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      console.log("Image received, starting video generation...");

      // Generate video using Veo 3.1
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || "A cinematic short animation revealing the lore of the mystic phoenix rising from the ancient temple, dramatic lighting, magical aura, soaring into the sky.",
        image: {
           imageBytes: base64Data,
        },
        config: {
          aspectRatio: '16:9',
          personGeneration: 'DONT_ALLOW'
        }
      });

      console.log("Video generation started, polling for completion...");
      let attempts = 0;
      while (!operation.done && attempts < 60) {
         await new Promise(resolve => setTimeout(resolve, 5000));
         operation = await ai.operations.getVideosOperation({ operation: operation });
         attempts++;
         console.log(`Polling attempt ${attempts}...`);
      }

      if (!operation.done) {
        throw new Error("Video generation timed out.");
      }

      const generatedVideo = operation.response?.generatedVideos?.[0];
      if (generatedVideo && generatedVideo.video) {
        // Fallback to URI if videoBytes is not present (sometimes happens with big videos)
        if (generatedVideo.video.videoBytes) {
           res.json({ videoBase64: generatedVideo.video.videoBytes, mimeType: generatedVideo.video.mimeType || 'video/mp4' });
        } else if (generatedVideo.video.uri) {
           res.json({ videoUri: generatedVideo.video.uri });
        } else {
           res.status(500).json({ error: "No video data returned." });
        }
      } else {
         res.status(500).json({ error: "Failed to generate video" });
      }
      
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
