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

// Path to your local JSON file
const LOCAL_MINISTER_JSON_PATH = path.resolve(__dirname, 'data', 'db', 'ministers.json');
try {
  // Ensure the directory exists
  fs.mkdirSync(path.dirname(LOCAL_MINISTER_JSON_PATH), { recursive: true });
  fs.accessSync(LOCAL_MINISTER_JSON_PATH, fs.constants.R_OK);
}
catch (err) {
  // If the file doesn't exist or isn't accessible, try to create it
  console.error(`Error: local json file is not accessible or does not exist. Attempting to create one at ${LOCAL_MINISTER_JSON_PATH}.`);
  try {
    fs.writeFileSync(LOCAL_MINISTER_JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
    console.log(`Successfully created ${LOCAL_MINISTER_JSON_PATH}`);
  } catch (writeErr) {
    console.error(`Fatal error: Could not create ministers.json at ${LOCAL_MINISTER_JSON_PATH}`, writeErr);
    // If we can't create the DB file, the application can't run correctly.
    // Consider exiting or implementing a fallback. For now, we'll let it try to require and fail.
  }
}

let ministersDB = [];
try {
  const jsonData = fs.readFileSync(LOCAL_MINISTER_JSON_PATH, 'utf-8');
  ministersDB = JSON.parse(jsonData);
} catch (err) {
  console.error(`Error reading or parsing ${LOCAL_MINISTER_JSON_PATH}. Initializing with empty array.`, err);
  // If file can't be read (e.g. after a failed write attempt), start with an empty DB.
}


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
  // Generate a incremental 4 digit ID and pad it with leading zeros
  const id = String(ministersDB.length + 1).padStart(4, '0');
  const existingMinister = ministersDB.find(minister => minister.id === id);
  if (existingMinister) {
    return generateUniqueId(); // If ID already exists, generate a new one
  }
  return id;
}


function updateLocalMinisterJsonFile() {
  try {
    fs.writeFileSync(LOCAL_MINISTER_JSON_PATH, JSON.stringify(ministersDB, null, 2), 'utf-8');
    console.log(`Successfully updated ${LOCAL_MINISTER_JSON_PATH}`);
  } catch (writeErr) {
    console.error(`Error writing to ${LOCAL_MINISTER_JSON_PATH}`, writeErr);
  }
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
  const searchTerm = req.query.q; // Changed from name to q
  console.log(`Searching for minister with term: ${searchTerm}`);
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term "q" is required' });
  }
  try {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchingMinisters = ministersDB.filter(minister => {
      const nameMatch = minister.name && minister.name.toLowerCase().includes(lowerCaseSearchTerm);
      const infoMatch = minister.info && minister.info.toLowerCase().includes(lowerCaseSearchTerm);
      return nameMatch || infoMatch;
    });

    if (matchingMinisters.length === 0) {
      console.log(`No ministers found matching term: ${searchTerm}`);
      return res.status(404).json({ error: `No ministers found matching term: ${searchTerm}` });
    }
    
    console.log('Ministers data fetched successfully:', matchingMinisters);
    res.json(matchingMinisters);
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