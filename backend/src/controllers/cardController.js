const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

exports.createCard = async (req, res) => {
  const { list_id, title } = req.body;
  if (!list_id || !title) return res.status(400).json({ error: 'list_id and title required' });
  const [[{ maxPos }]] = await pool.query('SELECT MAX(position) as maxPos FROM cards WHERE list_id = ?', [list_id]);
  const position = (maxPos || 0) + 1;
  const id = uuidv4();
  await pool.query('INSERT INTO cards (id, list_id, title, position) VALUES (?, ?, ?, ?)', [id, list_id, title, position]);
  const [[card]] = await pool.query('SELECT * FROM cards WHERE id = ?', [id]);
  res.status(201).json(card);
};

exports.getCard = async (req, res) => {
  const { id } = req.params;
  const [[card]] = await pool.query('SELECT * FROM cards WHERE id = ?', [id]);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const [labels] = await pool.query(
    `SELECT l.* FROM labels l JOIN card_labels cl ON l.id = cl.label_id WHERE cl.card_id = ?`, [id]
  );
  const [members] = await pool.query(
    `SELECT m.* FROM members m JOIN card_members cm ON m.id = cm.member_id WHERE cm.card_id = ?`, [id]
  );
  const [checklists] = await pool.query('SELECT * FROM checklists WHERE card_id = ? ORDER BY created_at', [id]);
  for (const cl of checklists) {
    const [items] = await pool.query('SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY position', [cl.id]);
    cl.items = items;
  }
  const [comments] = await pool.query(
    `SELECT c.*, m.name as member_name, m.avatar_color FROM comments c
     JOIN members m ON c.member_id = m.id
     WHERE c.card_id = ? ORDER BY c.created_at DESC`,
    [id]
  );

  res.json({ ...card, labels, members, checklists, comments });
};

exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, archived, cover_color, list_id } = req.body;
  await pool.query(
    `UPDATE cards SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      due_date = IF(? IS NOT NULL, ?, due_date),
      archived = COALESCE(?, archived),
      cover_color = IF(? IS NOT NULL, ?, cover_color),
      list_id = COALESCE(?, list_id)
     WHERE id = ?`,
    [title, description, due_date, due_date, archived, cover_color, cover_color, list_id, id]
  );
  const [[card]] = await pool.query('SELECT * FROM cards WHERE id = ?', [id]);
  res.json(card);
};

exports.deleteCard = async (req, res) => {
  await pool.query('DELETE FROM cards WHERE id = ?', [req.params.id]);
  res.json({ success: true });
};

