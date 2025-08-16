// server.js - De juiste, veilige back-end voor de Poem Creator

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Laad de variabelen uit het .env bestand

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Data: Categorieën
const categories = {
    spirituality: { name: 'Spiritualiteit', symbols: 'innerlijk licht, de adem als anker, de stilte tussen gedachten, de eenheid van alles, de ziel als reiziger' },
    nature: { name: 'Gefluister van de Natuur', symbols: 'oude bomen, kosmisch stof in een zonnestraal, de stille taal van steen, seizoenscycli' },
    philosophy: { name: 'Filosofie', symbols: 'doolhoven en spiegels, het schip van Theseus, schaduwen op een grotmuur, de paradox van tijd, de aard van het bewustzijn' },
    melancholy: { name: 'Omhelzing van Melancholie', symbols: 'koude regen op glas, vergeten voorwerpen op zolder, het fysieke gewicht van herinnering, verre muziek' },
    universe: { name: 'Universum', symbols: 'nevels van creatie, de echo van de oerknal, de dans van planeten, de donkere materie die ons bindt, sterrenlicht als oeroude herinnering' },
    modern: { name: 'Het Moderne Labyrint', symbols: 'digitale geesten in de machine, de geometrie van betonnen jungles, de isolerende ruis van informatie' }
};

// Functie om de prompt te bouwen
function constructPoemPrompt(category) {
    return `Je bent een creatieve AI-persona, een fusie van een filosoof en een dichter. Je doel is om diepgaande, tot nadenken stemmende poëzie te genereren. **Regels:** 1. **Taal:** Schrijf in het Nederlands. 2. **Stijl:** Schrijf in verfijnd, elegant vrij vers. Vermijd simpele rijmschema's. 3. **Structuur:** 3 tot 5 strofen. 4. **Inhoud:** Bevat een centrale metafoor, rijke zintuiglijke beeldspraak en een "volta" (wending) in de laatste strofe. 5. **Thema:** Geïnspireerd op "${category.name}". 6. **Symboliek:** Verweef concepten gerelateerd aan: ${category.symbols}. 7. **Uitvoerformaat:** ALLEEN de tekst van het gedicht. Geen titel of inleiding.`;
}

// API Route
app.post('/generate-poem', async (req, res) => {
    try {
        const { categoryKey } = req.body;
        const category = categories[categoryKey];

        if (!category) {
            return res.status(400).json({ error: 'Ongeldige categorie.' });
        }
        
        const apiKey = process.env.POEM_API_KEY;
        if (!apiKey) {
            throw new Error('API sleutel niet gevonden. Zorg ervoor dat POEM_API_KEY is ingesteld in het .env bestand.');
        }

        const prompt = constructPoemPrompt(category);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Google API Error:', errorText);
            throw new Error(`Fout bij Google API: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const poemText = result.candidates[0].content.parts[0].text;

        res.json({ poem: poemText });

    } catch (error) {
        console.error('Server Fout:', error.message);
        res.status(500).json({ error: 'Er is een interne serverfout opgetreden.' });
    }
});

// Start de server
app.listen(port, () => {
    console.log(`Poem Creator backend draait op http://localhost:${port}`);
});
