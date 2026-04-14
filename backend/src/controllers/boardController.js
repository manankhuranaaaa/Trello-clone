const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

exports.getBoards = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
  res.json(rows);
};

exports.getBoard = async (req, res) => {
  const { id } = req.params;
  const [[board]] = await pool.query('SELECT * FROM boards WHERE id = ?', [id]);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const [lists] = await pool.query('SELECT * FROM lists WHERE board_id = ? ORDER BY position', [id]);
  const [cards] = await pool.query(
    `SELECT c.* FROM cards c
     JOIN lists l ON c.list_id = l.id
     WHERE l.board_id = ? AND c.archived = FALSE
     ORDER BY c.position`,
    [id]
  );
  const [labels] = await pool.query('SELECT * FROM labels WHERE board_id = ?', [id]);
  const [cardLabels] = await pool.query(
    `SELECT cl.* FROM card_labels cl
     JOIN cards c ON cl.card_id = c.id
     JOIN lists l ON c.list_id = l.id
     WHERE l.board_id = ?`,
    [id]
  );
  const [cardMembers] = await pool.query(
    `SELECT cm.* FROM card_members cm
     JOIN cards c ON cm.card_id = c.id
     JOIN lists l ON c.list_id = l.id
     WHERE l.board_id = ?`,
    [id]
  );
  const [members] = await pool.query('SELECT * FROM members');

  res.json({ board, lists, cards, labels, cardLabels, cardMembers, members });
};

exports.createBoard = async (req, res) => {
  const { title, background } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = uuidv4();
  await pool.query('INSERT INTO boards (id, title, background) VALUES (?, ?, ?)', [id, title, background || '#0079BF']);
  const [[board]] = await pool.query('SELECT * FROM boards WHERE id = ?', [id]);
  res.status(201).json(board);
};

exports.updateBoard = async (req, res) => {
  const { id } = req.params;
  const { title, background } = req.body;
  await pool.query('UPDATE boards SET title = COALESCE(?, title), background = COALESCE(?, background) WHERE id = ?', [title, background, id]);
  const [[board]] = await pool.query('SELECT * FROM boards WHERE id = ?', [id]);
  res.json(board);
};

exports.deleteBoard = async (req, res) => {
  await pool.query('DELETE FROM boards WHERE id = ?', [req.params.id]);
  res.json({ success: true });
};
