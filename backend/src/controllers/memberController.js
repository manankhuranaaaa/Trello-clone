const pool = require('../config/db');

exports.getMembers = async (req, res) => {
  const [members] = await pool.query('SELECT * FROM members ORDER BY name');
  res.json(members);
};

exports.getLabels = async (req, res) => {
  const { board_id } = req.params;
  const [labels] = await pool.query('SELECT * FROM labels WHERE board_id = ?', [board_id]);
  res.json(labels);
};
