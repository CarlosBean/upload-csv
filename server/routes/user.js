const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/user', verifyToken, (req, res) => {
    const from = Number(req.query.from || 0);
    const limit = Number(req.query.limit || 5);

    User.find({ status: true })
        .skip(from)
        .limit(limit)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the users',
                    err
                })
            }

            User.countDocuments({ status: true }, (err, total) => {
                res.json({
                    success: true,
                    message: 'users obtained successfully',
                    data: users,
                    total
                });
            });
        })
});

app.post('/user', [verifyToken, verifyAdminRole], (req, res) => {
    const body = req.body;
    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, savedUser) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'an error ocurred while attempting to create the user',
                err
            })
        }

        res.status(201).json({
            success: true,
            message: 'user was created successfully',
            data: savedUser
        })
    });
});

app.put('/user/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    delete body.password;
    delete body.google;

    User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, foundUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the user',
                err
            })
        }

        res.status(200).json({
            success: true,
            message: 'user was updated successfully',
            data: foundUser
        })
    });
});

app.delete('/user/:id', verifyToken, (req, res) => {
    const id = req.params.id;

    // User.findByIdAndRemove(id, (err, deletedUser) => {
    User.findByIdAndUpdate(id, { status: false }, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the user',
                err
            });
        }

        if (!deletedUser) {
            return res.status(400).json({
                success: false,
                message: `user with id ${id} is not exist`,
                err: { message: `user with id ${id} is not exist` }
            });
        }

        res.status(200).json({
            success: true,
            message: 'user was deleted successfully',
            data: deletedUser
        });
    });
});

module.exports = app;