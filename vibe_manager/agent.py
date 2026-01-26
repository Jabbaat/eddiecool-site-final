import os
from pathlib import Path
from google.adk.agents.llm_agent import Agent
# --- IMPORT FIX: We voegen '_tool' toe aan de naam ---
from google.adk.tools.google_search_tool import GoogleSearchTool 
from dotenv import load_dotenv

# --- 1. SETUP ---
current_dir = Path(__file__).parent
env_path = current_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

print("\n--------------------------------------------------")
print("🚀 VIBE MANAGER: NU MET WERKENDE SEARCH 🌐")
print("--------------------------------------------------")

# --- 2. CHECK KEY ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print(f"❌ FOUT: Kan .env niet vinden op: {env_path}")
else:
    print(f"✅ SUCCES: API Key gevonden (Begint met {api_key[:4]}...)")

print("--------------------------------------------------\n")

# --- 3. DE TOOL AANZETTEN ---
search_tool = GoogleSearchTool()

# --- 4. DE AGENT ---
root_agent = Agent(
    name="vibe_manager",
    model="gemini-flash-latest", 
    tools=[search_tool], 
    description="De creatieve assistent van EddieCool met internet-toegang.",
    instruction="""
    Je bent de Vibe Manager, assistent van EddieCool.
    
    Jouw Superkracht:
    Je hebt toegang tot Google Search. Gebruik dit ALTIJD als de gebruiker vraagt naar:
    - Actuele trends (vandaag/deze week).
    - Nieuws of feiten.
    - Dingen die je niet zeker weet.

    Antwoord kort, krachtig en met humor.
    Eindig elk antwoord met een Vibe Tip.
    """,
)
