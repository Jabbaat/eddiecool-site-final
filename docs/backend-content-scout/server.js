// server.js - De Creatieve Content Scout Agent

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
const allowedOrigins = ['https://eddiecool.nl', 'http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || new RegExp(`^https?:\/\/.*\.eddiecool\.nl$`).test(origin)) {
      return callback(null, true);
    }
    if (new RegExp(`^https?:\/\/.*\.onrender\.com$`).test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Niet toegestaan door CORS'));
  },
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Geheugen van de agent ---
let laatsteAnalyse = "De scout is op zijn eerste jacht. Kom straks terug voor de buit!";

if (!GEMINI_API_KEY) {
  console.error('Fout: Zorg ervoor dat GEMINI_API_KEY is ingesteld in het .env bestand.');
  process.exit(1);
}

// --- Initialiseer AI en RSS-parser ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// ✅ FIX: correcte modelnaam, zonder "-latest"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const parser = new Parser();

// --- Kernlogica ---
async function runContentScout() {
  console.log(`[${new Date().toLocaleString()}] --- De Content Scout wordt wakker! ---`);
  
  try {
    const targetFeedUrl = 'https://feeds.nos.nl/nosnieuwsalgemeen';
    console.log(`1. RSS-feed ophalen: ${targetFeedUrl}...`);
    
    const response = await axios.get(targetFeedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 15000
    });

    const feedXml = response.data;
    const feed = await parser.parseString(feedXml);

    if (!feed || !feed.items || feed.items.length === 0) {
      throw new Error("Geen items gevonden in de RSS-feed.");
    }
    
    const nieuwsteTitel = feed.items[0].title;
    console.log(`   -> Prooi gevonden: "${nieuwsteTitel}"`);

    console.log('2. Analyseren met Gemini...');
    const prompt = `Analyseer de volgende nieuwstitel: "${nieuwsteTitel}". 
Is dit interessant voor een creatieve tech YouTuber die video's maakt over AI en filmmaken? 
Geef een korte, pakkende samenvatting en een concreet, origineel video-idee. 
Formatteer je antwoord in simpele HTML, gebruik <h3> voor titels en <p> voor tekst.`;
    
    const result = await model.generateContent(prompt);
    const analyse = result.response.text();
    
    laatsteAnalyse = analyse; 
    console.log('3. Resultaat opgeslagen.');
  } catch (error) {
    console.error('Er ging iets mis tijdens de jacht:', error);
    laatsteAnalyse = `<p>De scout stuitte op een probleem tijdens de jacht. Probeer het later opnieuw.</p>
                      <p><small>Fout: ${error.message}</small></p>`;
  } finally {
    console.log(`[${new Date().toLocaleString()}] --- De Content Scout gaat weer slapen. ---`);
  }
}

// --- Endpoints ---
app.get('/get-latest-ideas', (req, res) => {
  res.json({ idea: laatsteAnalyse });
});

// --- Start server ---
app.listen(port, () => {




