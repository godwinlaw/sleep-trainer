# Sleep Training Tracker — Requirements & Acceptance Criteria

## Overview

A web app for tracking an infant’s sleep-training progress based on the **”Twelve Hours in Twelve Weeks”** methodology. The app tracks three things:

1. **Daytime feeds** (4 feeds across 12 waking hours)
2. **Nighttime feeds** (feeds between 8 PM and 8 AM, to be gradually eliminated)
3. **Daytime naps** (morning and afternoon naps between feeds)

---

## 1. Data Model

### 1.1 Feed Record

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (Firestore doc ID) |
| `date` | string (YYYY-MM-DD) | Calendar date of the feed |
| `startTime` | Timestamp | When the feed began |
| `type` | `”day”` \| `”night”` | Day feed (8 AM–8 PM) or night feed (8 PM–8 AM) |
| `method` | `”bottle”` \| `”breast”` | Feeding method |
| `amountOz` | number | Ounces consumed (entered directly for bottle; computed for breast at 0.1 oz/min) |
| `durationMin` | number \| null | Duration in minutes (required for breast; optional for bottle) |
| `feedNumber` | number \| null | For day feeds: ordinal 1–4. Null for night feeds. |
| `notes` | string \| null | Optional free-text notes |

**AC-1.1a:** When `method === “breast”`, `durationMin` is required and `amountOz` is auto-calculated as `durationMin * 0.1`.
**AC-1.1b:** When `method === “bottle”`, `amountOz` is required and `durationMin` is optional.
**AC-1.1c:** `type` is auto-determined from `startTime`: feeds starting between 8:00 PM and 7:59 AM are `”night”`, otherwise `”day”`.

### 1.2 Nap Record

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `date` | string (YYYY-MM-DD) | Calendar date |
| `startTime` | Timestamp | When the nap began |
| `durationMin` | number | Nap length in minutes |
| `napType` | `”morning”` \| `”afternoon”` | Between feeds 1–2, or feeds 2–3 |
| `notes` | string \| null | Optional notes |

**AC-1.2a:** `napType` is auto-inferred from `startTime` relative to the day’s feed times, or manually selectable.
**AC-1.2b:** The app warns (but does not block) if a nap is logged between feeds 3 and 4 (not recommended by the methodology).

### 1.3 Daily Summary (derived, not stored)

| Field | Description |
|-------|-------------|
| `dayFeedCount` | Number of daytime feeds |
| `dayFeedIntervals` | Array of gaps (in minutes) between consecutive day feeds |
| `nightFeedCount` | Number of nighttime feeds (previous night, 8 PM–8 AM) |
| `nightTotalOz` | Total ounces consumed during night feeds |
| `longestNightStretch` | Longest gap (minutes) between night feeds (or from 8 PM to first feed / last feed to 8 AM) |
| `morningNapMin` | Morning nap duration |
| `afternoonNapMin` | Afternoon nap duration |
| `totalDailyOz` | Total oz consumed across all feeds (day + night) for a 24-hour calendar day |

---

## 2. Features & Acceptance Criteria

### 2.1 Log a Daytime Feed

**AC-2.1a:** User can log a feed with: start time (defaults to now), method (bottle/breast), and amount or duration.
**AC-2.1b:** Feed number (1–4) is auto-assigned based on chronological order of the day’s feeds.
**AC-2.1c:** If a 5th daytime feed is logged, the app accepts it but shows an informational notice (“Goal: 4 feeds per day”).
**AC-2.1d:** After logging, the feed appears immediately in the day’s feed list.

### 2.2 Log a Nighttime Feed

**AC-2.2a:** User can log a night feed with the same fields as a day feed.
**AC-2.2b:** Night feeds are displayed separately from day feeds, grouped under the night they occurred (e.g., “Night of Mar 26–27”).
**AC-2.2c:** The app shows the time elapsed since the last feed (either the 8 PM feed or the previous night feed).

### 2.3 Log a Nap

**AC-2.3a:** User can log a nap with: start time (defaults to now) and duration in minutes.
**AC-2.3b:** `napType` is auto-inferred but overridable.
**AC-2.3c:** If a nap is logged between feeds 3 and 4, a gentle warning is displayed.

### 2.4 Edit / Delete Records

**AC-2.4a:** User can tap any logged feed or nap to edit all fields.
**AC-2.4b:** User can delete any record with a confirmation prompt.
**AC-2.4c:** Edits and deletes are reflected immediately in the UI and progress calculations.

### 2.5 Today View (Dashboard)

**AC-2.5a:** Default landing screen shows today’s data.
**AC-2.5b:** Displays a **timeline** of today’s feeds and naps in chronological order (visual bar or list).
**AC-2.5c:** Shows next target feed time based on the current interval goal (see 2.7).
**AC-2.5d:** Shows last night’s summary: feed count, total oz, longest stretch.
**AC-2.5e:** Shows today’s nap summary: morning nap (target: 60 min), afternoon nap (target: 120 min).
**AC-2.5f:** Quick-action buttons: “Log Feed” and “Log Nap” are always accessible (sticky bottom bar on mobile).
**AC-2.5g:** Displays today's running total oz (day + night feeds combined) with a **24 oz daily minimum** indicator. If total is below 24 oz by end of day (i.e., after the 4th feed has been logged or it is past 8 PM), show a prominent warning.

### 2.5.1 Daily Intake Warning

