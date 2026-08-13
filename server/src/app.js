const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');

const app = express();

// CORS configuration
const allowedOrigins = config.frontendUrl.split(',').map(url => url.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const { getDefaultCollection } = require('./config/couchbase');
    const collection = await getDefaultCollection();
    await collection.upsert('test::connection', { type: 'test', ok: true, at: new Date().toISOString() });
    const result = await collection.get('test::connection');
    res.json({ status: 'connected', data: result.value });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

function findClientDist() {
  const candidates = [
    path.join(__dirname, '../../client/dist'),
    path.join(__dirname, '../client/dist'),
    path.join(__dirname, '../../../client/dist'),
    path.join(process.cwd(), 'client/dist'),
    path.join(process.cwd(), '../client/dist'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return candidates[0];
}

const clientDistPath = findClientDist();

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else {
  console.warn(`WARNING: client/dist not found at ${clientDistPath}. Static files will not be served.`);
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built. Run: cd client && npm run build' });
  }
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Client dist path: ${clientDistPath}`);
  console.log(`Client dist exists: ${fs.existsSync(clientDistPath)}`);
});

module.exports = app;
