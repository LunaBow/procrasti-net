<script lang="ts">
    import { api } from "../../lib/api";

    let isLogin = true;
    let error = "";
    let ok = "";
    let formData = {
        email: "",
        password: "",
        display_name: "",
    };

    async function handleSubmit() {
        error = "";
        ok = "";
        try {
            if (isLogin) {
                await api.login({ email: formData.email.trim(), password: formData.password });
                ok = "Logged in ✅";
                // optional: refresh page so components load data
                window.location.reload();
            } else {
                await api.register({
                    email: formData.email.trim(),
                    password: formData.password,
                    display_name: formData.display_name.trim() || formData.email.split("@")[0],
                    handle: formData.email.split("@")[0],
                });
                isLogin = true;
                ok = "Registered ✅ Now log in.";
                formData.password = "";
            }
        } catch (err: any) {
            error = err?.message || "Operation failed";
        }
    }

    function logout() {
        api.logout();
        window.location.reload();
    }
</script>

<div class="authBox">
    {#if api.token}
        <div class="top">
            <div>
                <h3>Welcome back!</h3>
                <p class="muted">You are logged in.</p>
            </div>
            <button class="ghost" type="button" on:click={logout}>Logout</button>
        </div>
    {:else}
        <div class="top">
            <div>
                <h3>{isLogin ? "Login" : "Register"}</h3>
                <p class="muted">{isLogin ? "Use your email + password." : "Create an account."}</p>
            </div>

            <button class="link" on:click={() => { isLogin = !isLogin; error=""; ok=""; }}>
                {isLogin ? "New here?" : "Already have one?"}
            </button>
        </div>

        {#if error}
            <div class="msg error">{error}</div>
        {/if}
        {#if ok}
            <div class="msg ok">{ok}</div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="form">
            <label>
                Email
                <input type="email" required bind:value={formData.email} placeholder="name@example.com" />
            </label>

            {#if !isLogin}
                <label>
                    Display name
                    <input type="text" required bind:value={formData.display_name} placeholder="Luna etc." />
                </label>
            {/if}

            <label>
                Password
                <input type="password" required bind:value={formData.password} placeholder="••••••••" />
            </label>

            <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
    {/if}
</div>

<style>
    .authBox {
        background: var(--surface, #fff);
        border: 1px solid var(--border, #ddd);
        border-radius: 16px;
        padding: 16px;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        /* Ensure it doesn't stick to the top if there's flex behavior elsewhere */
        position: relative;
    }
    .top { display:flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .muted { margin: 4px 0 0; opacity: 0.7; font-size: 0.9rem; }
    .link { border:0; background:transparent; cursor:pointer; color: var(--primary, #2563eb); font-weight: 800; }
    .ghost { margin-top: 10px; border: 1px solid var(--border, #ddd); background: transparent; border-radius: 999px; padding: 6px 10px; cursor:pointer; }
    .form { margin-top: 12px; display:grid; gap: 10px; }
    label { display:grid; gap: 6px; font-weight: 700; }
    input { padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border, #ddd); background: var(--surface-alt, #f7f7f7); }
    button[type="submit"] { padding: 10px 12px; border-radius: 12px; border:0; background: var(--primary, #2563eb); color:#fff; font-weight: 900; cursor:pointer; }
    .msg { padding: 10px 12px; border-radius: 12px; font-weight: 800; }
    .error { background: rgba(220, 38, 38, 0.08); color: #b91c1c; border: 1px solid rgba(220, 38, 38, 0.2); }
    .ok { background: rgba(34, 197, 94, 0.08); color: #166534; border: 1px solid rgba(34, 197, 94, 0.2); }
</style>