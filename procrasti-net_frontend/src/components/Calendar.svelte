<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../lib/api";

    let fromDate = new Date().toISOString().slice(0, 10);
    let toDate = new Date().toISOString().slice(0, 10);
    let loading = true;
    let error = "";
    let user: any = null;

    let days: any[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    function generateCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Fill leading empty slots
        let tempDays = Array(firstDay).fill(null);

        // Fill actual days
        for (let i = 1; i <= daysInMonth; i++) {
            tempDays.push({
                num: i,
                isToday: i === now.getDate()
            });
        }
        days = tempDays;
    }

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

    onMount(() => {
        checkUser();
        generateCalendar();
    });
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

        <div class="calendar-container">
            <h3>{now.toLocaleString('default', { month: 'long' })} {currentYear}</h3>
            <div class="calendar-grid">
                {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as d}
                    <div class="day-name">{d}</div>
                {/each}

                {#each days as day}
                    <div class="day" class:today={day?.isToday}>
                        {#if day}
                            <span class="date-num">{day.num}</span>
                            {#if day.isToday}
                                <div class="event-indicator" title="Today"></div>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</section>

<style>
    .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 2.5rem;
        margin: 0 1.5rem;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
    }

    h2 {
        margin-top: 0;
        margin-bottom: 2rem;
        font-family: 'JetBrains Mono', monospace;
        text-transform: uppercase;
        letter-spacing: -1px;
        color: var(--primary);
    }

    .export-box {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px dashed var(--border);
        border-radius: var(--radius-md);
        margin-bottom: 2rem; /* Spacing before the grid */
    }

    label {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-muted);
        gap: 0.5rem;
    }

    input[type="date"] {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.6rem;
        border-radius: var(--radius-sm);
        font-family: 'JetBrains Mono', monospace;
    }

    button {
        background: var(--primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-sm);
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.8rem;
        cursor: pointer;
        transition: transform 0.1s ease;
    }

    button:hover:not(:disabled) {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }

    /* --- CALENDAR GRID STYLES --- */
    .calendar-container h3 {
        font-family: 'JetBrains Mono', monospace;
        color: var(--text);
        text-transform: uppercase;
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
    }

    .day-name {
        background: rgba(0, 0, 0, 0.4);
        padding: 0.5rem;
        text-align: center;
        font-size: 0.7rem;
        font-weight: 900;
        color: var(--primary);
        text-transform: uppercase;
    }

    .day {
        background: var(--surface);
        min-height: 80px;
        padding: 0.5rem;
        position: relative;
    }

    .day.today {
        background: rgba(255, 0, 85, 0.05);
    }

    .day.today::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 2px;
        background: var(--primary);
    }

    .date-num {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .event-indicator {
        width: 6px;
        height: 6px;
        background: var(--primary);
        border-radius: 50%;
        margin-top: 4px;
        box-shadow: 0 0 5px var(--primary);
    }

    .error {
        color: #ff4444;
        font-family: 'JetBrains Mono', monospace;
        margin-top: 1rem;
    }

    .auth-wrapper {
        text-align: center;
        padding: 3rem;
        border: 1px dashed var(--border);
        color: var(--text-muted);
        font-style: italic;
    }

    @media (max-width: 700px) {
        .panel { margin: 0 0.5rem; padding: 1.5rem; }
        .export-box { flex-direction: column; align-items: stretch; }
    }
</style>