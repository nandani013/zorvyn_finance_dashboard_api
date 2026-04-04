const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const recordRoutes = require('./recordRoutes');
const dashboardRoutes = require('./dashboardRoutes');

/**
 * Mounts all API route modules under `/api`.
 * Add new sub-routers here as the API grows.
 *
 * @param {import('express').Application} app
 */
function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/dashboard', dashboardRoutes);
}

module.exports = { registerRoutes };
