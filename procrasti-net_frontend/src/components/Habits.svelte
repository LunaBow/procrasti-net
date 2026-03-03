<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    let habits: any[] = [];
    let loading = true;
    let error = "";
    let name = "";
    let user: any = null;

    async function loadData() {
        loading = true;
        error = "";
        try {
            user = await api.getCurrentUser();
            if (user) {
                habits = await api.listHabits();
            }
        } catch (e: any) {
            error = e?.message ?? "Failed to load habits";
            user = null;
        } finally {
            loading = false;
        }
    }

    async function handleCreate(e: Event) {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await api.createHabit({ name: name.trim() });
            name = "";
            await loadData();
        } catch (e: any) {
            error = e?.message ?? "Failed to create habit";
        }
    }

    async function handleCheck(id: string | number) {
        try {
            const today = new Date().toISOString().slice(0, 10);
            await api.checkHabit(id, today);
            await loadData();
        } catch (e: any) {
            error = e?.message ?? "Failed to check habit";
        }
    }

    onMount(loadData);
</script>

<section class="panel">
    <h2>Habit Tracker</h2>

    {#if !user && !loading}
        <div class="auth-wrapper">
            <p>Please log in to track your habits.</p>
        </div>
    {:else}
        <form on:submit={handleCreate} class="create-form">
            <input type="text" bind:value={name} placeholder="New habit name..." required />
            <button type="submit">Add Habit</button>
        </form>

        {#if loading}
            <p>Loading...</p>
        {:else if error}
            <p class="error">{error}</p>
        {/if}

        <div class="grid">
            {#each habits as h (h.id)}
                <article class="card">
                    <h3>{h.name}</h3>
                    <p class="streak">Streak: <strong>{h.streak ?? 0}</strong></p>
                    <button type="button" class="check-btn" on:click={() => handleCheck(h.id)}>
                        Mark Done Today
                    </button>
                </article>
            {:else}
                {#if !loading}
                    <p>No habits yet. Start one above!</p>
                {/if}
            {/each}
        </div>
    {/if}
</section>

<style>
    .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 2.5rem;
        /* Horizontal margins added as requested */
        margin: 0 1.5rem;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
    }

    h2 {
        margin-top: 0;
        margin-bottom: 2rem;
        font-family: 'JetBrains Mono', monospace;
        text-transform: uppercase;
        letter-spacing: -1px;
        color: var(--primary);
    }

    .create-form {
        display: flex;
        gap: 1rem;
        margin-bottom: 3rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 1rem;
        border-radius: var(--radius-md);
        border: 1px dashed var(--border);
    }

    .create-form input {
        flex: 1;
        padding: 0.75rem 1rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text);
        font-family: inherit;
    }

    .create-form input:focus {
        outline: none;
        border-color: var(--primary);
    }

    .create-form button {
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-sm);
        border: 0;
        background: var(--primary);
        color: white;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 1px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .create-form button:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .card {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: border-color 0.3s ease;
    }

    .card:hover {
        border-color: var(--primary);
    }

    h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text);
    }

    .streak {
        margin: 1rem 0 1.5rem;
        font-size: 0.85rem;
        font-family: 'JetBrains Mono', monospace;
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .streak strong {
        color: var(--primary);
        font-size: 1.2rem;
        margin-left: 0.5rem;
    }

    .check-btn {
        width: 100%;
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--primary);
        background: transparent;
        color: var(--primary);
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .check-btn:hover {
        background: var(--primary);
        color: white;
        box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);
    }

    .error {
        color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin-bottom: 1rem;
        font-family: 'JetBrains Mono', monospace;
    }

    .auth-wrapper {
        text-align: center;
        padding: 3rem;
        border: 1px dashed var(--border);
        color: var(--text-muted);
        font-style: italic;
    }

    @media (max-width: 600px) {
        .create-form {
            flex-direction: column;
        }
        .panel {
            margin: 0 0.5rem;
            padding: 1.5rem;
        }
    }
</style>