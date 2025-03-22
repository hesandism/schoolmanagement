// Import required modules
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const path = require('path');

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '1234', // Replace with your MySQL password
    database: 'school' // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected!');
});

// Create students table (if not exists)
db.query(`CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL
)`, (err) => {
    if (err) throw err;
    console.log('Students table ready');
});

// Get all students
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get student by ID
app.get('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM students WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(results[0]);
    });
});

// Create a new student
app.post('/students', (req, res) => {
    const { id, name, age } = req.body;
    if (!id || !name || !age) return res.status(400).json({ message: 'Please provide all fields' });
    
    db.query('INSERT INTO students (id, name, age) VALUES (?, ?, ?)', [id, name, age], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Student created' });
    });
});

// Update a student
app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { name, age } = req.body;

    if (!name || !age) return res.status(400).json({ message: 'Please provide all fields' });

    db.query('UPDATE students SET name = ?, age = ? WHERE id = ?', [name, age, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student updated' });
    });
});

// Delete a student
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted' });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
