require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/biometric', require('./routes/biometric'));

// After `npm run build` in the client folder, this server also serves the website,
// so a single server is enough when you deploy.
const dist = path.join(__dirname, '../client/dist');
app.use(express.static(dist));
app.use((req, res) => res.sendFile(path.join(dist, 'index.html')));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server is running')))
  .catch((err) => console.log('Could not connect to MongoDB:', err.message));
