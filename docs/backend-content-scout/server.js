// server.js - De basis voor de Creatieve Content Scout Agent

// --- Vereisten ---
// 1. Maak een nieuwe map aan, bijv. "backend-content-scout"
// 2. Plaats dit bestand daarin.
// 3. Maak een package.json aan (zie hieronder)
// 4. Maak een .env bestand aan met je GEMINI_API_KEY
// 5. Voer in de terminal `npm install` uit.

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Straks voegen we hier nog een 'planner' (cron) en 'jager' (fetch/axios) aan toe.

dotenv.config();

// --- Configuratie ---
const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Fout: Zorg ervoor dat GEMINI_API_KEY is ingesteld in het .env bestand.');
  process.exit(1);
}

// --- Initialiseer de AI ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- De Kernlogica van de Agent ---
// Deze functie gaan we later vullen met de jacht- en analysecode.
async function runContentScout() {
  console.log('--- De Content Scout wordt wakker! ---');
  
  try {
    // STAP 2 (De Jager) komt hier:
    // We gaan hier een website of YouTube-kanaal uitlezen.
    console.log('1. Op jacht naar nieuwe content...');
    const gevondenContent = "Voorbeeld: Een nieuwe video over AI in film is gevonden!"; // Placeholder

    // STAP 3 (De Analist) komt hier:
    // We sturen de gevonden content naar de Gemini API.
    console.log('2. Gevonden content analyseren met AI...');
    const prompt = `Analyseer de volgende content: "${gevondenContent}". Is dit interessant voor een creatieve tech YouTuber? Geef een korte samenvatting en een concreet video-idee.`;
    const result = await model.generateContent(prompt);
    const analyse = result.response.text();
    
    // STAP 5 (Het Dashboard) komt hier:
    // We slaan het resultaat op zodat de website het kan tonen.
    console.log('3. Resultaat opgeslagen:');
    console.log(analyse);

  } catch (error) {
    console.error('Er ging iets mis tijdens de jacht:', error);
  } finally {
    console.log('--- De Content Scout gaat weer slapen. ---');
  }
}

// --- Endpoints (voor later) ---
// We maken een endpoint zodat je de resultaten op je website kunt zien.
app.get('/get-latest-ideas', (req, res) => {
  // Hier komt de code om de opgeslagen ideeën op te halen.
  res.json({ message: "Hier komen binnenkort de ideeën van de agent!" });
});

// --- Start de Server ---
app.listen(port, () => {
  console.log(`Content Scout server draait op http://localhost:${port}`);
  
  // Test de agent één keer bij het opstarten.
  runContentScout(); 
  
  // STAP 4 (De Planner) komt hier:
  // We gaan de agent hier elke dag automatisch laten draaien.
});

