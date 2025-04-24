const app = require('./app');
const db = require('./src/models/indexModels');
const http = require('http');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Sync database và khởi chạy server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
