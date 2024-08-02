const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const sourceRoutes = require('./routes/sourceRoutes');
const webUrlRoutes = require('./routes/webUrlRoutes');
const dataRoutes = require('./routes/dataRoutes');
const parserRoutes = require('./routes/parserRoutes');  // Add parser routes

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/sources', sourceRoutes);
app.use('/weburls', webUrlRoutes);
app.use('/data', dataRoutes);
app.use('/parse', parserRoutes);  // Use parser routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
