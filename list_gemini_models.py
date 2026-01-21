from dotenv import load_dotenv
import os
import google.generativeai as genai

# Laad de API sleutel uit het .env bestand
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")

if not google_api_key:
    print("Fout: Google API sleutel niet gevonden in .env bestand.")
    exit()

# Configureer de Google Generative AI bibliotheek met je API sleutel
genai.configure(api_key=google_api_key)

print("Beschikbare Gemini modellen:")
for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(f"- Naam: {model.name}")