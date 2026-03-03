<script>
    import Skills from './Skills.svelte';
    import Todos from './Todos.svelte';
    import Habits from './Habits.svelte';
    import Planner from './Planner.svelte';
    import Settings from './Settings.svelte';
    import Calendar from './Calendar.svelte';
    import { onMount } from 'svelte';



    let activeTab = 'skills';

    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (['skills', 'todos', 'habits', 'planner', 'settings', 'calendar'].includes(hash)) {
            activeTab = hash;
        }
    }

    onMount(() => {
        handleHash();
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    });

    function setTab(tab) {
        activeTab = tab;
        window.location.hash = tab;
    }
</script>

<div class="app-container">
    <nav class="tab-nav">
        <button class:active={activeTab === 'skills'} on:click={() => setTab('skills')}>Skills</button>
        <button class:active={activeTab === 'todos'} on:click={() => setTab('todos')}>Todos</button>
        <button class:active={activeTab === 'habits'} on:click={() => setTab('habits')}>Habits</button>
        <button class:active={activeTab === 'planner'} on:click={() => setTab('planner')}>Planner</button>
        <button class:active={activeTab === 'calendar'} on:click={() => setTab('calendar')}>Calendar</button>
        <button class:active={activeTab === 'settings'} on:click={() => setTab('settings')}>Settings</button>
    </nav>

    <main class="tab-content">
        {#if activeTab === 'skills'}
            <Skills />
        {:else if activeTab === 'todos'}
            <Todos />
        {:else if activeTab === 'habits'}
            <Habits />
        {:else if activeTab === 'planner'}
            <Planner />
        {:else if activeTab === 'calendar'}
            <Calendar />
        {:else if activeTab === 'settings'}
            <Settings />
        {/if}
    </main>
</div>

<style>
    .app-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.25rem;
    }

    .tab-nav {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        border-bottom: 2px solid var(--border);
        padding-bottom: 0.5rem;
        overflow-x: auto;
    }

    .tab-nav button {
        padding: 0.55rem 0.9rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        color: var(--text-muted);
        white-space: nowrap;
        transition: all 0.2s;
    }

    .tab-nav button.active {
        color: var(--text);
        border-color: var(--border);
        background: var(--surface-alt);
    }

    .tab-content {
        padding-top: 0.5rem;
    }
</style>