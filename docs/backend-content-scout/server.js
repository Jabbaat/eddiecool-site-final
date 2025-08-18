// server.js - De Creatieve Content Scout Agent (met Slimme RSS-Jager)

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser'; // Ons NIEUWE, betrouwbare gereedschap

dotenv.config();

// --- Configuratie ---
const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Fout: Zorg ervoor dat GEMINI_API_KEY is ingesteld in het .env bestand.');
  process.exit(1);
}

// --- Initialiseer de AI en de RSS-Parser ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const parser = new Parser();

// --- De Kernlogica van de Agent ---
async function runContentScout() {
  console.log('--- De Content Scout wordt wakker! ---');
  
  try {
    // --- STAP 2 (De Slimme Jager) ---
    // We jagen nu op een betrouwbare RSS-feed in plaats van een website.
    const targetFeedUrl = 'https://tweakers.net/feeds/nieuws.xml';
    console.log(`1. Op jacht naar nieuwe content via de RSS-feed: ${targetFeedUrl}...`);
    
    // Gebruik de parser om de feed op te halen en te lezen
    const feed = await parser.parseURL(targetFeedUrl);
    
    // Pak de titel van het allernieuwste item in de feed
    const nieuwsteTitel = feed.items[0].title;

    if (!nieuwsteTitel) {
        throw new Error("Kon geen titel vinden in de RSS-feed.");
    }
    
    console.log(`   -> Prooi gevonden: "${nieuwsteTitel}"`);

    // --- STAP 3 (De Analist) ---
    console.log('2. Gevonden content analyseren met AI...');
    const prompt = `Analyseer de volgende nieuwstitel: "${nieuwsteTitel}". Is dit interessant voor een creatieve tech YouTuber die video's maakt over AI en filmmaken? Geef een korte, pakkende samenvatting en een concreet, origineel video-idee.`;
    const result = await model.generateContent(prompt);
    const analyse = result.response.text();
    
    // --- STAP 5 (Het Dashboard) ---
    console.log('3. Resultaat opgeslagen:');
    console.log(analyse);

  } catch (error) {
    console.error('Er ging iets mis tijdens de jacht:', error.message);
  } finally {
    console.log('--- De Content Scout gaat weer slapen. ---');
  }
}

// --- Endpoints (voor later) ---
app.get('/get-latest-ideas', (req, res) => {
  res.json({ message: "Hier komen binnenkort de ideeën van de agent!" });
});

// --- Start de Server ---
app.listen(port, () => {
  console.log(`Content Scout server draait op http://localhost:${port}`);
  runContentScout();
});

