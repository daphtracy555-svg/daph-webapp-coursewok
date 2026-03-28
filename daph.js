if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mysql = require("mysql2");
const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
// Database connection
const db = mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
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

    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error saving data");
        } else {
            res.send("Message sent successfully!");
        }
    });
});

app.get('/admin/contacts', (req, res) => {
    const sql = "SELECT * FROM contacts";

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            res.send("Error fetching data");
        } else {
            res.render('admin', { contacts: results });
        }
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

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.log(err);
            res.send("Error fetching contact");
        } else {
            res.render('edit', { contact: results[0] });
        }
    });
});

//updating info
app.post('/update/:id', (req, res) => {
    const { name, email, message } = req.body;

    const sql = "UPDATE contacts SET name = ?, email = ?, message = ? WHERE id = ?";

    db.query(sql, [name, email, message, req.params.id], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error updating contact");
        } else {
            res.redirect('/admin/contacts');
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
