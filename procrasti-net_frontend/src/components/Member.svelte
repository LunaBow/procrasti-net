<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    type User = {
        id?: number;
        email?: string;
        display_name?: string;
        username?: string;
        handle?: string;
    };

    let users: User[] = [];
    let loading = true;
    let error = "";

    onMount(async () => {
        try {
            const data = await api.getAllUsers();
            users = Array.isArray(data) ? data : [];
        } catch (err: unknown) {
            console.error("Fehler beim Laden der Member:", err);
            error = "Error loading members.";
        } finally {
            loading = false;
        }
    });
</script>

<div class="auth-page">
    <h2>All Members</h2>

    {#if loading}
        <p>Loading the squad...</p>

    {:else if error}
        <p class="error">{error}</p>

    {:else if users.length === 0}
        <ul class="member-list">
            <li>No members found. Very sad. Anyway</li>
        </ul>

    {:else}
        <ul class="member-list">
            {#each users as user}
                <li class="member-item">
                    <strong>{user.display_name || user.username || user.handle || "Anonymous"}</strong>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .auth-page {
        flex: 1;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .member-list {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .member-item {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.05);
        border: 1px solid var(--border, #ccc);
        border-radius: 8px;
        text-align: center;
        transition: transform 0.2s ease;
    }

    .member-item:hover {
        transform: translateY(-2px);
    }

    .error {
        color: #ff4444;
        font-weight: bold;
    }
</style>