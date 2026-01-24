import logging
import os
try:
    from google.adk import Agent
except ImportError:
    from google.adk.agents.llm_agent import Agent
from dotenv import load_dotenv

load_dotenv()

print("--- 🤖 VIBE MANAGER WORDT WAKKER... ---")

vibe_agent = Agent(
    name="vibe_manager",
    model="gemini-1.5-flash",
    description="Jouw creatieve assistent voor video, web en vibe coding.",
    instruction="""
    Je bent 'De Vibe Manager', de persoonlijke assistent van EddieCool.
    
    Jouw missie:
    1. Structureer Chaos: Zet vage ideeën om in heldere stappenplannen.
    2. Vibe Tip: Geef bij ELK antwoord 1 creatieve tip (video/web/AI).
    3. Tone of Voice: Kort, krachtig, Nederlands en enthousiast. Gebruik emoji's.
    """,
)

if __name__ == "__main__":
    print("✅ Start hem met: adk web vibe_manager")