**AC-2.5.1a:** The Today View always shows a running oz counter: e.g., “14.5 / 24 oz” with a progress bar.
**AC-2.5.1b:** The progress bar turns **amber** when total oz is between 16–23.9 oz (caution), and **red** when below 16 oz late in the day.
**AC-2.5.1c:** Once all 4 daytime feeds are logged, if total daily oz (day + night) is still below 24 oz, display a persistent warning banner: “⚠ Total intake is X oz — below the 24 oz daily minimum.”
**AC-2.5.1d:** The warning is also shown on the History View for any past day where total oz < 24.
**AC-2.5.1e:** The 24 oz threshold is configurable in Settings in case the pediatrician recommends a different target.

### 2.6 History View

**AC-2.6a:** User can browse past days via a calendar picker or swipe navigation.
**AC-2.6b:** Each past day shows the same detail as the Today View (feeds, naps, summaries).
**AC-2.6c:** Data loads from Firebase; stale cache is acceptable for up to 30 seconds.

### 2.7 Daytime Feed Progress Tracker (Step 1)

The goal is to stretch the interval between daytime feeds from **3 hours to 4 hours** in **15-minute increments**.

**AC-2.7a:** The app tracks a **current interval goal** (starts at 3h 0m, increments by 15 min toward 4h 0m).
**AC-2.7b:** The current goal is stored in Firebase and editable by the user (in case of manual adjustment).
**AC-2.7c:** For each day, the app computes the **actual average interval** between consecutive day feeds.
**AC-2.7d:** A progress visualization shows:
  - Current goal interval (e.g., “3h 15m”)
  - Today’s actual average interval
  - A progress bar or step indicator from 3h → 4h (5 steps: 3:00, 3:15, 3:30, 3:45, 4:00)
  - History of past days’ average intervals as a trend line or bar chart
**AC-2.7e:** When the user consistently hits the current goal (e.g., 2 consecutive days within ±10 min), the app suggests advancing to the next increment.
**AC-2.7f:** The user can manually advance or revert the goal.

### 2.8 Nighttime Feed Progress Tracker (Step 2)

The goal is to **eliminate all night feeds** by reducing both count and amount.

**AC-2.8a:** For each night, the app displays:
  - Number of feeds
  - Total ounces consumed
  - Longest uninterrupted sleep stretch (minutes)
  - Time of first feed after 8 PM
**AC-2.8b:** A progress visualization shows a **trend over the past 7–14 nights**:
  - Night feed count trending toward 0
  - Total night oz trending toward 0
  - Longest stretch trending toward 720 min (12 hours)
**AC-2.8c:** Milestones are highlighted (e.g., “First night with only 1 feed!”, “Longest stretch: 8 hours!”).

### 2.9 Nap Progress Tracker (Step 3)

**AC-2.9a:** For each day, show morning nap duration vs. 60-min target and afternoon nap duration vs. 120-min target.
**AC-2.9b:** A weekly view shows nap consistency (how many days hit targets).
**AC-2.9c:** Flag days with naps between feeds 3–4 (should be avoided).

### 2.10 Overall Progress Dashboard

**AC-2.10a:** A single screen summarizing progress across all three steps:
  - Step 1 status: current interval goal, days at this level, trend
  - Step 2 status: nights since last night feed reduction, trend
  - Step 3 status: nap consistency percentage this week
**AC-2.10b:** Visual indicator of which step the baby is “on” (steps can overlap).
**AC-2.10c:** Celebratory animation when a major milestone is reached (Framer Motion).

---

## 3. Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Today View — dashboard with today’s feeds, naps, and quick-log buttons |
| `/history` | History View — browse past days |
| `/progress` | Overall Progress Dashboard — trends and milestones across all 3 steps |
| `/log/feed` | Log/Edit Feed form (modal or page) |
| `/log/nap` | Log/Edit Nap form (modal or page) |
| `/settings` | Settings — adjust interval goal, baby name, start date, etc. |

---

## 4. Tech Stack

- **Next.js** (latest stable) + **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (entrance animations, milestone celebrations, micro-interactions)
- **Firebase** (Firestore for data, Firebase Auth if needed later)

---

## 5. Design Requirements

### 5.1 Visual

- Mobile-first, responsive (iPhone SE through 4K desktop)
- Consistent border radius: `rounded-2xl`
- Consistent shadow scale: `shadow-sm` for cards, `shadow-lg` for modals
- Typography: clear hierarchy with `text-sm` through `text-3xl`
- Color palette: soft, calming tones (pastels or muted blues/greens) — it’s a baby app

### 5.2 Micro-interactions

- Hover lift on cards (`translateY(-2px)` + shadow increase)
- Glow ring on focused inputs
- Animated borders on active/selected elements
- Smooth section reveal on scroll (Framer Motion `whileInView`)
- Celebratory confetti or sparkle on milestones

### 5.3 Accessibility

- WCAG 2.1 AA contrast ratios
- Visible focus states on all interactive elements
- Full keyboard navigation
- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<h1>`–`<h4>`
- ARIA labels on icon-only buttons and progress indicators

### 5.4 Performance

- No heavy chart libraries; use simple SVG or CSS-based visualizations where possible
- Smooth 60fps animations
- Lazy-load non-critical content

---

## 6. Deliverables

1. A complete repo that runs:
   - `npm install`
   - `npm run dev`
   - `npm run build` (zero errors)

2. A `README.md` with:
   - What the app is
   - How to set up Firebase
   - How to run locally

3. Polished UI: consistent spacing, typography, radii, shadows, and transitions throughout.

---

## 7. Development Approach

- Use Ralph Wiggum agent loop
- Maintain a `PROGRESS.md` file to track implementation progress
- Write tests for core logic (interval calculations, feed classification, progress computations)
- Build incrementally: data model → logging → today view → progress tracking → polish
