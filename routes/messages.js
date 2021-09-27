const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id);
        const {username: fromUsername} = message.from_user;
        const {username: toUsername} = message.to_user;
        const {username} = req.user;
        if (username !== fromUsername || username !== toUsername)
            throw new ExpressError(403, `You're not allowed to view this message.`);
        return res.status(200).json({message});
    } catch (err) {
        return next(err);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
 router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.create(req.body);
        return res.status(200).json({message});
    } catch (err) {
        return next(err);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
 router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id);
        const data = await Message.markRead(req.params.id);
        const {username: toUsername} = message.to_user;
        const {username} = req.user;
        if (username !== toUsername)
            throw new ExpressError(403, `You're not allowed to mark this message as read.`);
        return res.status(200).json({data});
    } catch (err) {
        return next(err);
    }
});

 module.exports = router;
