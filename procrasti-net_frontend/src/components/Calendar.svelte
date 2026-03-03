<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    let fromDate = new Date().toISOString().slice(0, 10);
    let toDate = new Date().toISOString().slice(0, 10);
    let loading = true;
    let error = "";
    let user: any = null;

    function icsEscape(s = "") {
        return String(s).replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
    }

    function toICS(events: any[]) {
        const lines: string[] = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Procrasti-NET//EN"];
        for (const e of events) {
            const start = String(e.startsAt || "");
            if (!start) continue;
            const dt = start.replace(/[-:]/g, "").split(".")[0].replace(" ", "T") + "Z";
            lines.push("BEGIN:VEVENT", `UID:${e.id}@procrasti-net`, `DTSTART:${dt}`, `DTEND:${dt}`, `SUMMARY:${icsEscape(e.title || "Task")}`, "END:VEVENT");
        }
        lines.push("END:VCALENDAR");
        return lines.join("\r\n");
    }

    async function checkUser() {
        loading = true;
        try { user = await api.getCurrentUser(); }
        finally { loading = false; }
    }

    async function exportICS() {
        if (!user) return;
        loading = true;
        error = "";
        try {
            const todos = await api.listTodos();
            const events = (todos || [])
                .filter((t: any) => t?.due_date)
                .filter((t: any) => {
                    const d = String(t.due_date).slice(0, 10);
                    return d >= fromDate && d <= toDate;
                })
                .map((t: any) => ({ id: t.id, title: t.title, startsAt: t.due_date }));

            const blob = new Blob([toICS(events)], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `procrasti-net_${fromDate}_${toDate}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e: any) {
            error = e?.message ?? "Export failed";
        } finally {
            loading = false;
        }
    }

    onMount(checkUser);
</script>

<section class="panel">
    <h2>Calendar Export</h2>

    {#if !user && !loading}
        <div class="auth-wrapper">
            <p>Please log in to use this feature.</p>

        </div>
    {:else}
        <div class="export-box">
            <label>From <input type="date" bind:value={fromDate} /></label>
            <label>To <input type="date" bind:value={toDate} /></label>

            <button type="button" on:click={exportICS} disabled={loading}>
                {loading ? "Exporting…" : "Download .ics"}
            </button>

            {#if error}<p class="error">{error}</p>{/if}
        </div>
    {/if}
</section>