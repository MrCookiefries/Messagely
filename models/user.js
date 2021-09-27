/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require("../config");
const ExpressError = require("../expressError");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const items = [username, password, first_name, last_name, phone];
    if (!items.every(i => i)) {
      const data = `"username", "password", "first_name", "last_name", "phone"`;
      throw new ExpressError(400, `Missing body data ${data}`);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    if (!password)
      throw new ExpressError(400, `No "password" given.`);
    const result = await db.query(
      `SELECT password FROM users
      WHERE username = $1`,
      [username]
    );
    if (!result.rows.length)
      throw new ExpressError(404, `User ${username} not found.`)
    const user = result.rows[0];
    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users SET last_login_at = current_timestamp
      WHERE username = $1 RETURNING username`,
      [username]
    );
    if (!result.rows.length)
      throw new ExpressError(404, `User ${username} not found.`)
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username = $1`,
      [username]
    );
    if (!result.rows.length)
      throw new ExpressError(404, `User ${username} not found.`)
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, u.username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
      FROM messages m
      JOIN users u ON u.username = m.to_username
      WHERE m.from_username = $1`,
      [username]
    );
    if (!result.rows.length)
      throw new ExpressError(404, `No messages for ${username} found.`)
    return result.rows.map(r => {
      const {username, first_name, last_name, phone} = r;
      const to_user = {username, first_name, last_name, phone};
      const {id, body, sent_at, read_at} = r;
      return {id, to_user, body, sent_at, read_at};
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, u.username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
      FROM messages m
      JOIN users u ON u.username = m.from_username
      WHERE m.to_username = $1`,
      [username]
    );
    if (!result.rows.length)
      throw new ExpressError(404, `No messages for ${username} found.`)
    return result.rows.map(r => {
      const {username, first_name, last_name, phone} = r;
      const from_user = {username, first_name, last_name, phone};
      const {id, body, sent_at, read_at} = r;
      return {id, from_user, body, sent_at, read_at};
    });
  }
}

module.exports = User;
