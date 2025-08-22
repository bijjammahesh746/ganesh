const fs = require('fs'); // Add this line at the top of the file
// server.js
// --- IMPORTS ---
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// --- INITIALIZATION ---
const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to understand JSON data

// --- MYSQL DATABASE CONNECTION ---
// IMPORTANT: Replace these with your actual database credentials
const db = mysql.createConnection({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: 'Sb5tYK82dsSaqE3.root', // or your db username
  password: 'p3Y7KOjQ0FAeWKs9', // your db password
  database: 'test', // the name of your database
  ssl: {
    ca: fs.readFileSync('ca.pem') // This tells the server to use your certificate file
  }
}).promise();

// --- API ENDPOINTS (ROUTES) ---

// 1. GET ALL DATA
app.get('/api/data', async (req, res) => {
  try {
    const [chandha] = await db.query("SELECT * FROM chandha ORDER BY datetime DESC");
    const [sponsors] = await db.query("SELECT * FROM sponsors ORDER BY datetime DESC");
    const [expenses] = await db.query("SELECT * FROM expenses ORDER BY datetime DESC");
    const [items] = await db.query("SELECT * FROM items ORDER BY datetime DESC");

    res.json({
      chandha,
      sponsors,
      expenses,
      items
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// 2. ADD A RECORD
app.post('/api/add/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const data = req.body;
  data.datetime = new Date(); // Set current timestamp

  try {
    const [result] = await db.query(`INSERT INTO ?? SET ?`, [tableName, data]);
    res.status(201).json({ id: result.insertId, ...data });
  } catch (error) {
    console.error(`Failed to add to ${tableName}:`, error);
    res.status(500).json({ error: `Failed to add record to ${tableName}` });
  }
});

// 3. UPDATE A RECORD
app.put('/api/update/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const data = req.body;

  try {
    await db.query(`UPDATE ?? SET ? WHERE id = ?`, [tableName, data, id]);
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error(`Failed to update ${tableName}:`, error);
    res.status(500).json({ error: `Failed to update record in ${tableName}` });
  }
});

// 4. DELETE A RECORD
app.delete('/api/delete/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;

  try {
    await db.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete from ${tableName}:`, error);
    res.status(500).json({ error: `Failed to delete record from ${tableName}` });
  }
});

// --- START THE SERVER ---
const PORT = 3001; // The port our server will run on
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

