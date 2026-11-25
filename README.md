# TaskFlow CRUD — Supabase + React

A production-grade To-Do List web application built with **React**, **TypeScript**, **Tailwind CSS**, and **@supabase/supabase-js** connected to a live Supabase PostgreSQL database.

Designed with an exact **3-Column Dark Bento-Grid** architecture featuring charcoal + lavender/purple color palette, subtle bottom-left purple radial card glows, and live reactive CRUD operations.

---

## 🎨 Bento-Grid Architecture & Layout Mapping

### 1. Left Column — Analytics & Interactive Task Board
* **Top Card (Weekly Engagement & Activity Heatmap)**:
  * Purple intensity heatmap grid (**Low**, **Medium**, **High**, **Best**) visualizing daily task activity across Monday–Sunday.
  * Search bar with instant real-time filtering by title or description.
  * Status filter pills (**All**, **Active**, **Completed**) with live task counters.
* **Bottom 2×2 Stat Cards**:
  * **Total Tasks**: Total count of all tasks stored in PostgreSQL.
  * **Completed (%)**: Live percentage completion rate.
  * **Pending Tasks**: Active action items remaining.
  * **High Priority**: Urgent, high-priority tasks requiring immediate attention.
  * Styled with dark charcoal card backgrounds, subtle bottom-left purple radial glows, and hover lifts.

### 2. Middle Column — Slim Vertical Navigation Rail
* Grouped navigation links:
  * **VIEWS**: *All Tasks*, *Today*, *Completed*, *High Priority* (with reactive item counts).
  * **PRIORITY FILTERS**: *High* (rose/violet dot), *Medium* (amber dot), *Low* (emerald dot).
* **Action Button**: Purple pill button (**+ Quick Add**) at the bottom for instant task creation.

### 3. Right Column — Live CRUD Task Feed & Brand Card
* **Top Card (Schedule & Tasks)**:
  * Horizontal week date selector strip (**Mon – Sun**) with active day indicator and single-click date filtering.
  * Scrollable live To-Do task card list from Supabase:
    * Interactive animated checkbox for toggling `is_completed`.
    * Strikethrough title and detailed notes/description.
    * Priority badges (**High**, **Medium**, **Low**).
    * Due date badges with **Overdue** warnings.
    * Inline **Edit** button (opens pre-filled task update modal).
    * **Delete** button (with safety confirmation dialog and loading state).
  * Full-width lavender **+ Create Task** button at the bottom.
* **Bottom-Right Card (Brand & PostgreSQL Indicator)**:
  * Dark purple gradient card highlighting **TaskFlow CRUD — Supabase + React**.
  * Live Supabase PostgreSQL connection status badge and architecture specs.

---

## ⚡ Engineering & Database Schema

Directly mapped to the PostgreSQL `public.todos` table:

```sql
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) not null default 'medium',
  due_date date,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### CRUD Features
* **Create**: Task form with validation, description, priority badge selector, and HTML5 date picker.
* **Read**: Fetches ordered by `is_completed` ASC, `created_at` DESC. Realtime Supabase PostgreSQL changes subscription keeps multiple tabs in sync.
* **Update**: Optimistic UI updates with rollback and toast error notifications if Supabase rejects the update.
* **Delete**: Optimistic removal with confirmation dialog and rollback protection.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
The application automatically reads from `.env` or falls back to your configured Supabase credentials:
```env
VITE_SUPABASE_URL=https://tgamvjicllusetonuixp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zLqNs-D5qY9sX3_CY9O9Ng_5l_zTTDA
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
