// server.js
// V2: Gebruikt een modern multimodaal model voor tekst en beeld in één call.

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { GoogleAuth } from 'google-auth-library'; // Belangrijke toevoeging!

const app = express();
const port = process.env.PORT || 3000;

// *** VEILIGE CORS configuratie ***
const corsOptions = {
  origin: 'https://eddiecool.nl',
  methods: 'POST',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// --- BELANGRIJKE WIJZIGING: GOOGLE AUTH & VERTEX AI INSTELLINGEN ---
// We gebruiken nu de Vertex AI endpoint, die stabieler is voor beeldgeneratie.
// Deze variabelen moet je instellen in Render Environment Variables.
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID; // Je Google Cloud Project ID
const LOCATION = 'us-central1'; // Standaardlocatie, pas aan indien nodig
const MODEL_ID = 'gemini-1.5-flash-001'; // Een krachtig en snel multimodaal model

// Valideer dat de omgevingsvariabelen zijn ingesteld
if (!PROJECT_ID) {
  console.error('Fout: GOOGLE_PROJECT_ID is niet ingesteld in de omgevingsvariabelen.');
  process.exit(1);
}

// Functie om een authenticatie token te krijgen
async function getAuthToken() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// POST-route voor het genereren van wijsheid en afbeelding
app.post('/generate-wisdom', async (req, res) => {
  try {
    const authToken = await getAuthToken();

    const prompt = `Genereer één grappige, pseudo-wetenschappelijke, spirituele of filosofische spreuk over AI. De spreuk moet kort en pakkend zijn, en een beetje 'mind-blowing' of absurd.
    Genereer daarnaast een afbeelding die hierbij past. Stijl: abstract, neon, futuristisch, mystiek, met elementen van technologie en natuur.
    Geef alleen het JSON-object terug met de sleutels "saying" (voor de tekst) en "image" (voor de afbeelding).`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      tools: [{
        'function_declarations': [{
          name: 'generate_wisdom_and_image',
          description: 'Genereert een wijsheid en een bijpassende afbeelding.',
          parameters: {
            type: 'OBJECT',
            properties: {
              saying: { type: 'STRING', description: 'De gegenereerde wijsheid over AI.' },
              image: { type: 'STRING', description: 'Een visuele, abstracte representatie van de wijsheid.' }
            },
            required: ['saying', 'image']
          }
        }]
      }],
      tool_config: {
        function_calling_config: {
          mode: 'ANY',
          allowed_function_names: ['generate_wisdom_and_image']
        }
      },
      generation_config: {
        "temperature": 1,
        "topP": 0.95,
        "topK": 64,
        "maxOutputTokens": 8192,
        "responseMimeType": "application/json"
      }
    };
    
    // De nieuwe, stabiele Vertex AI endpoint
    const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Fout van Google API:", apiResponse.status, errorBody);
        throw new Error(`Google API error: ${apiResponse.status}`);
    }
    
    const result = await apiResponse.json();
    
    const functionCall = result.candidates[0].content.parts[0].functionCall;
    const { saying, image } = functionCall.args;
    
    // Nu roepen we de Imagen model aan voor de daadwerkelijke beeldgeneratie
    const imagePayload = {
        "instances": [
            { "prompt": `Een abstracte, pseudo-wetenschappelijke, spirituele afbeelding die past bij de volgende spreuk: "${saying}". Stijl: ${image}` }
        ],
        "parameters": { "sampleCount": 1 }
    };
    
    const imageApiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;

    const imageResponse = await fetch(imageApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(imagePayload)
    });
    
    if (!imageResponse.ok) {
        const errorBody = await imageResponse.text();
        console.error("Fout van Imagen API:", imageResponse.status, errorBody);
        throw new Error(`Imagen API error: ${imageResponse.status}`);
    }
    
    const imageResult = await imageResponse.json();
    const imageBase64 = imageResult.predictions[0].bytesBase64Encoded;

    res.json({
      saying: saying,
      imageUrl: `data:image/png;base64,${imageBase64}`
    });

  } catch (error) {
    console.error("Fout in backend /generate-wisdom route:", error);
    res.status(500).json({ error: "Serverfout bij het genereren." });
  }
});

app.listen(port, () => {
  console.log(`Backend server V2 luistert op poort ${port}`);
});
