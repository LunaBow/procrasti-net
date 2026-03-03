<script lang="ts">
    import { onMount } from "svelte";
    import SkillCard from "./SkillCard.svelte";
    import { api } from "../../lib/api";

    type Skill = {
        id?: number;
        title?: string;
        name?: string;
        description?: string;
        category?: string;
        tags?: string[] | string;
    };

    let skills: Skill[] = [];
    let search = "";
    let selectedCategory = "";
    let loading = true;
    let error = "";

    async function loadData() {
        loading = true;
        error = "";

        try {
            const data = await api.listSkills();
            skills = Array.isArray(data) ? data : [];
        } catch (e: any) {
            console.error("Failed to load skills:", e);
            error = e?.message ?? "Failed to load skills";
            skills = [];
        } finally {
            loading = false;
        }
    }

    onMount(loadData);

    $: normalizedSearch = search.trim().toLowerCase();

    $: categories = [
        ...new Set(skills.map((s) => s.category).filter(Boolean) as string[])
    ];

    $: filteredSkills = skills
        .filter((s) => (selectedCategory ? s.category === selectedCategory : true))
        .filter((s) => {
            if (!normalizedSearch) return true;
            const hay = [
                s.title,
                s.name,
                s.description,
                s.category,
                Array.isArray(s.tags) ? s.tags.join(" ") : s.tags
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(normalizedSearch);
        });
</script>

<section class="panel">
    <h2>Skill Database</h2>

    <div class="controls">
        <input
                type="text"
                placeholder="Search skills (e.g. breathing, grounding, planning)"
                bind:value={search}
        />

        <select bind:value={selectedCategory}>
            <option value="">All categories</option>
            {#each categories as cat}
                <option value={cat}>{cat}</option>
            {/each}
        </select>

        <button type="button" on:click={loadData} disabled={loading}>
            Refresh
        </button>
    </div>

    {#if loading}
        <p>Loading skills...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="grid">
            {#each filteredSkills as skill (skill.id ?? skill.title ?? skill.name)}
                <SkillCard {skill} />
            {:else}
                <p>No skills found.</p>
            {/each}
        </div>
    {/if}
</section>

<style>
    .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        margin-left: 100px;
        margin-right: 100px;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
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
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    input, select {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        font-family: inherit;
        flex: 1;
        min-width: 200px;
        transition: all 0.2s ease;
    }

    input:focus, select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(255, 0, 85, 0.2);
    }

    button {
        background: var(--primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }

    button:hover:not(:disabled) {
        filter: brightness(1.2);
        transform: translateY(-2px);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .error {
        color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
        padding: 1rem;
        border-radius: var(--radius-md);
        border: 1px solid #ff4444;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
    }

    p {
        color: var(--text-muted);
        font-style: italic;
    }

    /* Scrollbar styling for the select dropdown */
    select option {
        background: var(--surface-alt);
        color: var(--text);
    }

    @media (max-width: 600px) {
        .controls {
            flex-direction: column;
        }

        button {
            width: 100%;
        }
    }
</style>