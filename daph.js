
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mysql = require("mysql2");
const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const cors = require("cors");
app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to FreeSQLDatabase MySQL!');
});
// routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Handle form submission
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";

    connection.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        res.json({ success: true });
    });
});

app.get('/admin/contacts', (req, res) => {
    const sql = "SELECT * FROM contacts";

    connection.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error fetching data");
        }

        res.render('admin', { contacts: results });
    });
});
//deleting contact info
app.post('/delete/:id', (req, res) => {
    const sql = "DELETE FROM contacts WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error deleting contact");
        } else {
            res.redirect('/admin/contacts');
        }
    });
});

//editing contact info
app.get('/edit/:id', (req, res) => {
    const sql = "SELECT * FROM contacts WHERE id = ?";

    connection.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).send("Database error");
        }

        if (results.length === 0) {
            return res.status(404).send("Contact not found");
        }

        res.render('edit', { contact: results[0] });
    });
});

//updating info
app.post('/update/:id', (req, res) => {
    const { name, email, message } = req.body;

    const sql = "UPDATE contacts SET name=?, email=?, message=? WHERE id=?";

    connection.query(sql, [name, email, message, req.params.id], (err) => {
        if (err) {
            console.log("UPDATE ERROR:", err);
            return res.status(500).send("Update failed");
        }

        res.redirect('/admin/contacts');
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
