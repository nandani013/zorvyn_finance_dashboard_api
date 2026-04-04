class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {object} [details]
   */
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { AppError };
