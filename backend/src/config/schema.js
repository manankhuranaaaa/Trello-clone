const pool = require('./db');

async function initSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        avatar_color VARCHAR(7) DEFAULT '#0079BF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        background VARCHAR(255) DEFAULT '#0079BF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS lists (
        id VARCHAR(36) PRIMARY KEY,
        board_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        position FLOAT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id VARCHAR(36) PRIMARY KEY,
        list_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        position FLOAT NOT NULL DEFAULT 0,
        due_date DATE,
        archived BOOLEAN DEFAULT FALSE,
        cover_color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id VARCHAR(36) PRIMARY KEY,
        board_id VARCHAR(36) NOT NULL,
        name VARCHAR(100),
        color VARCHAR(7) NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS card_labels (
        card_id VARCHAR(36) NOT NULL,
        label_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (card_id, label_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS card_members (
        card_id VARCHAR(36) NOT NULL,
        member_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (card_id, member_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS checklists (
        id VARCHAR(36) PRIMARY KEY,
        card_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Checklist',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id VARCHAR(36) PRIMARY KEY,
        checklist_id VARCHAR(36) NOT NULL,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        position FLOAT NOT NULL DEFAULT 0,
        FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        card_id VARCHAR(36) NOT NULL,
        member_id VARCHAR(36) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    console.log('Schema initialized');
  } finally {
    conn.release();
  }
}

module.exports = initSchema;
