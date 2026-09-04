# Sistema Life Engine

# SISTEMA — Design Brief / Build Prompt

> **How to use this file.** Paste the whole thing into Lovable, Relume, v0, Framer AI, Subframe, etc.

> It's written in English (these tools produce their best work in English), but **all user-facing copy must stay in Russian** — the exact strings are given per screen. If you'd rather feed a fully-Russian prompt, the same content translates 1:1.

> The backend already exists (Laravel REST API); this is a **frontend redesign** of an existing, working product — do not invent new data, keep the screens and data shapes below.

---

## 1. Product in one line

**SISTEMA** — a *lifelong* habit tracker with a real game engine and a social layer. It replaces "Notion + notes": you track habits day by day, earn XP for verifiable actions, climb levels, keep streaks, walk a 30-stage program, and compete with friends. Multi-user, privacy-first, web now / mobile later.

Think: **Duolingo's motivation + Notion's calm structure + an RPG character sheet — for building a disciplined life.**

## 2. Who it's for & the feeling

- **Audience:** ambitious self-improvers, 18–40, who bounced off spreadsheets and sterile trackers. They want their discipline to *feel* rewarding.

- **Emotional target:** *powerful, premium, motivating, calm-but-alive.* Not childish, not corporate-SaaS-bland. A tool you're proud to open every morning.

- **Tone of copy (Russian):** direct, warm, a little tough-love. Short. E.g. "Срыв не наказывается. Вернись с малого." / "Сегодня закрой одну привычку — одно точное действие."

## 3. Visual direction (make it strong)

- **Signature:** a confident single accent (energetic green `#22C55E`-ish for "done / progress / XP"), a warm secondary for streaks/fire (amber/orange), restrained neutrals for structure. Feel free to refine into a richer palette — gradients on XP/level elements, subtle glow on streak flame.

- **Dual theme, first-class:** ship **light and dark** with a toggle. Dark is deep near-black (`~#0B0E13`) with elevated cards, not flat gray. Define everything as design tokens (color, spacing, radius, typography, shadow) so both themes and future mobile share them.

- **Type:** modern geometric/grotesk display for numbers & headings (levels, XP, %), highly legible sans for body. Big, proud numerals — this app is full of stats.

- **Shape language:** generous rounded cards (16–20px), soft shadows, clear grid. Density that respects a data-heavy month view without feeling like a spreadsheet.

- **Motion:** tasteful. Check animates in, XP bar fills, level-up pulses, streak flame flickers, confetti on milestones/boss clears. Never gratuitous.

- **Responsive & mobile-minded:** desktop-first layouts that gracefully collapse; mobile app is planned on the same API, so keep components thumb-friendly.

## 4. Global shell

- **Top app bar (persistent):** wordmark **SISTEMA.** · primary nav tabs · right cluster = **Focus/Pomodoro mini-widget** (see §12) · theme toggle · **HUD** (level + XP bar + streak) · avatar/name · logout.

- **Primary nav (Russian labels):** `Планер` · `Аналитика` · `Рейтинг` · `Путь` · `Стойкость` · (gear) `Настройки`.

- **HUD (always visible):** `Lv {n}` · XP progress bar toward next level with `{into}/{span} XP` · streak `🔥 {days}`. This is the emotional heartbeat — design it beautifully (level badge, animated gradient XP bar, flame).

## 5. Screen — `Планер` (Tracker) · route `/`

The core daily surface. A **month grid: habits (rows) × days (columns)**.

- Header: month title + prev/next arrows, "today" affordance, an **"Новая привычка…"** input + **`Добавить`** button, optional emoji/icon picker per habit.

- Grid: each habit row has name (+ edit ✎ / delete 🗑 on hover), a cell per day; tapping a cell toggles a **check** (animated ✓). A per-row **Σ** count of checks. Bottom summary rows: **`Выполнено`** (completions per day) and **`Настроение`** (mood dot per day).

- **Day rating modal:** clicking a day opens a modal to rate the day — **`настроение`** and **`мотивация`** (1–5 sliders/emojis) + a free **note**.

- Live feedback: checking a habit visibly bumps the HUD (XP + streak) — surface a small "+XP" toast/animation.

Empty state: encouraging prompt to add the first habit.

## 6. Screen — `Аналитика` (Analytics) · route `/analytics`

Month-scoped dashboard. Calm, infographic, premium.

- Month switcher (prev/next).

- **Hero completion ring** — big circular progress, `{rate}%` "выполнено" in the center.

