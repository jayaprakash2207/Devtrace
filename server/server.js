require('dotenv').config();
const mongoose = require('mongoose');
const app      = require('./app');

const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devtrace';

// Guard: crash early if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment. Refusing to start.');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected → ${MONGO_URI}`);
    const server = app.listen(PORT, () =>
      console.log(`DevTrace API running on http://localhost:${PORT}`)
    );

    // Graceful shutdown — flush in-flight requests before exit
    const shutdown = (signal) => {
      console.log(`\n${signal} received — shutting down gracefully`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
