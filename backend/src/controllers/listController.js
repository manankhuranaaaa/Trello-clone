const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

exports.createList = async (req, res) => {
  const { board_id, title } = req.body;
  if (!board_id || !title) return res.status(400).json({ error: 'board_id and title required' });
  const [[{ maxPos }]] = await pool.query('SELECT MAX(position) as maxPos FROM lists WHERE board_id = ?', [board_id]);
  const position = (maxPos || 0) + 1;
  const id = uuidv4();
  await pool.query('INSERT INTO lists (id, board_id, title, position) VALUES (?, ?, ?, ?)', [id, board_id, title, position]);
  const [[list]] = await pool.query('SELECT * FROM lists WHERE id = ?', [id]);
  res.status(201).json(list);
};

exports.updateList = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  await pool.query('UPDATE lists SET title = ? WHERE id = ?', [title, id]);
  const [[list]] = await pool.query('SELECT * FROM lists WHERE id = ?', [id]);
  res.json(list);
};

exports.deleteList = async (req, res) => {
  await pool.query('DELETE FROM lists WHERE id = ?', [req.params.id]);
  res.json({ success: true });
};

exports.reorderLists = async (req, res) => {
  // orderedIds: array of list ids in new order
  const { orderedIds } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < orderedIds.length; i++) {
      await conn.query('UPDATE lists SET position = ? WHERE id = ?', [i + 1, orderedIds[i]]);
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
