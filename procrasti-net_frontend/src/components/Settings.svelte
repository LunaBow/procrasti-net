<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";
    import Auth from "./Auth.svelte";

    let loading = true;
    let user: any = null;
    let devMode = false;

    async function checkUser() {
        loading = true;
        try {
            user = await api.getCurrentUser();
            devMode = localStorage.getItem('devMode') === 'true';
        } catch (e) {
            user = null;
        } finally {
            loading = false;
        }
    }

    function toggleDevMode() {
        devMode = !devMode;
        localStorage.setItem('devMode', devMode ? 'true' : 'false');
        window.location.reload(); // Reload to apply changes
    }

    onMount(checkUser);
</script>

<section class="panel">
    <h2>Account & Settings</h2>

    <div class="dev-section">
        <h3>System Access</h3>
        <div class="field check">
            <input type="checkbox" id="dev-toggle" checked={devMode} on:change={toggleDevMode} />
            <label for="dev-toggle">Dev Mode (No login required)</label>
        </div>
        <p class="muted">Warning: Dev Mode only bypasses UI guards. Backend requests might still fail if you don't have a valid token.</p>
    </div>

    <div class="not-implemented">
        <p><strong>Note:</strong> Advanced settings (excluded triggers, themes, etc.) are currently <em>not implemented</em> on the backend.</p>
    </div>

    <div class="auth-section">
        {#if loading}
            <p>Checking authentication...</p>
        {:else if !user && !devMode}
            <div class="auth-prompt">
                <p>Please log in to use this feature.</p>
                <Auth />
            </div>
        {:else}
            <Auth />
        {/if}
    </div>
</section>

<style>
    .panel {
        padding: 2.5rem;
        background: var(--surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
        max-width: 600px;
        margin: 0 auto;
    }
    h2 {
        margin-bottom: 2rem;
        text-align: center;
        color: var(--primary);
    }
    h3 {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        color: var(--text);
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.5rem;
    }
    .dev-section {
        background: var(--surface-alt);
        padding: 1.5rem;
        border-radius: var(--radius-md);
        margin-bottom: 2rem;
    }
    .auth-section {
        margin-top: 2rem;
    }
    .auth-prompt {
        text-align: center;
    }
    .auth-prompt p {
        margin-bottom: 1.5rem;
        color: var(--text-muted);
        font-weight: 500;
    }
    .not-implemented {
        background: rgba(214, 143, 122, 0.1);
        border: 1px solid var(--accent);
        color: var(--accent);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin-bottom: 2rem;
        font-size: 0.9rem;
        text-align: center;
    }
    .muted {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.5rem;
    }
    .check {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        cursor: pointer;
    }
    input[type="checkbox"] {
        width: 1.2rem;
        height: 1.2rem;
        cursor: pointer;
    }
</style>