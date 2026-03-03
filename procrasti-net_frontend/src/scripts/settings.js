import { api } from '../../lib/api.ts';

const triggers = document.getElementById("settingsTriggers");
const save = document.getElementById("saveSettings");

async function load() {
    const s = await api.getSettings();
    triggers.value = (s.excluded_triggers || []).join(", ");
}

save?.addEventListener("click", async () => {
    const arr = triggers.value.split(",").map(x => x.trim()).filter(Boolean);
    await api.updateSettings({ excluded_triggers: arr });
});

load().catch(console.error);