import { api } from '../../lib/api.ts';

const dateEl = document.getElementById("planDate");
const btn = document.getElementById("loadPlan");
const list = document.getElementById("planList");

function isoDayRange(d) {
    const from = `${d}T00:00:00.000Z`;
    const to = `${d}T23:59:59.999Z`;
    return { from, to };
}

btn?.addEventListener("click", async () => {
    const d = dateEl.value || new Date().toISOString().slice(0,10);
    const { from, to } = isoDayRange(d);
    const items = await api.listPlan(from, to);
    list.innerHTML = items.map(i => `<div class="item"><strong>${i.title}</strong><span class="muted">${i.startsAt}</span></div>`).join("");
});