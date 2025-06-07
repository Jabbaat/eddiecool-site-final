// server.js
// VERSIE: Pad C V2 - Willekeurige prachtige afbeeldingen via Unsplash API

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

const app = express();

const corsOptions = {
  origin: 'https://eddiecool.nl',
  methods: 'POST',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Haal beide API-sleutels op uit de omgevingsvariabelen
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!GENERATIVE_API_KEY || !UNSPLASH_ACCESS_KEY) {
  console.error('Fout: Zorg ervoor dat GENERATIVE_API_KEY en UNSPLASH_ACCESS_KEY zijn ingesteld.');
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

    // Stap 2: *** DE WIJZIGING *** Haal nu een WILLEKEURIGE foto op van Unsplash
    let imageUrl = `https://placehold.co/600x400/1a1a2e/f0f0f0?text=Geen+passende+foto+gevonden&font=inter`; // Fallback
    
    try {
      const query = `technology,abstract,futuristic,nature`; // Zoek naar foto's met deze thema's
      const encodedQuery = encodeURIComponent(query);
      
      // We gebruiken nu de /photos/random endpoint. Dit is de sleutel tot de oplossing.
      const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodedQuery}&orientation=landscape`;

      const unsplashResponse = await fetch(unsplashUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      const unsplashData = await unsplashResponse.json();

      // De data structuur van de 'random' endpoint is iets anders
      if (unsplashData && unsplashData.urls && unsplashData.urls.regular) {
        imageUrl = unsplashData.urls.regular;
        console.log('Willekeurige Unsplash foto gevonden:', imageUrl);
      } else {
        console.log('Kon geen willekeurige foto van Unsplash ontvangen.');
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server (Random Unsplash Versie) luistert op poort ${port}`);
});