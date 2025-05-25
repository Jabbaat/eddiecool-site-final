# app.py
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from flask_cors import CORS # Nodig om de website te laten praten met je backend

app = Flask(__name__)
CORS(app) # Schakel CORS in, zodat je frontend (de website) je backend kan aanroepen

# --- AI Inspirator Logica ---
load_dotenv()
# Lees de API sleutel uit .env bestand.
# Op Render stel je dit in als 'omgevingsvariabele' in het dashboard.
google_api_key = os.getenv("GOOGLE_API_KEY")

if not google_api_key:
    # Zorg dat deze melding alleen in de terminal komt als er een probleem is
    print("Fout: GOOGLE_API_KEY niet gevonden. Stel deze in je .env bestand in voor lokaal testen, of als omgevingsvariabele op Render.")
    # In een live app wil je misschien een andere foutafhandeling
    raise ValueError("GOOGLE_API_KEY is niet ingesteld!")

# Gebruik het werkende model dat we eerder gevonden hebben
llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash", google_api_key=google_api_key, temperature=0.8)

# Prompt en geheugen initialisatie (deze code is hetzelfde als in je CLI-script)
prompt = ChatPromptTemplate.from_messages([
    ("system", """
    Je bent de "Creatieve AI Inspirator" voor een portfolio website gericht op AI en creativiteit.
    Jouw doel is om bezoekers te helpen brainstormen over hun eigen creatieve projectideeën met behulp van AI.
    Wees enthousiast, inspirerend en help de gebruiker om hun gedachten te structureren.
    Stel vragen om hun interesses, beschikbare tools of gewenste projecttype te achterhalen.
    Geef vervolgens concrete, creatieve en haalbare projectideeën die AI gebruiken.
    Je kunt je laten inspireren door algemene trends in AI creativiteit (beeld, tekst, muziek, video, code etc.), maar ook door het type projecten dat je waarschijnlijk op de website van de maker zult vinden (hou het gerelateerd aan creativiteit en AI).
    Formuleer je antwoord altijd op een positieve en aanmoedigende toon.
    Organiseer de ideeën duidelijk, bijvoorbeeld in een lijst.

    Hieronder volgt de geschiedenis van onze conversatie:
    """),
    MessagesPlaceholder(variable_name="history"),
    ("user", "{input}")
])

memory = ConversationBufferMemory(return_messages=True)
conversation_chain = ConversationChain(
    memory=memory,
    prompt=prompt,
    llm=llm,
    verbose=False
)
# --- Einde AI Inspirator Logica ---

# Dit is het "adres" (endpoint) waar je website mee praat
@app.route('/generate', methods=['POST'])
def generate_idea():
    data = request.get_json() # Haal de data (de "prompt" van de gebruiker) uit het verzoek
    user_input = data.get('prompt')

    if not user_input:
        return jsonify({"error": "Geen invoer ontvangen"}), 400

    try:
        # Roep je AI Inspirator aan met de invoer van de gebruiker
        response_data = conversation_chain.invoke({"input": user_input})
        ai_response = response_data.get('response', 'Geen antwoord ontvangen van de AI.')
        # Stuur het antwoord terug naar de website als JSON
        return jsonify({"result": ai_response})
    except Exception as e:
        # Als er een fout optreedt, log het en stuur een foutmelding terug
        print(f"Fout bij genereren van idee: {e}")
        return jsonify({"error": "Er ging iets mis bij het genereren van het idee."}), 500

# Voor lokaal testen (zodat je het via http://127.0.0.1:5000 kunt benaderen)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)