import { api } from '../../lib/api.ts';
const form = document.getElementById("habitCreate");
const nameEl = document.getElementById("habitName");
const list = document.getElementById("habitList");

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function card(h) {
    return `
  <article class="card" data-id="${h.id}">
    <h3>${h.name}</h3>
    <p class="muted">Streak: <strong>${h.streak ?? 0}</strong></p>
    <button class="pill" data-action="check" type="button">Checked today</button>
  </article>`;
}

async function refresh() {
    const habits = await api.listHabits();
    list.innerHTML = habits.map(card).join("");
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await api.createHabit({ name: nameEl.value.trim() });
    form.reset();
    await refresh();
});

list?.addEventListener("click", async (e) => {
    const cardEl = e.target.closest(".card");
    if (!cardEl) return;
    if (e.target.dataset.action !== "check") return;

    await api.checkHabit(cardEl.dataset.id, todayISO());
    await refresh();
});

refresh().catch(console.error);