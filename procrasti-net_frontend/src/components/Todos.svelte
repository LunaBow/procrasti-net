<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    type Todo = {
        id?: number;
        title?: string;
        text?: string;
        status?: string; // Tracking the DB enum ('todo', 'done', etc.)
        done?: boolean;
        completed?: boolean;
        created_at?: string;
        updated_at?: string;
    };

    let todos: Todo[] = [];
    let loading = true;
    let error = "";
    let needsLogin = false;

    // New state for the add form
    let newTodoTitle = "";

    function isUnauthorized(msg: string) {
        const m = (msg || "").toLowerCase();
        return m.includes("unauthorized") || m.includes("401") || m.includes("no token");
    }

    async function refresh() {
        loading = true;
        error = "";
        needsLogin = false;

        if (!api.token) {
            needsLogin = true;
            loading = false;
            return;
        }

        try {
            const data = await api.listTodos();
            todos = Array.isArray(data) ? data : [];
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load todos";
            if (isUnauthorized(msg)) {
                needsLogin = true;
                todos = [];
            } else {
                error = msg;
            }
        } finally {
            loading = false;
        }
    }

    // --- NEW ACTION FUNCTIONS ---

    async function handleAdd(e: Event) {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        try {
            await api.createTodo({
                title: newTodoTitle.trim(),
                status: "todo" as any
            });
            newTodoTitle = "";
            await refresh(); // Reload the list to get the new ID from the DB
        } catch (err: any) {
            error = err?.message || "Failed to create todo";
        }
    }

    async function handleToggle(todo: Todo) {
        if (!todo.id) return;

        try {
            // Check if it's currently considered done
            const isDone = todo.status === 'done' || todo.status === 'completed' || todo.done || todo.completed;
            const nextStatus = isDone ? 'todo' : 'done';

            await api.updateTodo(todo.id, {
                title: todo.title || "(untitled)",
                status: nextStatus as any
            });
            await refresh();
        } catch (err: any) {
            error = err?.message || "Failed to update todo";
        }
    }

    async function handleDelete(id?: number) {
        if (!id) return;

        try {
            await api.deleteTodo(id);
            await refresh();
        } catch (err: any) {
            error = err?.message || "Failed to delete todo";
        }
    }

    onMount(() => {
        refresh();
    });

    // Normalize the data so the UI always knows what's checked
    $: normalizedTodos = todos.map((t) => {
        const isDone = t.status === 'done' || t.status === 'completed' || t.done || t.completed;
        return {
            ...t,
            title: t.title ?? t.text ?? "(untitled)",
            done: isDone
        };
    });
</script>

<section class="panel">
    <h2>To-dos</h2>

    <div class="controls">
        <button type="button" on:click={refresh} disabled={loading} class="refresh-btn">
            {loading ? "Syncing..." : "Refresh"}
        </button>
    </div>

    {#if loading && todos.length === 0}
        <p class="status-msg">Loading the void...</p>

    {:else if needsLogin}
        <div class="notice">
            <p><strong>SYSTEM LOCK.</strong> Your backend protects <code>/todos</code>.</p>
            <p>Go to your Auth page, log in, then come back and hit Refresh.</p>
        </div>

    {:else}
        {#if error}
            <p class="error">{error}</p>
        {/if}

        <form on:submit={handleAdd} class="add-form">
            <input
                    type="text"
                    bind:value={newTodoTitle}
                    placeholder="What is the bare minimum?"
                    required
            />
            <button type="submit" disabled={!newTodoTitle.trim()}>Add</button>
        </form>

        <ul class="todoList">
            {#each normalizedTodos as todo (todo.id ?? todo.title)}
                <li class:done={todo.done}>
                    <div class="task-info" on:click={() => handleToggle(todo)} role="button" tabindex="0">
                        <div class="checkbox">
                            {todo.done ? "✓" : ""}
                        </div>
                        <span class="title">{todo.title}</span>
                    </div>

                    <button
                            class="delete-btn"
                            on:click|stopPropagation={() => handleDelete(todo.id)}
                            title="Delete task"
                    >
                        ✕
                    </button>
                </li>
            {:else}
                <li class="empty">No tasks found. Go rest.</li>
            {/each}
        </ul>
    {/if}
</section>

<style>
    .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 2.5rem;
        margin: 0 1.5rem;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
    }

    h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-family: 'JetBrains Mono', monospace;
        text-transform: uppercase;
        letter-spacing: -1px;
        color: var(--primary);
    }

    .controls {
        margin-bottom: 2rem;
        display: flex;
        justify-content: flex-end;
    }

    button {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        font-family: 'JetBrains Mono', monospace;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .refresh-btn {
        padding: 0.5rem 1rem;
        font-size: 0.7rem;
        background: transparent;
        border: 1px solid var(--primary);
        color: var(--primary);
    }

    .refresh-btn:hover:not(:disabled) {
        background: var(--primary);
        color: white;
    }

    /* --- ADD FORM --- */
    .add-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .add-form input {
        flex: 1;
        background: rgba(0,0,0,0.2);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        font-family: inherit;
    }

    .add-form input:focus {
        outline: none;
        border-color: var(--primary);
    }

    .add-form button {
        padding: 0 1.5rem;
        font-size: 0.8rem;
    }

    .add-form button:hover:not(:disabled) {
        transform: translateY(-2px);
        filter: brightness(1.2);
    }

    /* --- TODO LIST --- */
    .todoList {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.75rem;
    }

    .todoList li {
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
    }

    .todoList li:hover {
        border-color: var(--text-muted);
    }

    .todoList li.done {
        opacity: 0.5;
        background: rgba(0, 0, 0, 0.1);
        border-color: transparent;
    }

    .todoList li.done .title {
        text-decoration: line-through;
    }

    .task-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
        cursor: pointer;
    }

    .checkbox {
        width: 24px;
        height: 24px;
        border: 2px solid var(--primary);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        font-weight: 900;
        font-size: 1.2rem;
        transition: all 0.2s;
    }

    .todoList li.done .checkbox {
        background: var(--primary);
        color: black;
    }

    .title {
        font-weight: 500;
        color: var(--text);
        font-size: 0.95rem;
    }

    .delete-btn {
        background: transparent;
        color: var(--text-muted);
        padding: 0.5rem;
        font-size: 1rem;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .delete-btn:hover {
        color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
        transform: scale(1.1);
    }

    /* --- SYSTEM MESSAGES --- */
    .notice {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: rgba(255, 0, 85, 0.05);
        border: 1px dashed var(--primary);
    }

    .notice code {
        background: rgba(0,0,0,0.3);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        color: var(--primary);
    }

    .error {
        color: #ff4444;
        font-family: 'JetBrains Mono', monospace;
        background: rgba(255, 68, 68, 0.1);
        padding: 1rem;
        border-left: 4px solid #ff4444;
        margin-bottom: 1.5rem;
    }

    .status-msg, .empty {
        opacity: 0.6;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }
</style>