exports.moveCard = async (req, res) => {
  // Move card to new list and reorder
  const { id } = req.params;
  const { list_id, orderedIds } = req.body; // orderedIds: all card ids in destination list after move
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE cards SET list_id = ? WHERE id = ?', [list_id, id]);
    for (let i = 0; i < orderedIds.length; i++) {
      await conn.query('UPDATE cards SET position = ? WHERE id = ?', [i + 1, orderedIds[i]]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.reorderCards = async (req, res) => {
  const { orderedIds } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < orderedIds.length; i++) {
      await conn.query('UPDATE cards SET position = ? WHERE id = ?', [i + 1, orderedIds[i]]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

// Labels
exports.addLabel = async (req, res) => {
  const { id } = req.params;
  const { label_id } = req.body;
  await pool.query('INSERT IGNORE INTO card_labels (card_id, label_id) VALUES (?, ?)', [id, label_id]);
  res.json({ success: true });
};

exports.removeLabel = async (req, res) => {
  const { id, label_id } = req.params;
  await pool.query('DELETE FROM card_labels WHERE card_id = ? AND label_id = ?', [id, label_id]);
  res.json({ success: true });
};

// Members
exports.addMember = async (req, res) => {
  const { id } = req.params;
  const { member_id } = req.body;
  await pool.query('INSERT IGNORE INTO card_members (card_id, member_id) VALUES (?, ?)', [id, member_id]);
  res.json({ success: true });
};

exports.removeMember = async (req, res) => {
  const { id, member_id } = req.params;
  await pool.query('DELETE FROM card_members WHERE card_id = ? AND member_id = ?', [id, member_id]);
  res.json({ success: true });
};

// Checklists
exports.createChecklist = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const clId = uuidv4();
  await pool.query('INSERT INTO checklists (id, card_id, title) VALUES (?, ?, ?)', [clId, id, title || 'Checklist']);
  const [[cl]] = await pool.query('SELECT * FROM checklists WHERE id = ?', [clId]);
  res.status(201).json({ ...cl, items: [] });
};

exports.deleteChecklist = async (req, res) => {
  await pool.query('DELETE FROM checklists WHERE id = ?', [req.params.checklist_id]);
  res.json({ success: true });
};

exports.addChecklistItem = async (req, res) => {
  const { checklist_id } = req.params;
  const { text } = req.body;
  const [[{ maxPos }]] = await pool.query('SELECT MAX(position) as maxPos FROM checklist_items WHERE checklist_id = ?', [checklist_id]);
  const itemId = uuidv4();
  await pool.query(
    'INSERT INTO checklist_items (id, checklist_id, text, position) VALUES (?, ?, ?, ?)',
    [itemId, checklist_id, text, (maxPos || 0) + 1]
  );
  const [[item]] = await pool.query('SELECT * FROM checklist_items WHERE id = ?', [itemId]);
  res.status(201).json(item);
};

exports.updateChecklistItem = async (req, res) => {
  const { item_id } = req.params;
  const { text, completed } = req.body;
  await pool.query(
    'UPDATE checklist_items SET text = COALESCE(?, text), completed = COALESCE(?, completed) WHERE id = ?',
    [text, completed, item_id]
  );
  const [[item]] = await pool.query('SELECT * FROM checklist_items WHERE id = ?', [item_id]);
  res.json(item);
};

exports.deleteChecklistItem = async (req, res) => {
  await pool.query('DELETE FROM checklist_items WHERE id = ?', [req.params.item_id]);
  res.json({ success: true });
};

// Comments
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { member_id, text } = req.body;
  const commentId = uuidv4();
  await pool.query('INSERT INTO comments (id, card_id, member_id, text) VALUES (?, ?, ?, ?)', [commentId, id, member_id, text]);
  const [[comment]] = await pool.query(
    `SELECT c.*, m.name as member_name, m.avatar_color FROM comments c
     JOIN members m ON c.member_id = m.id WHERE c.id = ?`,
    [commentId]
  );
  res.status(201).json(comment);
};

exports.deleteComment = async (req, res) => {
  await pool.query('DELETE FROM comments WHERE id = ?', [req.params.comment_id]);
  res.json({ success: true });
};

// Search
exports.searchCards = async (req, res) => {
  const { q, board_id, label_id, member_id, due } = req.query;
  let sql = `SELECT c.*, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.archived = FALSE`;
  const params = [];

  if (board_id) { sql += ' AND l.board_id = ?'; params.push(board_id); }
  if (q) { sql += ' AND c.title LIKE ?'; params.push(`%${q}%`); }
  if (label_id) {
    sql += ' AND EXISTS (SELECT 1 FROM card_labels cl WHERE cl.card_id = c.id AND cl.label_id = ?)';
    params.push(label_id);
  }
  if (member_id) {
    sql += ' AND EXISTS (SELECT 1 FROM card_members cm WHERE cm.card_id = c.id AND cm.member_id = ?)';
    params.push(member_id);
  }
  if (due === 'overdue') { sql += ' AND c.due_date < CURDATE()'; }
  else if (due === 'today') { sql += ' AND c.due_date = CURDATE()'; }
  else if (due === 'week') { sql += ' AND c.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)'; }

  const [cards] = await pool.query(sql, params);
  res.json(cards);
};
