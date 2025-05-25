# inspirator_agent_cli.py - De COMPLETE code voor je AI Inspirator (met Google Gemini)

from dotenv import load_dotenv # Nodig om .env bestand te laden
import os # Nodig om omgevingsvariabelen te lezen

# --- BELANGRIJK: Importeer Google Gemini i.p.v. OpenAI ---
from langchain_google_genai import ChatGoogleGenerativeAI # Voor de verbinding met Google Gemini
# --- EINDE BELANGRIJK ---

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder # Voor het maken van prompts
from langchain.chains import ConversationChain # Voor het beheren van de conversatie
from langchain.memory import ConversationBufferMemory # Voor het geheugen van de agent

# --- START: API sleutel laden (voor Google Gemini) ---
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY") # We lezen nu GOOGLE_API_KEY

# <<< DEZE REGEL IS VOOR DEBUGGING >>>
print(f"DEBUG: Waarde van GOOGLE_API_KEY vanuit .env: '{google_api_key}'")
# <<< EINDE DEBUG REGEL >>>

# Controleer of de API sleutel is geladen
if not google_api_key:
    print("Fout: Google API sleutel niet gevonden.")
    print("Zorg ervoor dat je een .env bestand hebt in dezelfde map als dit script.")
    print("In het .env bestand moet staan: GOOGLE_API_KEY=jouw_api_sleutel_hier")
    exit() # Stop het programma als de sleutel ontbreekt
# --- EIND: API sleutel laden ---

# 1. Initialiseer het Large Language Model (nu Google Gemini)
# Gebruik het model "gemini-pro" voor algemeen gebruik.
llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash", google_api_key=google_api_key, temperature=0.8)

# 2. Definieer de Prompt Template MET een plek voor geheugen
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

# 3. Initialiseer het geheugen
memory = ConversationBufferMemory(return_messages=True)

# 4. Maak een Conversation Chain
conversation_chain = ConversationChain(
    memory=memory,
    prompt=prompt,
    llm=llm,
    verbose=False
)

# 5. Start de conversatie-loop
print("\nWelkom bij de Creatieve AI Inspirator! (Typ 'stop' om te eindigen)")
print("Waarmee kan ik je helpen brainstormen vandaag? Vertel me over je interesses of wat je zou willen maken.")

while True:
    user_input = input("> ")
    if user_input.lower() == 'stop':
        break

    response = conversation_chain.invoke({"input": user_input})

    print("\n--- Jouw AI Project Ideeën ---")
    print(response['response'])
    print("-----------------------------")

print("\nBedankt voor het brainstormen! Tot de volgende keer.")