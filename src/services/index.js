const dashboardService = require('./dashboardService');

/**
 * Barrel export for domain/business services.
 * Prefer importing specific modules in new code; this helps discovery and testing.
 */
module.exports = {
  dashboardService,
};
