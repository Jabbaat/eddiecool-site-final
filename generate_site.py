# generate_site.py

html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Eddiecool - AI Art Platform</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to Eddiecool</h1>
    <p>A platform for self-made AI art including videos and images.</p>
    <p>More coming soon!</p>
</body>
</html>
"""

with open("index.html", "w") as file:
    file.write(html_content)

print("Website created! Check the 'index.html' file.")

