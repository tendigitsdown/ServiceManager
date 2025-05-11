// backend/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const LOCAL_MINISTER_JSON_PATH = './data/ministers.json'; // Path to your local JSON file

// app.post('/api/freeshows', async (req, res) => {
//   const { query } = req.body;

//   try {
//     // Replace this with the actual freeshows API URL and params
//     const response = await axios.get(`https://api.freeshows.example/search?q=${encodeURIComponent(query)}`);
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching data from freeshows API' });
//   }
// });

// Api to fetch Minister info and name from a local JSON file Database
app.get('/api/get_ministers', (req, res) => {

  const ministers = require(LOCAL_MINISTER_JSON_PATH); // Replace with the actual path to your JSON file
  res.json(ministers);
});


app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});