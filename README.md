# Trello Clone — Full Stack Kanban App

A Trello-inspired Kanban project management tool built with React, Node.js/Express, and MySQL.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, @hello-pangea/dnd   |
| Backend  | Node.js, Express.js                 |
| Database | MySQL 8+                            |
| Styling  | CSS Modules (no UI library)         |

## Features

- **Boards** — Create, rename, delete boards with custom background colors
- **Lists** — Create, rename, delete lists; drag-and-drop to reorder
- **Cards** — Create, edit, delete, archive cards; drag-and-drop between lists
- **Card Details** — Labels, members, due dates, checklists, comments, cover colors
- **Search & Filter** — Filter cards by title, label, member, or due date
- **Responsive** — Works on mobile, tablet, and desktop

## Database Schema

```
members         — id, name, email, avatar_color
boards          — id, title, background
lists           — id, board_id, title, position
cards           — id, list_id, title, description, position, due_date, archived, cover_color
labels          — id, board_id, name, color
card_labels     — card_id, label_id  (junction)
card_members    — card_id, member_id (junction)
checklists      — id, card_id, title
checklist_items — id, checklist_id, text, completed, position
comments        — id, card_id, member_id, text, created_at
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Database

```bash
mysql -u root -p
CREATE DATABASE trello_clone;
EXIT;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run seed      # Creates schema + sample data
npm run dev       # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000)

## Assumptions

- No authentication — a default user (Alice Johnson) is used as the "current user" for comments
- 4 sample members are seeded: Alice, Bob, Carol, David
- 1 sample board "Product Roadmap" with 4 lists and 8 cards is seeded
- Archived cards are hidden from the board view (no archive view UI)
- Position ordering uses float values for efficient reordering
