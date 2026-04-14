const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const initSchema = require('./config/schema');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/members', require('./routes/members'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;

initSchema()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });
