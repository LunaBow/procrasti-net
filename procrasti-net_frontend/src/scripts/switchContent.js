function navigateTo(sectionId) {
    const sections = [
        "BootVisible",
        "EvaluationVisible",
        "RequiredVisible",
        "JoinContent",
        "ArtVisible",
        "MemberVisible",
        "picsOnly",
        "avOnly",
        "booksOnly",
        "drawingsOnly"
    ];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (target) target.style.display = "block";
}

import { initGallery } from "./displayGallery.js";
import { displayMembers } from "./showAllMembers.js";

window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash;

    const simpleRoutes = {
        "#boot": "BootVisible",
        "#evaluation": "EvaluationVisible",
        "#members": "MemberVisible",
        "#required": "RequiredVisible",
        "#artworks": "ArtVisible",
        "#drawings": "ArtVisible",
        "#av": "ArtVisible",
        "#books": "ArtVisible",
        "#auth": "AuthVisible"
    };

    // 1. Prüfen, ob es eine normale Hauptseite ist
    if (simpleRoutes[hash]) {
        if (hash === "#auth") {
            navigateTo("JoinContent");
            show("AuthVisible");
        } else {
            navigateTo(simpleRoutes[hash]);
        }
        if (hash === "#artworks") {
            // Alles zeigen
            ["artGallery", "avGallery", "BookGallery", "uploadArt"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "block";
            });
            initGallery();
        }
    }
    // 2. Prüfen, ob es einer deiner Unter-Hashes ist
    else if (["#picsOnly", "#avOnly", "#booksOnly", "#drawings", "#av", "#books"].includes(hash)) {
        // Zuerst zur Art-Sektion navigieren
        navigateTo("ArtVisible");

        // Jetzt den entsprechenden Klick-Handler "feuern" lassen
        const mapping = {
            "#picsOnly": "showDrawingsOnly",
            "#drawings": "showDrawingsOnly",
            "#avOnly": "showAVOnly",
            "#av": "showAVOnly",
            "#booksOnly": "showBooksOnly",
            "#books": "showBooksOnly"
        };

        const btnId = mapping[hash];
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.click();
        } else {
            // If button not found (e.g. on separate page), the page script handles it
        }
    }
    // 3. Fallback zur Startseite
    else {
        navigateTo("JoinContent");
    }
});

document.getElementById("triggerEvaluation")?.addEventListener("click", function(e) {
    const el = document.getElementById("EvaluationVisible");
    if (el) {
        el.style.display = "block";
        document.getElementById("RequiredVisible").style.display = "none";
        document.getElementById("JoinContent").style.display = "none";
        document.getElementById("ArtVisible").style.display = "none";
        document.getElementById("BootVisible").style.display = "none";
        window.location.hash = "evaluation";
        e.preventDefault();
    }
})
document.getElementById("triggerRequired")?.addEventListener("click", function(e) {
    const el = document.getElementById("RequiredVisible");
    if (el) {
        el.style.display = "block";
        document.getElementById("EvaluationVisible").style.display = "none";
        document.getElementById("JoinContent").style.display = "none";
        document.getElementById("ArtVisible").style.display = "none";
        document.getElementById("MemberVisible").style.display = "none";
        document.getElementById("BootVisible").style.display = "none";
        window.location.hash = "required";
        e.preventDefault();
    }
})

document.getElementById("triggerArt")?.addEventListener("click", function(e) {
    if (window.location.pathname.startsWith("/Row2/")) {
        // We are on a Row2 page (like art.astro), navigation is handled by the browser
        return;
    }
    // If we are on Row1 (app.astro), handle as SPA section switch
    const artPanel = document.getElementById("ArtVisible");
    if (artPanel) {
        show("ArtVisible");
        window.location.hash = "artworks";
        const uploadArt = document.getElementById("uploadArt");
        const bookGallery = document.getElementById("BookGallery");
        const avGallery = document.getElementById("avGallery");
        const artGallery = document.getElementById("artGallery");
        if (uploadArt) uploadArt.style.display = "block";
        if (bookGallery) bookGallery.style.display = "block";
        if (avGallery) avGallery.style.display = "block";
        if (artGallery) artGallery.style.display = "block";
        initGallery();
        e.preventDefault();
    }
})

