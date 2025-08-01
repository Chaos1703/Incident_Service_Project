// Load environment variables from .env file
require('dotenv').config();

// Import express
const express = require('express');
const app = express();

// Import routes
const incidentRoutes = require('./routes/incidentRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

// Route handling - anything that starts with /api/incidents goes to incidentRoutes
app.use('/api/incidents', incidentRoutes);

// Start the server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Incident Service Backend is running');
});
