// server.js - De Creatieve Content Scout Agent (De Ultieme Test)

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import cron from 'node-cron';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

// --- Configuratie ---
const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Middleware ---
const corsOptions = {
  origin: ['https://eddiecool.nl', 'http://localhost:3000'],
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
app.use(express.json());


// --- HET GEHEUGEN VAN DE AGENT ---
let laatsteAnalyse = "De scout is op zijn eerste jacht. Kom straks terug voor de buit!";

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
  console.log(`[${new Date().toLocaleString()}] --- De Content Scout wordt wakker! ---`);
  
  try {
    // AANGEPAST: We jagen nu op de NOS-feed als de ultieme test.
    const targetFeedUrl = 'https://feeds.nos.nl/nosnieuwsalgemeen';
    console.log(`1. Op jacht naar nieuwe content via de RSS-feed: ${targetFeedUrl}...`);
    
    const response = await axios.get(targetFeedUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
    });

    const feedXml = response.data;
    const feed = await parser.parseString(feedXml);

    if (!feed || !feed.items || feed.items.length === 0) {
        throw new Error("Kon geen items vinden in de RSS-feed. De feed is mogelijk leeg of onbereikbaar.");
    }
    
    const nieuwsteTitel = feed.items[0].title;
    console.log(`   -> Prooi gevonden: "${nieuwsteTitel}"`);

    console.log('2. Gevonden content analyseren met AI...');
    const prompt = `Analyseer de volgende nieuwstitel: "${nieuwsteTitel}". Is dit interessant voor een creatieve tech YouTuber die video's maakt over AI en filmmaken? Geef een korte, pakkende samenvatting en een concreet, origineel video-idee. Formatteer je antwoord in simpele HTML, gebruik <h3> voor titels en <p> voor tekst.`;
    const result = await model.generateContent(prompt);
    const analyse = result.response.text();
    
    laatsteAnalyse = analyse; 
    console.log('3. Resultaat opgeslagen in het geheugen.');

  } catch (error) {
    console.error('Er ging iets mis tijdens de jacht:', error.message);
    laatsteAnalyse = `<p>De scout stuitte op een probleem tijdens de jacht. Probeer het later opnieuw.</p><p><small>Fout: ${error.message}</small></p>`;
  } finally {
    console.log(`[${new Date().toLocaleString()}] --- De Content Scout gaat weer slapen. ---`);
  }
}

// --- Endpoints ---
app.get('/get-latest-ideas', (req, res) => {
  res.json({ idea: laatsteAnalyse });
});

// --- Start de Server ---
app.listen(port, () => {
  console.log(`Content Scout server draait op http://localhost:${port}`);
  
  cron.schedule('0 9 * * *', () => {
    console.log('Het is 9:00 uur, tijd voor de dagelijkse jacht!');
    runContentScout();
  }, {
    scheduled: true,
    timezone: "Europe/Amsterdam"
  });

  console.log('De agent is ingepland en wacht op het juiste moment om te jagen...');
  
  runContentScout();
});



