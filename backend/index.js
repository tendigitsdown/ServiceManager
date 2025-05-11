// backend/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/freeshows', async (req, res) => {
  const { query } = req.body;

  try {
    // Replace this with the actual freeshows API URL and params
    const response = await axios.get(`https://api.freeshows.example/search?q=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from freeshows API' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});