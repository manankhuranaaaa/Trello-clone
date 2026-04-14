const { v4: uuidv4 } = require('uuid');
const pool = require('./db');
const initSchema = require('./schema');

async function seed() {
  await initSchema();
  const conn = await pool.getConnection();
  try {
    // Members
    const members = [
      { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com', avatar_color: '#0079BF' },
      { id: uuidv4(), name: 'Bob Smith', email: 'bob@example.com', avatar_color: '#D29034' },
      { id: uuidv4(), name: 'Carol White', email: 'carol@example.com', avatar_color: '#519839' },
      { id: uuidv4(), name: 'David Lee', email: 'david@example.com', avatar_color: '#B04632' },
    ];
    for (const m of members) {
      await conn.query(
        'INSERT IGNORE INTO members (id, name, email, avatar_color) VALUES (?, ?, ?, ?)',
        [m.id, m.name, m.email, m.avatar_color]
      );
    }

    // Board
    const boardId = uuidv4();
    await conn.query(
      'INSERT IGNORE INTO boards (id, title, background) VALUES (?, ?, ?)',
      [boardId, 'Product Roadmap', '#0079BF']
    );

    // Labels
    const labels = [
      { id: uuidv4(), board_id: boardId, name: 'Bug', color: '#EB5A46' },
      { id: uuidv4(), board_id: boardId, name: 'Feature', color: '#61BD4F' },
      { id: uuidv4(), board_id: boardId, name: 'Design', color: '#C377E0' },
      { id: uuidv4(), board_id: boardId, name: 'Urgent', color: '#FF9F1A' },
      { id: uuidv4(), board_id: boardId, name: 'Research', color: '#00C2E0' },
    ];
    for (const l of labels) {
      await conn.query(
        'INSERT IGNORE INTO labels (id, board_id, name, color) VALUES (?, ?, ?, ?)',
        [l.id, l.board_id, l.name, l.color]
      );
    }

    // Lists
    const lists = [
      { id: uuidv4(), board_id: boardId, title: 'Backlog', position: 1 },
      { id: uuidv4(), board_id: boardId, title: 'In Progress', position: 2 },
      { id: uuidv4(), board_id: boardId, title: 'Review', position: 3 },
      { id: uuidv4(), board_id: boardId, title: 'Done', position: 4 },
    ];
    for (const l of lists) {
      await conn.query(
        'INSERT IGNORE INTO lists (id, board_id, title, position) VALUES (?, ?, ?, ?)',
        [l.id, l.board_id, l.title, l.position]
      );
    }

    // Cards
    const cards = [
      { id: uuidv4(), list_id: lists[0].id, title: 'User authentication flow', description: 'Design and implement login/signup', position: 1, due_date: '2025-08-15' },
      { id: uuidv4(), list_id: lists[0].id, title: 'Database schema design', description: 'Create ERD and finalize schema', position: 2, due_date: null },
      { id: uuidv4(), list_id: lists[0].id, title: 'API documentation', description: 'Write OpenAPI specs', position: 3, due_date: '2025-08-20' },
      { id: uuidv4(), list_id: lists[1].id, title: 'Build drag-and-drop', description: 'Implement DnD for cards and lists', position: 1, due_date: '2025-07-30' },
      { id: uuidv4(), list_id: lists[1].id, title: 'Card detail modal', description: 'Labels, members, checklist, due date', position: 2, due_date: null },
      { id: uuidv4(), list_id: lists[2].id, title: 'Board UI layout', description: 'Trello-like board with lists', position: 1, due_date: '2025-07-25' },
      { id: uuidv4(), list_id: lists[3].id, title: 'Project setup', description: 'Initialize repo and install deps', position: 1, due_date: null },
      { id: uuidv4(), list_id: lists[3].id, title: 'CI/CD pipeline', description: 'GitHub Actions for deploy', position: 2, due_date: null },
    ];
    for (const c of cards) {
      await conn.query(
        'INSERT IGNORE INTO cards (id, list_id, title, description, position, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [c.id, c.list_id, c.title, c.description, c.position, c.due_date]
      );
    }

    // Card labels
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[0].id, labels[1].id]);
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[0].id, labels[3].id]);
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[1].id, labels[4].id]);
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[3].id, labels[1].id]);
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[4].id, labels[2].id]);
    await conn.query('INSERT IGNORE INTO card_labels VALUES (?, ?)', [cards[5].id, labels[2].id]);

    // Card members
    await conn.query('INSERT IGNORE INTO card_members VALUES (?, ?)', [cards[0].id, members[0].id]);
    await conn.query('INSERT IGNORE INTO card_members VALUES (?, ?)', [cards[0].id, members[1].id]);
    await conn.query('INSERT IGNORE INTO card_members VALUES (?, ?)', [cards[3].id, members[2].id]);
    await conn.query('INSERT IGNORE INTO card_members VALUES (?, ?)', [cards[4].id, members[0].id]);
    await conn.query('INSERT IGNORE INTO card_members VALUES (?, ?)', [cards[5].id, members[3].id]);

    // Checklists
    const cl1 = uuidv4();
    await conn.query('INSERT IGNORE INTO checklists (id, card_id, title) VALUES (?, ?, ?)', [cl1, cards[3].id, 'Implementation Steps']);
    const items = [
      { id: uuidv4(), checklist_id: cl1, text: 'Install @hello-pangea/dnd', completed: true, position: 1 },
      { id: uuidv4(), checklist_id: cl1, text: 'Wrap board with DragDropContext', completed: true, position: 2 },
      { id: uuidv4(), checklist_id: cl1, text: 'Make lists droppable', completed: false, position: 3 },
      { id: uuidv4(), checklist_id: cl1, text: 'Make cards draggable', completed: false, position: 4 },
    ];
    for (const item of items) {
      await conn.query(
        'INSERT IGNORE INTO checklist_items (id, checklist_id, text, completed, position) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.checklist_id, item.text, item.completed, item.position]
      );
    }

    // Comments
    await conn.query(
      'INSERT IGNORE INTO comments (id, card_id, member_id, text) VALUES (?, ?, ?, ?)',
      [uuidv4(), cards[0].id, members[0].id, 'Started working on the OAuth flow.']
    );
    await conn.query(
      'INSERT IGNORE INTO comments (id, card_id, member_id, text) VALUES (?, ?, ?, ?)',
      [uuidv4(), cards[0].id, members[1].id, 'Should we support Google login too?']
    );

    console.log('Seed complete!');
    console.log('Board ID:', boardId);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
