<script>
    export let skill;
</script>

<article class="card">
    <h3>{skill.name || skill.title}</h3>
    <p class="muted">{skill.suitability_notes || skill.description || ""}</p>

    <div class="tags">
        {#if skill.intensity}
            <span class="tag">Intensity: {skill.intensity}</span>
        {/if}
        {#if skill.duration_minutes}
            <span class="tag">{skill.duration_minutes} min</span>
        {/if}
        {#if skill.requires_material}
            <span class="tag">Needs Materials</span>
        {/if}
        {#if skill.indoor_outdoor}
            <span class="tag">{skill.indoor_outdoor}</span>
        {/if}
        {#if skill.crisis_safe}
            <span class="tag">Crisis Safe</span>
        {/if}
        {#if !skill.intensity && skill.difficulty}
             <span class="tag">{skill.difficulty}/5</span>
        {/if}
        {#if skill.category}
            <span class="tag">{skill.category}</span>
        {/if}
    </div>

    {#if skill.step_by_step}
        <div class="steps text-sm mt-2">
            {#each (typeof skill.step_by_step === 'string' ? JSON.parse(skill.step_by_step) : (Array.isArray(skill.step_by_step) ? skill.step_by_step : [])) as step}
                <p>• {step}</p>
            {/each}
        </div>
    {/if}

    {#if skill.tags?.length}
        <div class="tags">
            {#each skill.tags as t}
                <span class="tag">{t}</span>
            {/each}
        </div>
    {/if}
</article>