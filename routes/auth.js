const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const isValid = await User.authenticate(username, password);
        if (!isValid)
            throw new ExpressError(400, `Invalid username / password`);
        const user = await User.get(username);
        const token = jwt.sign(user, SECRET_KEY);
        await User.updateLoginTimestamp(username);
        return res.status(200).json({token});
    } catch (err) {
        return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
    try {
        const user = await User.register(req.body);
        const token = jwt.sign(user, SECRET_KEY);
        return res.status(201).json({token});
    } catch (err) {
        return next(err);
    }
});

 module.exports = router;
