const fs = require('fs');
const path = require('path');

const docsDir = __dirname;
const htmlFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'));

const navContent = `    <nav>
        <div class="logo">
            <a href="index.html">
                <img src="images/logo.png" alt="Eddiecool Logo" class="logo-img">
            </a>
        </div>
        <span class="hamburger" id="hamburger-menu">&#9776;</span>
        <ul class="menu">
            <li><a href="index.html">🏠 Home</a></li>
            <li><a href="projects.html">✨ Projecten</a></li>
            <li><a href="ai_gallery.html">🖼️ Galerij</a></li>
            <li><a href="muziek.html">🎵 Muziek</a></li>
            <li><a href="VibeCoding.html">⚡ Vibe Coding</a></li> 
            <li><a href="ai_apps.html">📱 AI Apps</a></li>
            <li><a href="about.html">ℹ️ Over Mij</a></li>
            <li><a href="contact.html">📧 Contact</a></li>
        </ul>
    </nav>`;

const descriptions = {
    'about.html': 'Leer meer over Eddiecool. Ontdek mijn passie voor film, video-editing en muziek, samengebracht in de fascinerende wereld van Vibe Coding en AI.',
    'ai_apps.html': 'Ontdek innovatieve AI apps en tools op de Eddiecool AI Speelplaats. Verken interactieve projecten en slimme applicaties gebouwd met geavanceerde AI.',
    'ai_gallery.html': 'Bewonder de AI Galerij van Eddiecool. Een visuele reis door adembenemende, hyperrealistische AI-kunstwerken en creatieve beeldgeneratie experimenten.',
    'contact.html': 'Neem contact op met Eddiecool. Stuur een bericht voor samenwerkingen of vragen over AI-projecten, en krijg snel antwoord uit de digitale werkplaats.',
    'creative_aistudio.html': 'Welkom in de Creative AI Studio. Experimenteer met grensverleggende multimodale modellen en ontdek nieuwe manieren om AI creatief in te zetten.',
    'index.html': 'Welkom in de Eddiecool AI Speelplaats. Ontdek grensverleggende projecten op het snijvlak van kunstmatige intelligentie, film, muziek en Vibe Coding.',
    'projects.html': 'Bekijk de spraakmakende AI-projecten van Eddiecool. Van surrealistische AI-films en animaties tot verrassende experimenten en Vibe Coding showcases.',
    'schaken.html': 'Speel een potje AI-schaak in de Eddiecool Speelplaats. Test je strategisch inzicht tegen slimme algoritmes in een moderne, digitale omgeving.',
    'shooter.html': 'Beleef de AI Shooter game op de Eddiecool Speelplaats. Een interactieve en spannende game-ervaring gecreëerd door middel van geavanceerde AI.',
    'spirograaf.html': 'Creëer fascinerende patronen met de AI Spirograaf. Een interactief project op de Eddiecool Speelplaats voor unieke digitale en geometrische kunst.',
    'vibe_agent.html': 'Maak kennis met de Vibe Agent. Ontdek hoe AI, esthetiek en natuurlijke taal samensmelten om unieke digitale ervaringen te creëren bij Eddiecool.',
    'zonnestelsel.html': 'Verken ons zonnestelsel in een interactieve AI-simulatie. Een leerzaam en visueel indrukwekkend project binnen de Eddiecool AI Speelplaats.'
};

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    let modified = false;

    // Task 2: Update Nav
    const navRegex = /<nav>[\s\S]*?<\/nav>/i;
    if (navRegex.test(content)) {
        content = content.replace(navRegex, navContent);
        modified = true;
    }

    // Task 1: Update SEO Meta Description
    if (file !== 'muziek.html' && file !== 'VibeCoding.html') {
        const descRegex = /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i;
        const metaDesc = `<meta name="description" content="${descriptions[file] || descriptions['index.html']}">`;
        
        if (descRegex.test(content)) {
            content = content.replace(descRegex, metaDesc);
            modified = true;
        } else {
            // Insert right before </head>
            content = content.replace('</head>', `    ${metaDesc}\n</head>`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(path.join(docsDir, file), content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log('Done!');
