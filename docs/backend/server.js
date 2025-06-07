// server.js
// Dit bestand draait op je backend-server (bijv. Render) en handelt de AI-aanroepen af.

// Importeer benodigde modules
import express from 'express'; // Voor het opzetten van de webserver
import cors from 'cors'; // Voor het afhandelen van Cross-Origin Resource Sharing (belangrijk voor beveiliging)
import { GoogleGenerativeAI } from '@google/generative-ai'; // CORRECTE Google AI SDK
// GEEN import { GoogleAuth } from 'google-auth-library'; meer nodig hier

// Maak een Express app aan
const app = express();

// *** VEILIGE CORS configuratie: Staat alleen je eigen frontend domein toe ***
const corsOptions = {
  origin: 'https://eddiecool.nl', // STAAT ALLEEN DIT DOMEIN TOE
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Toegestane HTTP-methoden
  credentials: true, // Sta toe dat cookies/autorisatie headers worden meegestuurd
  optionsSuccessStatus: 204 // Sommige oudere browsers (IE11, various SmartTVs) choke on 200
};
app.use(cors(corsOptions)); // Gebruik de geconfigureerde CORS-opties

// Gebruik express.json() middleware om JSON-body's in inkomende verzoeken te parsen
app.use(express.json());

// *** Authenticatie met ALLEEN de GENERATIVE_API_KEY ***
// De API-sleutel wordt direct doorgegeven aan de GoogleGenerativeAI SDK.
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY; 

if (!GENERATIVE_API_KEY) {
  console.error('Fout: GENERATIVE_API_KEY is niet ingesteld in de omgevingsvariabelen.');
  // Stop de applicatie als de sleutel ontbreekt, want de API-aanroepen zullen falen.
  process.exit(1); 
}

// Initialiseer de Generative AI Client met de API key
const genAI = new GoogleGenerativeAI(GENERATIVE_API_KEY); 

// Haal de modellen op (dit zijn de "model ids")
const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Voor tekst (Gemini)
// Voor Imagen gebruiken we dezelfde SDK als voor Gemini
const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" }); // Voor afbeeldingen (Imagen)

