# Procrasti-Net
```text
⠀⠀⠀⠀⠀⠀⠀⢠⣤⣤⣤⡄⠀⠀⠀⠀⠀⠀            .+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.
⠀⠀⠀⠀⣀⠤⠛⠁⠀⠀⠀⠘⠛⠤⣀⠀⠀⠀           (                                        _   _                  _         )
⠀⠀⠀⣶⠉⠀⠀⣀⣀⣀⣀⡀⠀⠀⢙⡆⠀⠀            )    _ __  _ __ ___   ___ _ __ __ _ ___| |_(_)      _ __   ___| |_      (
⠀⠀⣸⠀⣀⡴⠛⠁⠈⠀⠁⠙⠛⣤⠀⢸⠀⠀           (    | '_ \| '__/ _ \ / __| '__/ _` / __| __| |_____| '_ \ / _ \ __|      )
⠀⢸⡇⣄⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡀⣿⠀            )   | |_) | | | (_) | (__| | | (_| \__ \ |_| |_____| | | |  __/ |_      (
⢠⣼⣧⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢣⣿⣤           (    | .__/|_|  \___/ \___|_|  \__,_|___/\__|_|     |_| |_|\___|\__|      )
⠸⣿⣿⠄⠀⠀⡖⢶⡂⠀⢰⡖⣶⠀⠀⢸⣿⣿            )   |_|                                                                 (
⢸⣿⣿⠂⠀⠀⡇⢽⡂⠀⢸⡇⣿⠀⠀⢸⣿⣿           (                                                                         )
⢨⣿⣿⡁⠀⠀⡇⣽⠂⠀⢸⡇⣿⠀⠀⢸⣿⣿            "+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+.+"+
⠀⠀⢸⡁⠀⠀⠛⠛⠁⠀⠘⠛⠛⠀⠀⢸⡁
⠀⠀⢸⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠄
⠀⠀⢸⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠄
⠀⠀⢸⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠂
⠀⠀⢸⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡁
⠀⠀⢸⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠄
⠀⠀⠸⣁⠀⠀⣠⣀⠀⢀⣠⢄⡀⠀⠀⣸⠂
⠀⠀⠀⠉⢶⡶⠁⠈⢷⡎⠁⠈⢱⠶⠾⠁

```

---
A full-stack productivity + well-being tracker (not really, we tried) :
MariaDB/MySQL → Node/Express/TypeScript REST API (+ WebSockets) → Astro + Svelte frontend.


If you’re reading this because you’re grading it: hello, pls don't kill us 👋

If you’re reading this because you’re expanding or debugging it: rest in peace 🫡

        .-.
       (o o)   "ship it" ✦
       | O \
       |   |
        \  \
         `~~~'
---

Authors:

Verena Klaghofer --> mt241068
Luna Moser       --> mt231043
Gemini Ai        --> thank you for your service, and sorry Umwelt und Integrität o7

---

## Navigation & Links

 Database
- phpMyAdmin: https://node.ustp.cloud/manage_database/index.php?route=/&route=%2F&db=node_mt231043_10992

 Backend API
- Live: https://mt231043-10992.node.ustp.cloud  
- Repos: https://github.com/LunaBow/procrasti_net_api.git | https://gitlab.com/LunaBow/procrasti_net_api.git

 Frontend Client
- Live: https://mt231043-10993.node.ustp.cloud  
- Repos: https://github.com/LunaBow/procrasti_net_frontend | https://gitlab.com/LunaBow/procrasti_net_frontend.git

---

## What it does(n't)

- Auth: register/login, password hashing, JWT sessions
- Tasks: CRUD, status workflow, effort-ish fields
- Routines: recurring habits + logs
- Skills: categories → skills → exercises + tags
- State check-ins: mood/tension/energy logging
- Realtime: WebSocket chat + typing indicators (if enabled)

```text
   ┌────────────────────────────┐
   │  "It works on my machine"  │
   └──────────────┬─────────────┘
                  │
                  v
           ┌─────────────┐
           │  production  │
           └─────────────┘
                 (🔥) <-- this is us (and filezilla)
```

---

## Tech stack

Backend:
- Node.js + Express
- TypeScript
- MariaDB/MySQL via `mysql2` pooling
- Zod runtime validation
- JWT + bcrypt
- `ws` WebSockets

Frontend:
- Astro (routing/layout, islands architecture)
- Svelte (interactive islands)
- TypeScript + vanilla JS helpers
- global CSS + component styles

---

## Architecture (high level)

```text
┌────────────────────┐        HTTPS/JSON         ┌─────────────────────────┐
│  Astro Frontend     │  ───────────────────────▶ │  Express REST API        │
│  + Svelte islands   │                          │  (TypeScript)            │
└─────────┬──────────┘                          └──────────┬──────────────┘
          │  WS (/ws)                                         │ mysql2 pool
          └───────────────────────────────────────────────────┘
                                                   ┌─────────────────────────┐
                                                   │  MariaDB/MySQL           │
                                                   │  (phpMyAdmin on USTP)    │
                                                   └─────────────────────────┘
```

```text
  _._     _,-'""`-._
(,-.`._,'(       |\`-/|
    `-.-' \ )-`( , o o)
          `-    \`_`"'-
   "code review cat" doesn't want to be here anymore :(
```

---

## Directory Structures

### Backend
```text
procrasti_net_backend/
├── public/
│   ├── index.html
│   └── script.js
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── controllers/
│   │   └── index.ts
│   ├── db/
│   │   ├── connection.ts
│   │   └── schema.sql
│   ├── repositories/
│   │   └── index.ts
│   ├── routes/
│   │   └── index.ts
│   ├── schemas/
│   │   └── validation.ts
│   ├── services/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Frontend
```text
procrasti_net_frontend/
├── public/
│   ├── fonts/
│   ├── MOVIES/
│   ├── PICS/
│   └── scripts/
├── src/
│   ├── components/
│   │   ├── Art.astro
│   │   ├── BareMinimum.astro
│   │   ├── Boot.astro
│   │   ├── CalendarPanel.astro
│   │   ├── Footer.astro
│   │   ├── HabitTracker.astro
│   │   ├── Header.astro
│   │   ├── JoinContent.astro
│   │   ├── Member.astro
│   │   ├── Navigation.astro
│   │   ├── Payment.astro
│   │   ├── Planner.astro
│   │   ├── SettingsPanel.astro
│   │   ├── SkillBrowser.astro
│   │   ├── SkillCard.svelte
│   │   ├── TaskForm.svelte
│   │   └── TodoBoard.astro
│   ├── lib/
│   │   └── apiClient.ts
│   ├── pages/
│   │   ├── category/
│   │   │   └── [...category].astro
│   │   ├── Row1/
│   │   │   ├── app.astro
│   │   │   ├── habits.astro
│   │   │   ├── planner.astro
│   │   │   ├── settings.astro
│   │   │   ├── skills.astro
│   │   │   └── todos.astro
│   │   ├── Row2/
│   │   │   ├── art.astro
│   │   │   ├── bare-minimum.astro
│   │   │   ├── boot.astro
│   │   │   ├── members.astro
│   │   │   └── reality-check.astro
│   │   └── index.astro
│   ├── scripts/
│   │   ├── API-Client.js
│   │   ├── calendar.js
│   │   ├── displayGallery.js
│   │   ├── habits.js
│   │   ├── planner.js
│   │   ├── register.js
│   │   ├── settings.js
│   │   ├── showAllMembers.js
│   │   ├── skills.js
│   │   ├── slideshow.js
│   │   ├── state.js
│   │   ├── switchContent.js
│   │   ├── switchTheme.js
│   │   ├── todos.js
│   │   ├── ui.js
│   │   └── uploadArt.js
│   └── styles/
│       ├── app.css
│       └── global.css
├── main.ts
├── astro.config.mjs
├── package.json
├── package-lock.json
├── svelte.config.js
└── tsconfig.json
```

---

## Back End: Procrasti-Net API

Overview: a RESTful API for tasks, routines, skills, and state tracking, backed by MySQL/MariaDB, plus a WebSocket server for realtime features.

Layered architecture:
- Controllers: request parsing + schema validation + response formatting
- Services: business logic (hashing, rules, orchestration)
- Repositories: raw SQL access via mysql2 (parameterized queries)
- Schemas: Zod runtime validation
- WebSockets: `/ws` for chat + typing indicators
- CORS: allow local dev + deployed frontend

```text
   [HTTP]        [Logic]         [SQL]
  routes ──▶ controllers ──▶ services ──▶ repositories ──▶ db
                      ▲
                      └── Zod validation (guard dog)
```

---text
⣐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣶⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣅⡠⠃⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢹⣿⣇⡀⠀⠀⠀⢀⣤⣤⣤⣾⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀      its morbin time
⢸⣿⣿⣷⡀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣶
⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⡀⠀⠀⠀⣀⣀⣤⣾
⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
⠀⠀⠉⠙⠉⠉⠁⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⠟⠋⠁⠀⠀
```

## Front End: Procrasti-Net Frontend

Overview: Astro for routing/layout and fast pages, Svelte for interactive islands (auth, forms, trackers). Centralized API client attaches Bearer tokens and handles auth failures.

```text
Astro page (fast) + Svelte island (reactive)
= "best of both worlds" (and twice the ways to break it)
```

---

## Database

Schema supports:
- users + settings
- categories/skills/exercises + tags
- tasks + chunks
- routines + logs
- state logs + exercise runs + feedback

SQL file location:
- `procrasti_net_backend/src/db/schema.sql`

USTP note:
- No `CREATE DATABASE` on USTP. `USE <your_assigned_db>;` instead.
- Rebuild flow: `SET FOREIGN_KEY_CHECKS=0;` → drop/create → `SET FOREIGN_KEY_CHECKS=1;`

---

## Local development

Prereqs:
- Node.js (LTS recommended)
- npm
- MySQL/MariaDB (local or USTP)

Backend:
```bash
cd procrasti_net_backend
npm install
npm run dev
```

Frontend:
```bash
cd procrasti_net_frontend
npm install
npm run dev
```

Example backend `.env`:
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db
JWT_SECRET=change_me
CORS_ORIGINS=http://localhost:4321,http://localhost:5173
```

---

## Deployment notes (USTP cloud)

- Do not upload `node_modules/`. Ever. Not once. No, Excluded and .gitignore might not safe you
- Make sure `package.json` scripts match how the platform starts Node (`start` vs `dev`).
- CORS must include the deployed frontend URL.
- If Postman works but the browser doesn’t: it’s CORS or missing `Authorization: Bearer <token>`.

```text
  node_modules/ uploaded?
  ┌──────────────────────────┐
  │  congratulations, you’ve │
  │  invented suffering       │
  └──────────────────────────┘
```

---

## License / attribution
Student project + portfolio build.
Excessive AI Use
Use responsibly. Don’t be weird.

---

## Bonus Loredrop:

If you find a file called `ReadMe.md (i am lying)`, no you didn’t.

```text
      _____|~~\_____      _____________
  _-~               \    |    \
  _-    | )     \    |__/   \   \
  _-         )   |   |  |     \  \        <---- WISH THAT WAS ME LOL
  _-    | )     /    |--|      |  |
 __-_______________ /__/_______|  |_________
(                |----         |  |
 `---------------'--\\\\      .`--'
                              `||||

```

---

## 🧾 The “why am I like this” dataset

```text
SLEEP: 22h

AWAKE:
* Total Awake Time: 119h
* Longest Continuous Awake Phase: 42h
* Sleep per day: ~3.7h

Side Notes:
→ my brain was so cooked
→ i solved a case as Detective Loons Bow McQueen
→ times cried uncontrollably about being lonely and depressed and hating myself: 4
→ times laughed uncontrollably like a complete Lunatic: 13

Media Consumption:
→ GameChanger: Every single episode (background noise for the void)
→ Spotify: 1,023 streams / 3,257 min

Overall Impressions:
→ really stupid and not recommendable
→ Organversagen any% speedrun?
→ still not the dumbest thing i ever did
→ Dont ask me how i did it i just did it it was hard.
```

```text
 ,_     _
 |\\_,-~/
 / _  _ |    ,--.
(  @  @ )   / ,-'
 \  _T_/-._( (
 /         `. \       "what the dog doin?"
|         _  \ |
 \ \ ,  /      |
  || |-_\__   /
 ((_/`(____,-'

```
