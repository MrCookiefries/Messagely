/** ExpressError extends the normal JS error so we can easily
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.message = message;
    this.status = status;
    if (process.env.NODE_ENV !== "test") console.error(this.stack);
  }
}

module.exports = ExpressError;