document.getElementById("TriggerMember")?.addEventListener("click", function(e) {
    const el = document.getElementById("MemberVisible");
    if (el) {
        el.style.display = "block";
        document.getElementById("ArtVisible").style.display = "none";
        document.getElementById("RequiredVisible").style.display = "none";
        document.getElementById("EvaluationVisible").style.display = "none";
        document.getElementById("JoinContent").style.display = "none";
        document.getElementById("BootVisible").style.display = "none";
        window.location.hash = "members";
        displayMembers();
        e.preventDefault();
    }
})

document.getElementById("showDrawingsOnly")?.addEventListener("click", function(e) {
    const artPanel = document.getElementById("ArtVisible");
    if (artPanel && !window.location.pathname.startsWith("/Row2/")) {
        show("ArtVisible");
        document.getElementById("uploadArt").style.display = "none";
        document.getElementById("BookGallery").style.display = "none";
        document.getElementById("avGallery").style.display = "none";
        document.getElementById("artGallery").style.display = "block";
        window.location.hash = "drawings";
        initGallery();
        e.preventDefault();
    }
})

document.getElementById("showAVOnly")?.addEventListener("click", function(e) {
    const artPanel = document.getElementById("ArtVisible");
    if (artPanel && !window.location.pathname.startsWith("/Row2/")) {
        show("ArtVisible");
        document.getElementById("uploadArt").style.display = "none";
        document.getElementById("BookGallery").style.display = "none";
        document.getElementById("avGallery").style.display = "block";
        document.getElementById("artGallery").style.display = "none";
        window.location.hash = "av";
        initGallery();
        e.preventDefault();
    }
})

document.getElementById("showBooksOnly")?.addEventListener("click", function(e) {
    const artPanel = document.getElementById("ArtVisible");
    if (artPanel && !window.location.pathname.startsWith("/Row2/")) {
        show("ArtVisible");
        document.getElementById("uploadArt").style.display = "none";
        document.getElementById("BookGallery").style.display = "block";
        document.getElementById("avGallery").style.display = "none";
        document.getElementById("artGallery").style.display = "none";
        window.location.hash = "books";
        initGallery();
        e.preventDefault();
    }
})

document.getElementById("headerHeading")?.addEventListener("click", function() {
    const jc = document.getElementById("JoinContent");
    if (jc) {
        document.getElementById("EvaluationVisible").style.display = "none";
        document.getElementById("RequiredVisible").style.display = "none";
        jc.style.display = "block";
        document.getElementById("ArtVisible").style.display = "none";
        document.getElementById("BootVisible").style.display = "none";
        window.location.hash = "home";
    }
})

document.getElementById("triggerBoot")?.addEventListener("click", function(e) {
    const el = document.getElementById("BootVisible");
    if (el) {
        el.style.display = "block";
        document.getElementById("EvaluationVisible").style.display = "none";
        document.getElementById("RequiredVisible").style.display = "none";
        document.getElementById("JoinContent").style.display = "none";
        document.getElementById("ArtVisible").style.display = "none";
        window.location.hash = "boot";
        e.preventDefault();
    }
})

const map = [
    ["triggerSkills", "SkillsVisible"],
    ["triggerTodos", "TodosVisible"],
    ["triggerHabits", "HabitsVisible"],
    ["triggerPlanner", "PlannerVisible"],
    ["triggerCalendar", "CalendarVisible"],
    ["triggerSettings", "SettingsVisible"],
    ["triggerAuth", "AuthVisible"],
    ["triggerArt", "ArtVisible"],
];

function show(id) {
    for (const [, panel] of map) {
        const el = document.getElementById(panel);
        if (el) el.style.display = panel === id ? "block" : "none";
    }
}

for (const [btn, panel] of map) {
    document.getElementById(btn)?.addEventListener("click", (e) => {
        if (document.getElementById(panel)) {
            show(panel);
            e.preventDefault();
        }
    });
}