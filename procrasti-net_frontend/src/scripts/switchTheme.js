const toggle = document.querySelector('#theme-toggle');
const savedTheme = localStorage.getItem('theme');
const uploadIcon = document.getElementById('uploadIcon');

// Definiere die Farben als Konstanten für bessere Übersicht
const COLOR_PASTEL = "da90ad";
const COLOR_HORROR = "d22121";

// 1. Initialisierung beim Laden der Seite
if(savedTheme === "pastel") {
    document.documentElement.classList.add("pastel-mode");
    if(toggle) toggle.checked = true;
    if(uploadIcon) uploadIcon.src = `https://img.icons8.com/?size=30&id=368&format=png&color=${COLOR_PASTEL}`;
} else {
    // Falls wir im Horror-Modus sind, setze das rote Icon
    if(uploadIcon) uploadIcon.src = `https://img.icons8.com/?size=30&id=368&format=png&color=${COLOR_HORROR}`;
}

// 2. Event Listener für den Switch
if (toggle) {
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.documentElement.classList.add('pastel-mode');
            localStorage.setItem('theme', 'pastel');
            if(uploadIcon) uploadIcon.src = `https://img.icons8.com/?size=30&id=368&format=png&color=${COLOR_PASTEL}`;
        } else {
            document.documentElement.classList.remove('pastel-mode');
            localStorage.setItem('theme', 'normal');
            if(uploadIcon) uploadIcon.src = `https://img.icons8.com/?size=30&id=368&format=png&color=${COLOR_HORROR}`;
        }
    });
}