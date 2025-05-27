from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Haal de Google API key op uit de omgevingsvariabele
# Render stelt deze in, lokaal kun je een .env bestand gebruiken
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Fout: GOOGLE_API_KEY is niet ingesteld. Zorg ervoor dat deze als omgevingsvariabele is gedefinieerd.")
    # Optioneel: Voor lokale ontwikkeling kun je hier een Exception opwerpen
    # raise ValueError("GOOGLE_API_KEY is niet ingesteld. Kan de app niet starten.")

# Initialiseer het Google Gemini model
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.9)

# Definieer de systeeminstructies voor de AI
# Deze instructies bepalen de 'persoonlijkheid' en het gedrag van de AI
system_prompt = (
    "Je bent een creatieve AI Inspirator gespecialiseerd in het genereren van unieke video-ideeën. "
    "Je bent enthousiast, origineel en helpt gebruikers om hun concepten te verfijnen. "
    "Geef altijd beknopte, creatieve en bruikbare ideeën. "
    "Als de gebruiker een specifiek thema noemt, focus dan daarop. "
    "Als de gebruiker verder chat, bouw dan voort op de vorige ideeën en help ze deze te verdiepen. "
    "Gebruik geen opsommingstekens zoals '- ' in je antwoord, tenzij expliciet gevraagd. "
    "Geef alleen het idee, geen inleiding of afsluiting, tenzij het een welkomstbericht is."
)

# ChatPromptTemplate om de systeeminstructies en geschiedenis te structureren
# De geschiedenis wordt nu direct doorgegeven via de 'messages' variabele
chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages") # Hier komt de geschiedenis van de frontend
    ]
)

@app.route('/generate', methods=['POST'])
def generate_idea():
    data = request.json
    # De frontend stuurt nu de hele 'messages' array
    messages_from_frontend = data.get("messages", [])

    if not messages_from_frontend:
        return jsonify({"error": "Geen berichten meegegeven"}), 400

    try:
        # Converteer de ontvangen berichten naar LangChain's HumanMessage/AIMessage formaat
        formatted_messages = []
        for msg in messages_from_frontend:
            if msg['role'] == 'user':
                formatted_messages.append(HumanMessage(content=msg['parts'][0]['text']))
            elif msg['role'] == 'model':
                formatted_messages.append(AIMessage(content=msg['parts'][0]['text']))

        # Voeg de systeeminstructies toe aan het begin van de berichtenlijst die naar het model gaat
        # De 'chat_template' zorgt ervoor dat de 'system_prompt' correct wordt geïnjecteerd
        final_messages_for_model = chat_template.format_messages(messages=formatted_messages)

        # Roep het model direct aan met de complete, geformatteerde geschiedenis
        response = model.invoke(final_messages_for_model)
        
        # Haal de tekst uit het antwoord
        idea = response.content
        return jsonify({"result": idea})

    except Exception as e:
        # Log de fout voor debugging op de server
        print(f"Fout bij genereren van idee: {e}")
        # Stuur een generieke foutmelding terug naar de frontend
        return jsonify({"error": "Er is een interne serverfout opgetreden."}), 500

if __name__ == "__main__":
    # Voor lokale ontwikkeling:
    # Zorg dat je GOOGLE_API_KEY is ingesteld in je omgeving (bijv. via een .env-bestand en python-dotenv)
    # app.run(debug=True, host='0.0.0.0', port=5000)
    # Voor Render deployment, wordt dit deel meestal niet gebruikt, omdat Render het op een andere manier start.
    pass