import os
from pathlib import Path
from google.adk.agents.llm_agent import Agent
from dotenv import load_dotenv

# --- 1. SETUP ---
current_dir = Path(__file__).parent
env_path = current_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

print("\n--------------------------------------------------")
print("🚀 VIBE MANAGER: POGING 'FLASH LATEST'...")
print("--------------------------------------------------")

# --- 2. CHECK KEY ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print(f"❌ FOUT: Kan .env niet vinden op: {env_path}")
else:
    print(f"✅ SUCCES: API Key gevonden (Begint met {api_key[:4]}...)")

print("--------------------------------------------------\n")

# --- 3. DE AGENT ---
root_agent = Agent(
    name="vibe_manager",
    # WE GEBRUIKEN NU DE ALIAS UIT JOUW LIJST:
    model="gemini-flash-latest", 
    description="De creatieve assistent van EddieCool",
    instruction="""
    Je bent de Vibe Manager, assistent van EddieCool.
    Antwoord kort, krachtig en met humor.
    Eindig elk antwoord met een Vibe Tip.
    """,
)
