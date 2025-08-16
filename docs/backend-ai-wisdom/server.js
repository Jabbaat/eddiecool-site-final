// server.js voor AI Wijsheid
// VERSIE: Pad C V2 - Willekeurige prachtige afbeeldingen via Unsplash API

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Laad de .env variabelen

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Haal beide API-sleutels op uit de omgevingsvariabelen
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!GENERATIVE_API_KEY || !UNSPLASH_ACCESS_KEY) {
  console.error('Fout: Zorg ervoor dat GENERATIVE_API_KEY en UNSPLASH_ACCESS_KEY zijn ingesteld in het .env bestand.');
  process.exit(1); 
}

// Initialiseer de Google AI Client
const genAI = new GoogleGenerativeAI(GENERATIVE_API_KEY); 
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/generate-wisdom', async (req, res) => {
  try {
    // Stap 1: Genereer de wijsheidstekst
    const textPrompt = "Genereer één grappige, pseudo-wetenschappelijke of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, maximaal 10 woorden. Geef alleen de spreuk terug in een JSON-object met de sleutel 'saying'.";
    
    const textResult = await textModel.generateContent(textPrompt);
    const responseText = textResult.response.text();
    let generatedSaying = "De AI is even pauze aan het houden.";

    try {
      const cleanedJson = responseText.replace(/```json\n|\n```/g, '').trim();
      const parsedJson = JSON.parse(cleanedJson);
      generatedSaying = parsedJson.saying;
    } catch (e) {
      generatedSaying = responseText.trim();
    }

    // Stap 2: Haal een willekeurige foto op van Unsplash
    let imageUrl = `https://placehold.co/600x400/1a1a2e/f0f0f0?text=Geen+passende+foto+gevonden&font=inter`; // Fallback
    
    try {
      const query = `technology,abstract,futuristic,nature`;
      const encodedQuery = encodeURIComponent(query);
      const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodedQuery}&orientation=landscape`;

      const unsplashResponse = await fetch(unsplashUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      const unsplashData = await unsplashResponse.json();

      if (unsplashData && unsplashData.urls && unsplashData.urls.regular) {
        imageUrl = unsplashData.urls.regular;
      }
    } catch (unsplashError) {
      console.error('Fout bij het ophalen van Unsplash foto:', unsplashError);
    }

    // Stap 3: Stuur alles terug naar de frontend
    res.json({
      saying: generatedSaying,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Fout in /generate-wisdom route:", error);
    res.status(500).json({ error: "Serverfout bij het genereren van wijsheid." });
  }
});

app.listen(port, () => {
  console.log(`AI Wijsheid backend draait op poort ${port}`);
});