- **Stat tiles:** `отметок / {possible}` (checks), `идеальных дней` (perfect days), `активных дней`, `привычек`, `настроение (сред.)`, `мотивация (сред.)`. Use em-dash `—` when no data.

- **`По неделям`** — weekly completion bars (label `нед {N}`, `{rate}%`).

- **`Настроение и мотивация`** — a dual-line SVG chart over the month (two series: `настроение`, `мотивация`), with an empty state "Нет оценок дня в этом месяце."

- Optional: top habits with their current/longest streaks.

## 7. Screen — `Рейтинг` / Community · route `/community`

The social hub. Several stacked cards.

1. **`Лига недели`** (weekly friend league) — card showing tier name (`Дерево → Бронза → Серебро → Золото → Платина → Алмаз`), your rank `#{n} / {total}`, a **tier progress bar** with `{my_xp} XP · до «{next_tier}»: {next_xp}`. Make tiers feel collectible (badges, tier color).

2. **Leaderboard controls:** three segmented toggles —

   - metric: `XP` · `Уровень` · `Серия`

   - period: `Неделя` · `Месяц` · `Всё время`

   - scope: `Все` · `Друзья`

   - plus a checkbox **`Показывать меня в рейтинге`** (visibility) with helper "включи видимость, чтобы попасть в рейтинг".

3. **Leaderboard list:** ranked rows (rank badge with podium styling for top-3, name, `Lv`, `🔥 streak`, score + unit); highlight "вы".

4. **`Лента`** (activity feed): events with icons — `⭐` level-up, `🔥` streak milestone, `🏆` achievement, `👑` boss cleared — each with reaction buttons **👍 / 🔥** and counts.

5. **`Друзья`:** incoming requests (`Принять` / decline ✕), and "Мои друзья" list (name, `Lv`, `🔥`, remove 🗑).

6. **`Участники`:** public members with a relation-aware action — **`В друзья`** / `заявка отправлена` / `ждёт вашего ответа` / `в друзьях` / `вы`.

## 8. Screen — `Путь` (Journey / 30-stage program) · route `/journey`

A guided 30-day transformation path.

- Header: `ПУТЬ · ДЕНЬ {n}`, big **`Пройдено {done} / 30`** with an overall % bar.

- **Attribute tiles** earned on boss weeks: `Дисциплина`, `Устойчивость`, `Характер`, `Внутренний стержень` (numeric).

- **Weeks as sections** (`Неделя 1..N`), each a row of **day tiles**. Tile states: **done** (✓, green), **open** (highlighted, tappable), **locked** (🔒), **boss** day (👑, special styling). Sequential unlock — only the next day is open.

- **Stage modal:** title (e.g. "День 2. Одно Действие"), a short lesson paragraph, a **`Рефлексия`** textarea ("Что получилось сегодня…"), and **`Завершить день`** / `Закрыть`. Completing advances the path.

Make this screen feel like a **map / quest line** — momentum and reward, boss weeks as milestones.

## 9. Screen — `Стойкость` (Resilience) · route `/resilience`

Anti-fragility tools for bad days.

1. **`Миссия дня`** — a single daily micro-mission card ("Сегодня закрой привычку «X» — одно точное действие"), state `✓ выполнено` or a **`Выполнить` +15 XP** action.

2. **`Boss-дни`** — schedule hard days you know are coming: a date picker + strategy input ("Стратегия: пороги вместо целей…") + **`Запланировать`**; list of boss-days with status `пройден` / scheduled / failed and a **resolve** action (survived = +50 XP + attribute).

3. **`Протокол возврата`** (return protocol) — after a lapse: helper "Срыв не наказывается. Вернись с малого — история и уровень цели." + **`Записать возврат`**; list of returns (date, trigger, reflection).

Tone here: compassionate, anti-shame. Soft colors, supportive.

## 10. Screen — `Настройки` (Settings) · route `/settings`

Titled **`Профиль и данные`**. Cards:

- **`Профиль`:** `Отображаемое имя` (placeholder "Как тебя видят другие"), **`Видимость профиля`** select (`Приватный` / `Только друзья` / `Публичный (в рейтинге)`), read-only `Таймзона`, **`Сохранить`**.

- **`Данные`:** "Забери всё, что накопил: привычки, отметки, XP, программа, миссии." + **`Скачать мои данные (JSON)`** (export).

