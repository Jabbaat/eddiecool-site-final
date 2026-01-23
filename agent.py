import os
from google.adk.agents.llm_agent import Agent
from dotenv import load_dotenv

# 1. Vertel ons dat je leeft (kijk in je terminal naar deze tekst!)
print("--- DEBUG: AGENT.PY WORDT GELADEN ---")

# 2. Probeer de .env te laden (eerst lokaal, dan root)
load_dotenv() # Laadt huidige map
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env')) # Laadt hoofdmap

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    print(f"--- DEBUG: API KEY GEVONDEN (Begint met: {api_key[:4]}...) ---")
else:
    print("--- DEBUG: GEEN API KEY GEVONDEN! DIT IS HET PROBLEEM. ---")

# 3. De Agent definitie
try:
    agent = Agent(
        model='gemini-1.5-flash',
        name='vibe_manager',
        description='Jouw creatieve assistent.',
        instruction='Jij bent de Vibe Manager.',
    )
    print("--- DEBUG: AGENT SUCCESVOL AANGEMAAKT ---")
except Exception as e:
    print(f"--- DEBUG: FATALE FOUT BIJ MAKEN AGENT: {e} ---")
