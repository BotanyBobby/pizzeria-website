const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('database.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, description TEXT, price REAL, image TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT, total REAL, orderId TEXT UNIQUE
  )`);
  db.run(`INSERT OR IGNORE INTO menu (name, description, price, image) VALUES 
    ('Pepperoni Pizza', 'Classic pizza with pepperoni and mozzarella', 12.99, 'pepperoni.png'),
    ('Margherita Pizza', 'Fresh basil, mozzarella, and tomato sauce', 10.99, 'marg.png'),
    ('Hawaiian Pizza', 'Ham, pineapple, and cheese', 13.49, 'hawaii.png'),
    ('Veggie Pizza', 'Bell peppers, olives, and mushrooms', 11.99, 'veggie.png'),
    ('Meat Lovers Pizza', 'Pepperoni, sausage, and bacon', 14.99, 'meat.png')`);
});

app.get('/menu', (req, res) => {
  db.all('SELECT * FROM menu', (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.post('/menu', (req, res) => {
  const { name, description, price, image } = req.body;
  db.run('INSERT INTO menu (name, description, price, image) VALUES (?, ?, ?, ?)', 
    [name, description, price, image], (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('Menu item added');
    });
});

app.put('/menu/:id', (req, res) => {
  const { name, description, price, image } = req.body;
  db.run('UPDATE menu SET name=?, description=?, price=?, image=? WHERE id=?', 
    [name, description, price, image, req.params.id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Menu item updated');
    });
});

app.delete('/menu/:id', (req, res) => {
  db.run('DELETE FROM menu WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Menu item deleted');
  });
});

app.post('/order', (req, res) => {
  const { items, total } = req.body;
  const orderId = `ORD${Date.now()}`;
  db.run('INSERT INTO orders (items, total, orderId) VALUES (?, ?, ?)', 
    [JSON.stringify(items), total, orderId], (err) => {
      if (err) return res.status(500).send(err);
      sendConfirmationEmail(orderId, items, total);
      res.json({ orderId });
    });
});

function sendConfirmationEmail(orderId, items, total) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your-email@gmail.com', pass: 'your-password' }
  });
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'customer@example.com',
    subject: `Order Confirmation: ${orderId}`,
    text: `Your order (${orderId}) for $${total} has been placed!\nItems: ${JSON.stringify(items)}`
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) console.error('Email failed:', err);
    else console.log('Confirmation email sent');
  });
}

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));