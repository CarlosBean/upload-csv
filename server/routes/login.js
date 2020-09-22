const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { SEED, CLIENT_ID, EXP_TOKEN } = process.env;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const User = require('../models/user');
const app = express();

app.post('/login', (req, res) => {
    const body = req.body;

    if (!body.email || !body.password) {
        return res.status(400).json({
            success: false,
            message: 'missing email or password',
            err: { message: 'missing email or password' }
        });
    }

    User.findOne({ email: body.email }, (err, foundUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to find the user',
                err
            });
        }

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: 'credentials are invalid',
                err: { message: 'credentials are invalid' }
            });
        }

        if (!bcrypt.compareSync(body.password, foundUser.password)) {
            return res.status(400).json({
                success: false,
                message: 'credentials are invalid',
                err: { message: 'credentials are invalid' }
            });
        }

        const token = jwt.sign({ user: foundUser }, SEED, { expiresIn: EXP_TOKEN });

        res.json({
            success: true,
            message: 'you have successfully logged in',
            data: { id: foundUser._id, token }
        });
    });
});

// google config
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();
    return { name, email, picture };
}

app.post('/google', async (req, res) => {
    const token = req.body.idtoken;
    const googleUser = await verify(token).catch(() => null);

    if (!googleUser) {
        return res.status(403).json({
            success: false,
            message: 'google token is invalid',
            err: { message: 'google token is invalid' }
        });
    }

    User.findOne({ email: googleUser.email }, (err, foundUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to find the user',
                err
            });
        }

        if (foundUser) {

            if (!foundUser.google) {
                return res.status(400).json({
                    success: false,
                    message: 'email is already in use, you must use normal login'
                });
            }

            const token = jwt.sign({ user: foundUser }, SEED, { expiresIn: EXP_TOKEN });

            return res.json({
                success: true,
                message: 'you have successfully logged in',
                data: { id: foundUser._id, token }
            });

        } else {
            const user = new User({
                name: googleUser.name,
                email: googleUser.email,
                img: googleUser.picture,
                google: true,
                password: 'DEFAULT'
            });

            user.save((err, savedUser) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'an error ocurred while attempting to save the user',
                        err
                    });
                }

                const token = jwt.sign({ user: savedUser }, SEED, { expiresIn: EXP_TOKEN });

                return res.json({
                    success: true,
                    message: 'you have successfully logged in',
                    data: { id: savedUser._id, token }
                });
            });
        }
    })
});

module.exports = app;