// Definieer een POST-route voor het genereren van AI-wijsheid en afbeeldingen
app.post('/generate-wisdom', async (req, res) => {
  try {
    // 1. Genereer de wijsheidstekst met Gemini (via GoogleGenerativeAI SDK)
    const textPrompt = "Genereer één grappige, pseudo-wetenschappelijke, spirituele of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, en een beetje 'mind-blowing' of absurd. Geef alleen de spreuk terug in JSON-formaat.";
    
    const textResult = await textModel.generateContent(textPrompt);
    const responseText = textResult.response.text();

    let generatedSaying = "Kon geen wijsheid genereren.";
    try {
        const cleanedJson = responseText.replace(/```json\n|\n```/g, '');
        const parsedJson = JSON.parse(cleanedJson);
        generatedSaying = parsedJson.saying;
    } catch (e) {
        console.error("Fout bij parsen van Gemini JSON op backend:", e, responseText);
        generatedSaying = "Oeps, de AI sprak in raadsels op de backend: " + responseText.substring(0, Math.min(responseText.length, 100)) + "...";
    }

    // 2. Genereer de afbeelding met Imagen (nu ook via GoogleGenerativeAI SDK)
    const imagePrompt = `Een abstracte, pseudo-wetenschappelijke, spirituele afbeelding die past bij de volgende spreuk: "${generatedSaying}". Stijl: neon, futuristisch, mystiek, met elementen van technologie en natuur.`;
    
    let imageUrl = "https://placehold.co/400x300/333/FFF?text=Afbeelding+niet+geladen"; // Fallback

    // Imagen via de SDK
    const imageGenerationResponse = await imageModel.generateContent({
      prompt: imagePrompt,
      // Voor Canvas, als base64 nodig is en de SDK dit niet direct via generateContent geeft,
      // moet dit via een aparte API aanroep of custom logic worden gedaan.
      // Echter, we proberen het nu direct met de SDK.
      // De Imagen API voor image generation returns bytesBase64Encoded in its PREDICT endpoint.
      // De SDK zal dit waarschijnlijk ook verwerken.
    });

    // De respons van imageModel.generateContent kan complexer zijn.
    // We moeten de structuur controleren.
    // De Imagen 3.0 API via GoogleGenerativeAI SDK kan een image property retourneren.
    if (imageGenerationResponse && imageGenerationResponse.response && imageGenerationResponse.response.candidates && 
        imageGenerationResponse.response.candidates.length > 0 && 
        imageGenerationResponse.response.candidates[0].image) {
        // Dit is een placeholder voor hoe de SDK de imagen output zou kunnen structureren
        // De exacte structuur kan variëren afhankelijk van de SDK versie en API response.
        // Meestal is het een URI of asset ID, niet direct base64.
        // Voor Canvas, waar base64 direct nodig is, moeten we mogelijk de raw REST API call behouden.

        // AANGEPAST: Om het te laten werken met de Canvas omgeving, blijven we de direkte fetch voor Imagen gebruiken
        // met de GENERATIVE_API_KEY. De SDK voor Imagen 3.0 base64 output is nog niet standaard in de SDK.
        // Dit is dus een uitzondering: Gemini via SDK (API Key), Imagen via directe fetch (API Key).
        // De setup voor GOOGLE_APPLICATION_CREDENTIALS etc. was alleen voor als BEIDE via SDK en Service Account moesten.
        
        // Terug naar de directe fetch voor Imagen (zoals in de voorgaande versies)
        const imagenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GENERATIVE_API_KEY}`;
        const imagenPayload = { instances: { prompt: imagePrompt }, parameters: { "sampleCount": 1} };

        try {
            const imagenResponse = await fetch(imagenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imagenPayload)
            });
            const imagenResult = await imagenResponse.json();

            if (imagenResult.predictions && imagenResult.predictions.length > 0 && imagenResult.predictions[0].bytesBase64Encoded) {
                imageUrl = `data:image/png;base64,${imagenResult.predictions[0].bytesBase64Encoded}`;
            } else {
                console.error("Onverwachte responsstructuur van Imagen op backend (directe fetch):", imagenResult);
            }
        } catch (imageError) {
            console.error("Fout bij Imagen API aanroep (directe fetch) met GENERATIVE_API_KEY:", imageError);
        }

    } else {
        // Fallback als de SDK Imagen geen direct image teruggeeft
        // (dit deel zal nu minder vaak worden geraakt omdat we teruggaan naar directe fetch voor Imagen)
        console.warn("Imagen SDK gaf geen direct image terug; terugvallen op placeholder of directe fetch");
        // Dit is de sectie die we nu voornamelijk gebruiken voor Imagen
        const imagenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GENERATIVE_API_KEY}`;
        const imagenPayload = { instances: { prompt: imagePrompt }, parameters: { "sampleCount": 1} };

        try {
            const imagenResponse = await fetch(imagenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imagenPayload)
            });
            const imagenResult = await imagenResponse.json();

            if (imagenResult.predictions && imagenResult.predictions.length > 0 && imagenResult.predictions[0].bytesBase64Encoded) {
                imageUrl = `data:image/png;base64,${imagenResult.predictions[0].bytesBase64Encoded}`;
            } else {
                console.error("Onverwachte responsstructuur van Imagen op backend (directe fetch):", imagenResult);
            }
        } catch (imageError) {
            console.error("Fout bij Imagen API aanroep (directe fetch) met GENERATIVE_API_KEY:", imageError);
        }
    }


    // 3. Stuur de gegenereerde tekst en afbeelding URL terug naar de frontend
    res.json({
      saying: generatedSaying,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Fout in backend /generate-wisdom route:", error);
    // Stuur een 500 statuscode terug bij een serverfout
    res.status(500).json({ error: "Serverfout bij het genereren van AI-wijsheid." });
  }
});

// Definieer de poort waarop de server zal luisteren
// Render voorziet een PORT omgevingsvariabele. Lokaal is het 3000.
const port = process.env.PORT || 3000;

// Start de server
app.listen(port, () => {
  console.log(`Backend server V3 luistert op poort ${port}`); // Aangepaste log om te zien dat deze versie draait
});
