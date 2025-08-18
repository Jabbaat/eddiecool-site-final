// server.js - De Creatieve Content Scout Agent (met Jager-functie)

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'; // Onze 'postbode' om webpagina's op te halen
import * as cheerio from 'cheerio'; // Ons 'vergrootglas' om de HTML te lezen

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
async function runContentScout() {
  console.log('--- De Content Scout wordt wakker! ---');
  
  try {
    // --- STAP 2 (De Jager) ---
    // We jagen op de voorpagina van een tech-website.
    const targetUrl = 'https://tweakers.net/'; // De website waarop we jagen
    console.log(`1. Op jacht naar nieuwe content op ${targetUrl}...`);
    
    // Gebruik Axios om de HTML van de pagina op te halen
    const response = await axios.get(targetUrl);
    const html = response.data;
    
    // Gebruik Cheerio om de titel van het eerste grote artikel te vinden
    const $ = cheerio.load(html);
    // AANGEPAST: We zoeken nu naar de eerste link in een H2-tag binnen een <article>, dit is specifieker.
    const eersteTitel = $('article h2 a').first().text().trim(); 

    if (!eersteTitel) {
        throw new Error("Kon geen titel vinden op de website. De structuur is mogelijk veranderd.");
    }
    
    console.log(`   -> Prooi gevonden: "${eersteTitel}"`);

    // --- STAP 3 (De Analist) ---
    console.log('2. Gevonden content analyseren met AI...');
    const prompt = `Analyseer de volgende nieuwstitel: "${eersteTitel}". Is dit interessant voor een creatieve tech YouTuber die video's maakt over AI en filmmaken? Geef een korte, pakkende samenvatting en een concreet, origineel video-idee.`;
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

