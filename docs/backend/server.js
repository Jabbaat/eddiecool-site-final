// server.js
// Dit bestand draait op je backend-server (bijv. Render) en handelt de AI-aanroepen af.
// VERSIE: Pad B - Gratis afbeeldingen via Placehold.co

// Importeer benodigde modules
import express from 'express'; // Voor het opzetten van de webserver
import cors from 'cors'; // Voor het afhandelen van Cross-Origin Resource Sharing
import { GoogleGenerativeAI } from '@google/generative-ai'; // Google AI SDK

// Maak een Express app aan
const app = express();

// *** VEILIGE CORS configuratie: Staat alleen je eigen frontend domein toe ***
const corsOptions = {
  origin: 'https://eddiecool.nl', // STAAT ALLEEN DIT DOMEIN TOE
  methods: 'POST',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); // Gebruik de geconfigureerde CORS-opties

// Gebruik express.json() middleware om JSON-body's in inkomende verzoeken te parsen
app.use(express.json());

// Haal de API-sleutel op uit de omgevingsvariabelen op Render
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY; 

if (!GENERATIVE_API_KEY) {
  console.error('Fout: GENERATIVE_API_KEY is niet ingesteld in de omgevingsvariabelen.');
  process.exit(1); 
}

// Initialiseer de Generative AI Client met de API key
const genAI = new GoogleGenerativeAI(GENERATIVE_API_KEY); 

// Haal het text model op. We hebben het image model niet meer nodig in deze versie.
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Gebruik een modern, snel model

// Definieer de POST-route voor het genereren van de wijsheid
app.post('/generate-wisdom', async (req, res) => {
  try {
    // 1. Genereer de wijsheidstekst met Gemini
    const textPrompt = "Genereer één grappige, pseudo-wetenschappelijke of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, maximaal 10 woorden. Geef alleen de spreuk terug in een JSON-object met de sleutel 'saying'.";
    
    const textResult = await textModel.generateContent(textPrompt);
    const responseText = textResult.response.text();

    let generatedSaying = "Kon geen wijsheid genereren.";
    try {
      // Probeer de JSON uit de tekst van de AI te halen
      const cleanedJson = responseText.replace(/```json\n|\n```/g, '').trim();
      const parsedJson = JSON.parse(cleanedJson);
      generatedSaying = parsedJson.saying;
    } catch (e) {
      console.error("Fout bij parsen van Gemini JSON:", e, responseText);
      // Als het parsen mislukt, gebruiken we de ruwe tekst als fallback
      generatedSaying = responseText;
    }

    // 2. Genereer een dynamische placeholder afbeelding met de wijsheid erin
    // Dit vervangt de aanroep naar de betaalde Imagen API.
    const encodedWisdom = encodeURIComponent(generatedSaying);
    const imageUrl = `https://placehold.co/600x400/1a1a2e/f0f0f0?text=${encodedWisdom}&font=inter`;

    console.log(`Afbeelding-URL gegenereerd voor wijsheid: "${generatedSaying}"`);

    // 3. Stuur de gegenereerde tekst en de nieuwe afbeelding URL terug naar de frontend
    res.json({
      saying: "AI: " + generatedSaying,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Fout in backend /generate-wisdom route:", error);
    // Stuur een 500 statuscode terug bij een algemene serverfout
    res.status(500).json({ error: "Serverfout bij het genereren van AI-wijsheid." });
  }
});

// Definieer de poort waarop de server zal luisteren
const port = process.env.PORT || 3000;

// Start de server
app.listen(port, () => {
  console.log(`Backend server (Gratis Afbeeldingen Versie) luistert op poort ${port}`);
});