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
    .create-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }
    .create-form input {
        flex: 1;
        padding: 0.75rem;
        border-radius: 12px;
        border: 1px solid var(--border, #ddd);
    }
    .create-form button {
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        border: 0;
        background: var(--primary, #2563eb);
        color: white;
        font-weight: 700;
        cursor: pointer;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
    }
    .card {
        padding: 1.25rem;
        background: var(--surface-alt, #f9f9f9);
        border-radius: 16px;
        border: 1px solid var(--border, #eee);
    }
    .streak {
        margin: 0.5rem 0 1rem;
        font-size: 0.9rem;
        color: var(--text-muted, #666);
    }
    .check-btn {
        width: 100%;
        padding: 0.6rem;
        border-radius: 999px;
        border: 1px solid var(--primary, #2563eb);
        background: transparent;
        color: var(--primary, #2563eb);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .check-btn:hover {
        background: var(--primary, #2563eb);
        color: white;
    }
</style>