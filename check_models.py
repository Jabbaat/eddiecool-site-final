import os
import requests
from dotenv import load_dotenv

# 1. Laad de sleutel
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Geen API Key gevonden!")
    exit()

print("🔍 Ik vraag aan Google welke modellen beschikbaar zijn voor jouw sleutel...\n")

# 2. Vraag de lijst op via de directe API (buiten de ADK om)
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    print("--- BESCHIKBARE MODELLEN ---")
    found_any = False
    for model in data.get('models', []):
        # We filteren even alleen op modellen die content kunnen genereren
        if "generateContent" in model.get("supportedGenerationMethods", []):
            # Print de 'name' (dit is wat we in agent.py moeten plakken)
            # De naam ziet eruit als 'models/gemini-pro', wij halen 'models/' er vaak af in de code
            raw_name = model['name']
            clean_name = raw_name.replace("models/", "")
            print(f"✅ {clean_name}")
            found_any = True
    
    if not found_any:
        print("⚠️ Geen chat-modellen gevonden. Check je API key type.")
else:
    print(f"❌ Fout bij verbinden: {response.status_code}")
    print(response.text)

print("\n--------------------------------")