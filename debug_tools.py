import pkgutil
import google.adk.tools

print("\n🔍 ZOEKTOCHT NAAR TOOLS...")
print(f"📂 Tools map gevonden op: {google.adk.tools.__path__}")

print("\n--- BESCHIKBARE MODULES IN 'google.adk.tools' ---")
# Dit print alle bestandsnamen die in de tools-map staan
for loader, module_name, is_pkg in pkgutil.iter_modules(google.adk.tools.__path__):
    print(f"📦 {module_name}")

print("\n--- DIRECTE NAMEN (DIR) ---")
# Dit checkt of we ze direct kunnen aanroepen
print(dir(google.adk.tools))
print("--------------------------------------------------\n")