- **`Вебхуки`:** "События (уровень, серия, достижение, boss) уходят POST-запросом на твой адрес — Telegram-бот, Discord, Zapier." + URL input + **`Добавить`**; list of configured hooks with active toggle / delete.

## 11. Auth · routes `/login`, `/register`

Minimal centered card: wordmark **SISTEMA.** with an eyebrow (`ВХОД` / `РЕГИСТРАЦИЯ`), `Email`, `Пароль` (+ name on register), **`Войти`** / **`Зарегистрироваться`**, and a link to switch. Make the first impression premium — this sets the tone.

## 12. NEW feature to design — **`Фокус` / Pomodoro timer**

Add a **Pomodoro / focus-timer** system to track time spent executing tasks & habits. Design both a **dedicated screen** and a **persistent header mini-widget**.

**Header mini-widget (in the app bar):**

- Idle: a small **`Фокус`** button (timer/tomato icon).

- Running: compact ring/countdown `24:13` + pause/stop; clicking expands the full focus view. Keeps running across screens.

**Focus screen — `/focus` (new nav tab `Фокус`):**

- **Big circular timer** (the hero) with the remaining time, a soft breathing/pulse animation while running.

- **Session setup:** length presets **25 / 50 / 90 min** + custom; **break** length (5 / 15 min); optional **long-break every 4 sessions**. A clean segmented control.

- **Link the session to work:** a picker to attach the focus session to **a habit** (from the user's habits) or a **free-text task label** ("Что делаешь сейчас?").

- **Controls:** `Начать` / `Пауза` / `Сбросить` / `Пропустить перерыв`. Clear **work vs break** visual states (color shift: focused green ↔ restful cool tone).

- **Cycle indicator:** dots for pomodoros completed in the current set (●●○○).

- **Ambient full-screen "Zen" mode:** dim everything but the timer; optional minimal background; ESC to exit.

- **Session log / today:** list of completed sessions today (task/habit, duration, time) with a **total focused time** for the day, and a small weekly bar of focus minutes.

- **Rewards hook:** completing a full focus session can award XP and can auto-suggest checking the linked habit ("Отметить «Чтение» выполненной?"). Design a subtle celebratory end-of-session state (chime/vibration cue, "+XP").

**How Pomodoro connects to the rest:**

- Focus minutes should surface in **Аналитика** as a new metric ("время в фокусе" — daily/weekly).

- Focus completion can feed the **Лента** ("сфокусировался 50 мин на «X»") and count toward missions.

- Keep it **local-first & interruption-safe**: the timer must survive tab switches, reloads, and navigation (persist running state).

## 13. Component inventory (design as a reusable kit)

App bar · nav tabs · **HUD (level badge + XP bar + streak flame)** · segmented toggles · checkbox toggle · month grid / calendar cells · check cell (animated) · stat tile · completion ring · bar chart · dual-line chart · leaderboard row (with podium) · league tier badge + progress · activity feed item + reaction chips · friend/member row + relation actions · day/stage tile (done/open/locked/boss) · modal (day-rating, stage, generic) · form inputs (text, select, date, textarea, slider) · buttons (primary, ghost, icon) · toast / "+XP" flyout · empty states · **circular focus timer + pomodoro cycle dots + focus session row** · theme toggle · avatar.

## 14. Hard constraints (do not break)

- **Russian UI copy** everywhere (labels above are the source of truth). English only in code/props.

- **Light + dark**, token-driven, consistent.

- **Privacy-first**: default profile is private; leaderboard/members only show opted-in users — reflect this in UI states and helper text.

- **XP is earned, never granted**: no "add XP" button anywhere. XP appears only as a *consequence* (habit check, mission, boss, focus session).

- **Streak rule** (for copy/《states): one miss = grace, breaks on two in a row.

- Data-heavy but must stay **calm and legible** — the month grid and analytics are the stress tests for the layout.

- It's a **redesign over a fixed REST API** — keep every screen and the data each shows; you may restructure layout/visual hierarchy freely, but don't drop features or invent new backend data (except the new Focus/Pomodoro surfaces described in §12).

## 15. Deliverable

A polished, responsive, **light+dark** design system + these screens: **Auth, Планер, Аналитика, Рейтинг, Путь, Стойкость, Настройки, Фокус (new)**, plus the global HUD and the header focus mini-widget. Optimize for *motivation and pride of use*: this is the app someone opens every single day to become who they want to be.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ritual-rise-game.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e6114568-6ce8-447f-9a13-40219a55c2e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
