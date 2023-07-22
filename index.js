const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const connectDB = require('./database/connect');

const PORT = 5000;

const app = express();

app.use(bodyParser.json());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use('/api/blog', require('./routes/BlogRoute'));
app.use('/api/user', require('./routes/UserRoute'));

app.listen(PORT, () => {
   console.log(`Server is running in ${PORT}`);
});