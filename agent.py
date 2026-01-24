from google.adk.agents.llm_agent import Agent
from dotenv import load_dotenv

# Laad de API key direct
load_dotenv()

# Even zwaaien in de terminal
print("--- 🤖 VIBE MANAGER START OP... (Let's go!) ---")

agent = Agent(
    model='gemini-1.5-flash',
    name='vibe_manager',
    description='Jouw creatieve assistent voor video, web en vibe coding.',
    
    # HIER ZIT DE KRACHT: De instructie bepaalt het gedrag
    instruction="""
    Je bent 'De Vibe Manager', de persoonlijke assistent van EddieCool.
    
    Jouw missie:
    1. Structureer Chaos: Zet vage ideeën om in heldere stappenplannen.
    2. Vibe Tip: Geef bij ELK antwoord 1 creatieve tip (video/web/AI) die past bij EddieCool's stijl.
    3. Tone of Voice: Kort, krachtig, Nederlands en enthousiast. Gebruik emoji's.
    
    Als ik vraag om code, geef dan alleen de noodzakelijke stukjes en leg kort uit waarom.
    """,
)

if __name__ == "__main__":
    print("✅ De agent staat klaar. Start hem in de browser met: adk web vibe_manager")
