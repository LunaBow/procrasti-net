<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    let selectedDate = new Date().toISOString().slice(0, 10);
    let items: any[] = [];
    let loading = true;
    let error = "";
    let user: any = null;

    async function loadPlan() {
        loading = true;
        error = "";
        try {
            user = await api.getCurrentUser();
            if (!user) { items = []; return; }

            const todos = await api.listTodos();
            items = (todos || []).filter((t: any) => String(t.due_date || "").slice(0, 10) === selectedDate);
        } catch (e: any) {
            error = e?.message ?? "Failed to load plan";
            items = [];
        } finally {
            loading = false;
        }
    }

    onMount(loadPlan);
</script>

<section class="panel">
    <h2>Daily Planner</h2>

    <div class="controls">
        <input type="date" bind:value={selectedDate} on:change={loadPlan} />
        <button type="button" on:click={loadPlan} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
    </div>

    {#if !user && !loading}
        <div class="auth-wrapper">
            <p>Please log in to use this feature.</p>

        </div>
    {:else}
        {#if error}<p class="error">{error}</p>{/if}
        {#if loading}
            <p>Loading…</p>
        {:else}
            <ul class="todoList">
                {#each items as t (t.id)}
                    <li>
                        <span class="title">{t.title}</span>
                        <span class="pill">{t.status}</span>
                    </li>
                {:else}
                    <li class="empty">Nothing scheduled for this day.</li>
                {/each}
            </ul>
        {/if}
    {/if}
</section>