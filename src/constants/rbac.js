const { ROLES } = require('./roles');

/**
 * Role policy (always use after `verifyJwt`):
 *
 * - **VIEWER** — read-only dashboard aggregates (`GET /api/dashboard/*`). No financial record line items, no writes.
 * - **ANALYST** — viewer capabilities + read financial records (`GET /api/records*`). No creates/updates/deletes.
 * - **ADMIN** — full access: record writes, user management, all reads.
 */
const DASHBOARD_READ_ROLES = [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN];

const FINANCIAL_RECORDS_READ_ROLES = [ROLES.ANALYST, ROLES.ADMIN];

const FINANCIAL_RECORDS_WRITE_ROLES = [ROLES.ADMIN];

const USER_MANAGE_ROLES = [ROLES.ADMIN];

module.exports = {
  DASHBOARD_READ_ROLES,
  FINANCIAL_RECORDS_READ_ROLES,
  FINANCIAL_RECORDS_WRITE_ROLES,
  USER_MANAGE_ROLES,
};
