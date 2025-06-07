// server.js
// Dit bestand draait op je backend-server (bijv. Render) en handelt de AI-aanroepen af.

// Importeer benodigde modules
import express from 'express'; // Voor het opzetten van de webserver
import fetch from 'node-fetch'; // Voor het maken van HTTP-aanroepen (naar Google API's)
import cors from 'cors'; // Voor het afhandelen van Cross-Origin Resource Sharing (belangrijk voor beveiliging)

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

// Haal de API-sleutel op uit de omgevingsvariabelen
// Deze variabele (GENERATIVE_API_KEY) stel je in op Render, NIET hier in de code.
const API_KEY = process.env.GENERATIVE_API_KEY;

// Controleer of de API-sleutel is ingesteld
if (!API_KEY) {
  console.error('Fout: GENERATIVE_API_KEY is niet ingesteld in de omgevingsvariabelen.');
  // Stop de applicatie als de sleutel ontbreekt, want de API-aanroepen zullen falen.
  process.exit(1); 
}

// Definieer een POST-route voor het genereren van AI-wijsheid en afbeeldingen
app.post('/generate-wisdom', async (req, res) => {
  try {
    // 1. Genereer de wijsheidstekst met Gemini
    const textPrompt = "Genereer één grappige, pseudo-wetenschappelijke, spirituele of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, en een beetje 'mind-blowing' of absurd. Geef alleen de spreuk terug in JSON-formaat.";
    
    const textPayload = {
      contents: [{ role: "user", parts: [{ text: textPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "saying": { "type": "STRING" }
          },
          propertyOrdering: ["saying"]
        }
      }
    };

    const textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const textResponse = await fetch(textApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(textPayload)
    });
    const textResult = await textResponse.json();

    let generatedSaying = "Kon geen wijsheid genereren.";
    if (textResult.candidates && textResult.candidates.length > 0 &&
        textResult.candidates[0].content && textResult.candidates[0].content.parts &&
        textResult.candidates[0].content.parts.length > 0) {
      try {
        const jsonText = textResult.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        generatedSaying = parsedJson.saying;
      } catch (e) {
        console.error("Fout bij parsen van Gemini JSON op backend:", e, jsonText);
        generatedSaying = "Oeps, de AI sprak in raadsels op de backend.";
      }
    } else {
      console.error("Onverwachte responsstructuur van Gemini op backend:", textResult);
      generatedSaying = "Probleem met Gemini respons op backend.";
    }

    // 2. Genereer de afbeelding met Imagen
    const imagePrompt = `Een abstracte, pseudo-wetenschappelijke, spirituele afbeelding die past bij de volgende spreuk: "${generatedSaying}". Stijl: neon, futuristisch, mystiek, met elementen van technologie en natuur.`;
    
    const imagePayload = { instances: { prompt: imagePrompt }, parameters: { "sampleCount": 1} };
    const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
    
    const imageResponse = await fetch(imageApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagePayload)
    });
    const imageResult = await imageResponse.json();

    let imageUrl = "https://placehold.co/400x300/333/FFF?text=Afbeelding+niet+geladen"; // Fallback
    if (imageResult.predictions && imageResult.predictions.length > 0 && imageResult.predictions[0].bytesBase64Encoded) {
      imageUrl = `data:image/png;base64,${imageResult.predictions[0].bytesBase64Encoded}`;
    } else {
      console.error("Onverwachte responsstructuur van Imagen op backend:", imageResult);
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
  console.log(`Backend server luistert op poort ${port}`);
