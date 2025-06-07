// server.js
// VERSIE: Pad C - Prachtige afbeeldingen via Unsplash API

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'; // fetch is al geïnstalleerd, nu gebruiken we het ook voor Unsplash

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
    // Stap 1: Genereer de wijsheidstekst (zoals voorheen)
    const textPrompt = "Genereer één grappige, pseudo-wetenschappelijke of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, maximaal 10 woorden. Geef alleen de spreuk terug in een JSON-object met de sleutel 'saying'.";
    
    const textResult = await textModel.generateContent(textPrompt);
    const responseText = textResult.response.text();
    let generatedSaying = "De AI is even een blokje om.";

    try {
      const cleanedJson = responseText.replace(/```json\n|\n```/g, '').trim();
      const parsedJson = JSON.parse(cleanedJson);
      generatedSaying = parsedJson.saying;
    } catch (e) {
      generatedSaying = responseText.trim();
    }

    // Stap 2: Zoek een passende afbeelding op Unsplash
    let imageUrl = `https://placehold.co/600x400/1a1a2e/f0f0f0?text=Geen+passende+foto+gevonden&font=inter`; // Fallback
    
    try {
      // We maken een zoekterm met een paar vaste woorden en de nieuwe wijsheid
      const query = `technology abstract futuristic ${generatedSaying}`;
      const encodedQuery = encodeURIComponent(query);
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=1&orientation=landscape`;

      const unsplashResponse = await fetch(unsplashUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      const unsplashData = await unsplashResponse.json();

      if (unsplashData.results && unsplashData.results.length > 0) {
        imageUrl = unsplashData.results[0].urls.regular; // Pak de URL van de gevonden foto
        console.log('Unsplash foto gevonden:', imageUrl);
      } else {
        console.log('Geen resultaten van Unsplash voor zoekterm:', query);
      }
    } catch (unsplashError) {
      console.error('Fout bij het ophalen van Unsplash foto:', unsplashError);
    }

    // Stap 3: Stuur alles terug naar de frontend
    res.json({
      saying: generatedSaying, // De 'dubbele AI:' fix is hier al toegepast
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Fout in /generate-wisdom route:", error);
    res.status(500).json({ error: "Serverfout bij het genereren van wijsheid." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server (Unsplash Versie) luistert op poort ${port}`);
});