import { api } from '../../lib/api.ts';
function icsEscape(s=""){ return String(s).replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n"); }

function toICS(events) {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Procrasti-NET//EN",
    ];
    for (const {id, title, startsAt, endsAt} of events) {
        const uid = `${id}@procrasti-net`;
        const dtStart = startsAt.replace(/[-:]/g,"").split(".")[0] + "Z";
        const dtEnd = endsAt.replace(/[-:]/g,"").split(".")[0] + "Z";
        lines.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${icsEscape(e.title)}`,
            "END:VEVENT"
        );
    }
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
}

document.getElementById("exportICS")?.addEventListener("click", async () => {
    const from = document.getElementById("icsFrom").value || new Date().toISOString().slice(0,10);
    const to = document.getElementById("icsTo").value || from;
    const events = await api.listPlan(`${from}T00:00:00.000Z`, `${to}T23:59:59.999Z`);
    const blob = new Blob([toICS(events)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `procrasti-net_${from}_${to}.ics`;
    a.click();
});