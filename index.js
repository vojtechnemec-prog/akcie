const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const db = new Database('database.db');

// Database setup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key-vojtech',
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Invalid username or password' });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Username already exists' });
  }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '182.63', change: '+1.25%', trend: 'up' },
    { symbol: 'MSFT', name: 'Microsoft', price: '402.56', change: '-0.45%', trend: 'down' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '141.80', change: '+0.85%', trend: 'up' },
    { symbol: 'AMZN', name: 'Amazon.com', price: '174.45', change: '+1.10%', trend: 'up' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '726.13', change: '+4.15%', trend: 'up' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: '193.57', change: '-2.10%', trend: 'down' },
    { symbol: 'META', name: 'Meta Platforms', price: '473.32', change: '+0.40%', trend: 'up' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: '408.20', change: '-0.15%', trend: 'down' },
    { symbol: 'LLY', name: 'Eli Lilly', price: '757.78', change: '+1.80%', trend: 'up' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: '1245.10', change: '+2.30%', trend: 'up' },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: '183.15', change: '-0.60%', trend: 'down' },
    { symbol: 'V', name: 'Visa Inc.', price: '278.40', change: '+0.25%', trend: 'up' },
    { symbol: 'UNH', name: 'UnitedHealth Group', price: '522.10', change: '-1.40%', trend: 'down' },
    { symbol: 'MA', name: 'Mastercard', price: '460.50', change: '+0.35%', trend: 'up' },
    { symbol: 'XOM', name: 'Exxon Mobil', price: '104.20', change: '-1.15%', trend: 'down' },
    { symbol: 'WMT', name: 'Walmart Inc.', price: '170.15', change: '+0.70%', trend: 'up' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: '158.40', change: '-0.20%', trend: 'down' },
    { symbol: 'PG', name: 'Procter & Gamble', price: '160.30', change: '+0.45%', trend: 'up' },
    { symbol: 'HD', name: 'Home Depot', price: '362.80', change: '+1.15%', trend: 'up' },
    { symbol: 'ORCL', name: 'Oracle Corp.', price: '112.45', change: '-0.80%', trend: 'down' },
    { symbol: 'CVX', name: 'Chevron Corp.', price: '152.10', change: '-1.30%', trend: 'down' },
    { symbol: 'COST', name: 'Costco Wholesale', price: '725.40', change: '+0.95%', trend: 'up' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', price: '178.20', change: '+0.15%', trend: 'up' },
    { symbol: 'KO', name: 'Coca-Cola Co.', price: '59.85', change: '-0.30%', trend: 'down' },
    { symbol: 'MRK', name: 'Merck & Co.', price: '125.60', change: '+0.60%', trend: 'up' },
    { symbol: 'BAC', name: 'Bank of America', price: '34.20', change: '-0.90%', trend: 'down' },
    { symbol: 'PEP', name: 'PepsiCo Inc.', price: '168.45', change: '+0.20%', trend: 'up' },
    { symbol: 'ADBE', name: 'Adobe Inc.', price: '535.10', change: '-2.40%', trend: 'down' },
    { symbol: 'CRM', name: 'Salesforce, Inc.', price: '288.30', change: '+1.55%', trend: 'up' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', price: '590.20', change: '+0.80%', trend: 'up' }
  ];
  res.render('dashboard', { user: req.session.user, stocks });
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
