import { api } from '../../lib/api.ts';

const form = document.getElementById("todoCreate");
const title = document.getElementById("todoTitle");
const prio = document.getElementById("todoPriority");
const list = document.getElementById("todoList");

function row(t) {
    return `
  <div class="item" data-id="${t.id}">
    <label class="check">
      <input type="checkbox" ${t.status === "completed" ? "checked" : ""} />
      <span>${t.title}</span>
    </label>
    <span class="tag">${t.priority || "med"}</span>
    <button class="ghost" data-action="del" type="button">✕</button>
  </div>`;
}

async function refresh() {
    async function refresh() {
        if (!api.token) {
            list.innerHTML = `<li class="empty">Log in to see your todos.</li>`;
            return;
        }
        try {
            const todos = await api.listTodos();
            list.innerHTML = todos.map(row).join("");
        } catch (e) {
            console.error(e);
            list.innerHTML = `<li class="empty">Failed to load todos.</li>`;
        }
    }
    await refresh();
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await api.createTodo({ title: title.value.trim(), priority: prio.value });
    form.reset();
    await refresh();
});

list?.addEventListener("click", async (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.matches('input[type="checkbox"]')) {
        const title = item.querySelector('span').innerText;
        await api.updateTodo(id, { 
            title, 
            status: e.target.checked ? "completed" : "open" 
        });
        return;
    }

    if (e.target.dataset.action === "del") {
        await api.deleteTodo(id);
        await refresh();
    }
});

refresh().catch(console.error);