import os
from pathlib import Path
from google.adk.agents.llm_agent import Agent
from google.adk.tools.google_search_tool import GoogleSearchTool 
from dotenv import load_dotenv

# --- 1. SETUP ---
current_dir = Path(__file__).parent
env_path = current_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

print("\n--------------------------------------------------")
print("🚀 VIBE MANAGER: BACK TO BASICS (STABLE) 🛡️")
print("--------------------------------------------------")

# --- 2. DE AGENT ---
root_agent = Agent(
    name="vibe_manager",
    model="gemini-flash-latest", # Deze werkte perfect!
    tools=[GoogleSearchTool()], 
    
    description="De persoonlijke creative director van EddieCool.",
    
    instruction="""
    JIJ BENT: De Vibe Manager van EddieCool.
    
    KENNISBANK:
    - Eddie bouwt websites op gevoel ('Vibe Coding').
    - Website: https://eddiecool.nl/
    - YouTube: https://youtube.com/@eddiecool-nl
    - Stijl: Neon, Glitch, Synthwave.

    STIJL:
    - Kort, krachtig en visueel.
    - Gebruik tabellen voor overzicht.
    - Eindig met een 'Vibe Tip'.
    """
)
