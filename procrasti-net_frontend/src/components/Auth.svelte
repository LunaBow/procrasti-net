<script lang="ts">
    import { api } from "../../lib/api";
    import { fade, fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    let isOpen = false;
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

<div class="auth-wrapper">
    {#if !isOpen}
        <button
                class="pill-btn"
                on:click={() => isOpen = true}
                in:fade={{ duration: 200 }}
        >
            Login / Register
        </button>
    {:else}
        <div
                class="authBox"
                in:fly={{ y: -10, duration: 400, easing: cubicOut }}
                out:fade={{ duration: 200 }}
        >
            <button class="close-btn" on:click={() => isOpen = false}>✕</button>

            {#if api.token}
                <div class="top">
                    <div>
                        <h3>{isLogin ? "Login" : "Register"}</h3>
                        <p class="muted">{isLogin ? "Use your email + password." : "Create an account."}</p>
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

                    <button class="submit-btn" type="submit">{isLogin ? "Login" : "Register"}</button>
                </form>
            {/if}
        </div>
    {/if}
</div>

<style>
    .auth-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        position: relative;
        flex-grow: 1;
    }

    .pill-btn {
        display: inline-block;
        background: var(--surface, #18181b);
        color: #d4d4d8;
        border: 1px solid var(--border, #27272a);
        border-radius: 9999px;
        padding: 8px 32px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    }

    .pill-btn:hover {
        color: #fff;
        background: #000;
        border-color: #52525b;
    }


    .close-btn:hover {
        color: #fff;
    }

    .authBox {
        background: var(--surface, #fff);
        border: 1px solid var(--border, #ddd);
        border-radius: 16px;
        padding: 24px;
        width: 100%;
        max-width: 400px;
        position: relative;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        z-index: 50;
    }
    .top {
        display:flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
        margin-top: 8px;
    }
    .muted { margin: 4px 0 0; opacity: 0.7; font-size: 0.9rem; }
    .link { border:0; background:transparent; cursor:pointer; color: var(--primary, #2563eb); font-weight: 800; }
    .ghost { margin-top: 10px; border: 1px solid var(--border, #ddd); background: transparent; border-radius: 999px; padding: 6px 10px; cursor:pointer; }
    .form { margin-top: 12px; display:grid; gap: 10px; }
    label { display:grid; gap: 6px; font-weight: 700; }
    input { padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border, #ddd); background: var(--surface-alt, #f7f7f7); }
    .submit-btn { padding: 10px 12px; border-radius: 12px; border:0; background: var(--primary, #2563eb); color:#fff; font-weight: 900; cursor:pointer; }
    .msg { padding: 10px 12px; border-radius: 12px; font-weight: 800; }
    .error { background: rgba(220, 38, 38, 0.08); color: #b91c1c; border: 1px solid rgba(220, 38, 38, 0.2); }
    .ok { background: rgba(34, 197, 94, 0.08); color: #166534; border: 1px solid rgba(34, 197, 94, 0.2); }
    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #27272a;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: none;
        color: #71717a;
        cursor: pointer;
        z-index: 60; /* Higher than the content */
    }
    .close-btn:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
    }
</style>