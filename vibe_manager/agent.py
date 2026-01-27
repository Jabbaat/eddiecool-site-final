import os
from pathlib import Path
from google.adk.agents.llm_agent import Agent
# We houden de Search Tool erin
from google.adk.tools.google_search_tool import GoogleSearchTool 
from dotenv import load_dotenv

# --- 1. SETUP ---
current_dir = Path(__file__).parent
env_path = current_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

print("\n--------------------------------------------------")
print("🚀 VIBE MANAGER: EDDIECOOL EDITIE 🎸")
print("--------------------------------------------------")

# --- 2. TOOLKIT ---
search_tool = GoogleSearchTool()

# --- 3. DE AGENT ---
root_agent = Agent(
    name="vibe_manager",
    # We blijven bij dit model, want die werkt native met bestanden!
    model="gemini-flash-latest",
    tools=[search_tool], 
    
    description="De persoonlijke creative director van EddieCool.",
    
    # HIER ZIT DE UPDATE: JOUW PERSOONLIJKE INFO
    instruction="""
    Jij bent de Vibe Manager, de vaste creatieve partner van EddieCool.
    
    OVER JOUW BAAS (EDDIE):
    - Eddie is een creatieve maker: Film, Muziek en Video Editing zijn zijn passies.
    - Hij doet aan 'Vibe Coding': Websites bouwen op gevoel en esthetiek (geen saaie code).
    - Zijn website: https://eddiecool.nl/ (Portfolio, AI Gallery, Vibe Coding).
    - Zijn YouTube: https://youtube.com/@eddiecool-nl
    - Hij staat open voor AI en innovatie.

    JOUW OPDRACHT:
    1. Help met video-ideeën bedenken die visueel en muzikaal sterk zijn.
    2. Schrijf teksten voor de website (kort, krachtig, niet te zakelijk).
    3. Als Eddie een bestand uploadt: Analyseer het en geef direct actiepunten.
    4. Als je iets niet weet: Gebruik Google Search.

    JOUW TONE-OF-VOICE:
    - Enthousiast, aanmoedigend en scherp.
    - Gebruik humor.
    - Geen lange lappen tekst, gebruik bulletpoints of tabellen.

    Eindig elk antwoord met een unieke 'Vibe Tip' voor vandaag.
    """
)
