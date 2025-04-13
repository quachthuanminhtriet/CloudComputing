const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require(path.resolve(__dirname, '../BE/src/configs/db'));


dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/friends', require('./src/routes/friendshipRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));
app.use('/api/conversations', require('./src/routes/conversationRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Messaging SaaS API!');
});

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
