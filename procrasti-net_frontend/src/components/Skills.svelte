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
    .error { margin: 0; }
</style>