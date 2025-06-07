// server.js
// Dit bestand draait op je backend-server (bijv. Render) en handelt de AI-aanroepen af.

// Importeer benodigde modules
import express from 'express'; // Voor het opzetten van de webserver
import cors from 'cors'; // Voor het afhandelen van Cross-Origin Resource Sharing (belangrijk voor beveiliging)
import { GoogleGenerativeAI } from '@google/generative-ai'; // CORRECTE NIEUWE BIBLIOTHEEK voor Google AI
import { GoogleAuth } from 'google-auth-library'; // Voor authenticatie met Google APIs

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

// *** Configureer GoogleGenerativeAI met Service Account Authenticatie ***
// De GOOGLE_PROJECT_ID en GOOGLE_APPLICATION_CREDENTIALS
// worden automatisch opgepikt uit de omgevingsvariabelen door de 'google-auth-library'.

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY; // Nodig voor Imagen, als de SDK nog niet optimaal werkt met SA

if (!PROJECT_ID) {
  console.error('Fout: GOOGLE_PROJECT_ID is niet ingesteld in de omgevingsvariabelen.');
  process.exit(1); 
}
if (!GENERATIVE_API_KEY) {
  console.error('Fout: GENERATIVE_API_KEY is niet ingesteld in de omgevingsvariabelen voor Imagen.');
  // We stoppen de applicatie hier niet, maar de Imagen API aanroep zal falen.
}

// Initialiseer de Generative AI Client voor Gemini (tekst)
// De bibliotheek zal GOOGLE_APPLICATION_CREDENTIALS gebruiken voor authenticatie
const genAI = new GoogleGenerativeAI(PROJECT_ID); // Project ID is nodig om het context te geven
const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Voor tekst (Gemini)

// Voor Imagen (afbeeldingen) gaan we terug naar een simpele fetch met de API_KEY
// Dit is een workaround totdat Imagen 3.0 volledig is geïntegreerd met de GenAI SDK
// voor base64 output of als er problemen zijn met Service Account auth voor Imagen via de SDK.
const auth = new GoogleAuth({
    projectId: PROJECT_ID,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'] // Nodig voor Imagen predict via Google Cloud
});

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

    // 2. Genereer de afbeelding met Imagen (via directe REST API met API Key)
    // Omdat de SDK voor Imagen 3.0 in de Canvas omgeving (base64 output) complexer bleek,
    // en de eerdere directe API key aanroep voor Imagen wel werkte, gebruiken we die hier weer.
    const imagePrompt = `Een abstracte, pseudo-wetenschappelijke, spirituele afbeelding die past bij de volgende spreuk: "${generatedSaying}". Stijl: neon, futuristisch, mystiek, met elementen van technologie en natuur.`;
    
    let imageUrl = "https://placehold.co/400x300/333/FFF?text=Afbeelding+niet+geladen"; // Fallback

    if (GENERATIVE_API_KEY) { // Alleen proberen als de API key aanwezig is
        const imagePayload = { instances: { prompt: imagePrompt }, parameters: { "sampleCount": 1} };
        const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GENERATIVE_API_KEY}`;
        
        try {
            const imageResponse = await fetch(imageApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imagePayload)
            });
            const imageResult = await imageResponse.json();

            if (imageResult.predictions && imageResult.predictions.length > 0 && imageResult.predictions[0].bytesBase64Encoded) {
                imageUrl = `data:image/png;base64,${imageResult.predictions[0].bytesBase64Encoded}`;
            } else {
                console.error("Onverwachte responsstructuur van Imagen op backend:", imageResult);
            }
        } catch (imageError) {
            console.error("Fout bij Imagen API aanroep met GENERATIVE_API_KEY:", imageError);
        }
    } else {
        console.warn("GENERATIVE_API_KEY ontbreekt, Imagen aanroep overgeslagen.");
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
  console.log(`Backend server V2 luistert op poort ${port}`); // Aangepaste log om te zien dat deze versie draait
});
