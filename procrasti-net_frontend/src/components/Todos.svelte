<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    type Todo = {
        id?: number;
        title?: string;
        text?: string;
        done?: boolean;
        completed?: boolean;
        created_at?: string;
    };

    let todos: Todo[] = [];
    let loading = true;
    let error = "";
    let needsLogin = false;

    function isUnauthorized(msg: string) {
        const m = (msg || "").toLowerCase();
        return m.includes("unauthorized") || m.includes("401") || m.includes("no token");
    }

    async function refresh() {
        loading = true;
        error = "";
        needsLogin = false;

        // If there's no token, don't even try
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

    onMount(() => {
        refresh();
    });

    // Optional: normalize fields if backend uses different names
    $: normalizedTodos = todos.map((t) => ({
        ...t,
        title: t.title ?? t.text ?? "(untitled)",
        done: t.done ?? t.completed ?? false
    }));
</script>

<section class="panel">
    <h2>To-dos</h2>

    <div class="controls">
        <button type="button" on:click={refresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
        </button>
    </div>

    {#if loading}
        <p>Loading to-dos...</p>

    {:else if needsLogin}
        <div class="notice">
            <p><strong>Login required.</strong> Your backend protects <code>/todos</code>.</p>
            <p>
                Go to your Auth page, log in, then come back and hit Refresh.
            </p>
        </div>

    {:else if error}
        <p class="error">{error}</p>

    {:else}
        <ul class="todoList">
            {#each normalizedTodos as todo (todo.id ?? todo.title)}
                <li class:done={todo.done}>
                    <span class="title">{todo.title}</span>
                    <span class="status">{todo.done ? "✓" : ""}</span>
                </li>
            {:else}
                <li class="empty">No to-dos yet.</li>
            {/each}
        </ul>
    {/if}
</section>

<style>
    .controls { margin: 0.5rem 0 1rem; display: flex; gap: 0.5rem; }
    .error { margin: 0; }
    .notice { padding: 0.75rem; border-radius: 12px; background: rgba(0,0,0,0.04); }
    .todoList { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
    .todoList li { padding: 0.75rem; border-radius: 12px; background: rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }
    .todoList li.done { opacity: 0.7; text-decoration: line-through; }
    .empty { opacity: 0.75; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>