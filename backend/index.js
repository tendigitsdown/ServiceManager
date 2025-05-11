// backend/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const LOCAL_MINISTER_JSON_PATH = './data/db/ministers.json'; // Path to your local JSON file
try {
  fs.accessSync(LOCAL_MINISTER_JSON_PATH, fs.constants.R_OK);
}
catch (err) {
  console.error(`Error: local json file is not accessible. Attempting to create one at ${LOCAL_MINISTER_JSON_PATH}.`);
  fs.writeFileSync(LOCAL_MINISTER_JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
}
const ministersDB = require(LOCAL_MINISTER_JSON_PATH); // Replace with the actual path to your JSON file


function deleteMinisterById(id) {
  const ministerIndex = ministersDB.findIndex(minister => minister.id === id);
  if (ministerIndex !== -1) {
    ministersDB.splice(ministerIndex, 1);
    console.log(`Minister with ID ${id} deleted successfully`);
    return true;
  } else {
    console.error(`Error: Minister with ID ${id} not found`);
    return false;
  }
} 

function generateUniqueId() {
  // Generate a random 4 digit ID
  const id = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
  const existingMinister = ministersDB.find(minister => minister.id === id);
  if (existingMinister) {
    return generateUniqueId(); // If ID already exists, generate a new one
  }
  return id;
}


function updateLocalMinisterJsonFile() {
  fs.writeFileSync(LOCAL_MINISTER_JSON_PATH, JSON.stringify(ministersDB, null, 2), 'utf-8');
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Api to fetch Minister info and name from a local JSON file Database
app.get('/api/get_ministers', (req, res) => {
  console.log('Fetching ministers data...');
  
  if (!ministersDB || ministersDB.length === 0) { 
    console.error('Error: Ministers data not found');
    return res.status(500).json({ error: 'Ministers data not found' });
  }
  console.log('Ministers data fetched successfully');
  console.log('Ministers data:', ministersDB);

  res.json(ministersDB);
});

// Api to get Minister info and name from a remote API provided their ID
app.get('/api/get_minister/:id', async (req, res) => {
  const ministerId = req.params.id;
  console.log(`Fetching minister data for ID: ${ministerId}`);
  try {
    // const response = await axios.get(`https://api.example.com/ministers/${ministerId}`); // Replace with the actual API URL
    // loop through the local JSON data to find the minister with the given ID
    const minister = ministersDB.find(minister => minister.id === ministerId);
    if (!minister) {
      console.error(`Error: Minister with ID ${ministerId} not found`);
      return res.status(404).json({ error: `Minister with ID ${ministerId} not found` });
    }

    console.log('Minister data fetched successfully:', ministerData);
    res.json(ministerData);
  } catch (error) {
    console.error('Error fetching minister data:', error);
    res.status(500).json({ error: 'Error fetching minister data' });
  }
});

// Api to search for a minister by name
app.post('/api/search_minister', async (req, res) => {
  const ministerName = req.query.name;
  console.log(`Searching for minister with name: ${ministerName}`);
  try {
    // Find in the local JSON data firstname that matches the query
    const minister = ministersDB.find(minister => minister.name.toLowerCase().includes(ministerName.toLowerCase()));
    if (!minister) {
      console.error(`Error: Minister with name ${ministerName} not found`);
      return res.status(404).json({ error: `Minister with name ${ministerName} not found` });
    }
    else {
      console.log('Minister data fetched successfully:', minister);
      res.json(minister);
    }
  } catch (error) {
    console.error('Error searching for minister:', error);
    res.status(500).json({ error: 'Error searching for minister' });
  }

});

app.post('/api/add_minister', async (req, res) => {

  const ministerData = req.body;
  try {
    console.log('Adding minister data:', ministerData);
    const {info, name} = ministerData;
    console.log(`Adding minister data:${info}, ${name}`);
    // Add the new minister data to the local JSON file
    ministersDB.push({id: generateUniqueId(), info, name});
    console.log('Minister data added successfully:', ministerData);
    res.status(201).json(ministerData);
  } catch (error) {
    console.error('Error adding minister data: (Need {info: "Info", name: "Name"})', error);
    res.status(500).json({ error: 'Error adding minister data' });
  }

  updateLocalMinisterJsonFile();
});

app.get('/api/update_minister/:id', async (req, res) => {     
  const ministerId = req.params.id;
  const updatedMinisterData = req.body;
  console.log(`Updating minister data for ID: ${ministerId}`, updatedMinisterData);
  try {
    // Find the minister in the local JSON data
    const ministerIndex = ministersDB.findIndex(minister => minister.id === ministerId);
    if (ministerIndex === -1) {
      console.error(`Error: Minister with ID ${ministerId} not found`);
      return res.status(404).json({ error: `Minister with ID ${ministerId} not found` });
    }
    
    // Update the minister data
    ministersDB[ministerIndex] = { ...ministersDB[ministerIndex], ...updatedMinisterData };
    console.log('Minister data updated successfully:', ministersDB[ministerIndex]);
    res.json(ministersDB[ministerIndex]);
  } catch (error) {
    console.error('Error updating minister data:', error);
    res.status(500).json({ error: 'Error updating minister data' });
  }

  updateLocalMinisterJsonFile();
});

app.delete('/api/delete_minister/:id', async (req, res) => {
  const ministerId = req.params.id;
  console.log(`Deleting minister data for ID: ${ministerId}`);
  try {
    // Delete the minister data from the local JSON file
    const isDeleted = deleteMinisterById(ministerId);
    if (!isDeleted) {
      return res.status(404).json({ error: `Minister with ID ${ministerId} not found` });
    }
    updateLocalMinisterJsonFile();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting minister data:', error);
    res.status(500).json({ error: 'Error deleting minister data' });
  }

});
// Start the server

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});