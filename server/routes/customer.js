const express = require('express');
const Customer = require('../models/customer');

const app = express();

/* app.get('/customer', (req, res) => {
    const from = Number(req.query.from || 0);
    const limit = Number(req.query.limit || 5);

    Customer.find({ active: true })
        .skip(from)
        .limit(limit)
        .sort('names')
        .populate('user', 'name')
        .populate('campaign', 'name')
        .exec((err, customers) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the customers',
                    err
                })
            }

            Customer.countDocuments({ active: true }, (err, total) => {
                res.json({
                    success: true,
                    message: 'customers obtained successfully',
                    data: customers,
                    total
                });
            });
        })
}); */

app.get('/customer', (req, res) => {
    Customer.find({ active: true })
        .populate('campaign', 'name')
        .exec((err, customers) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the customers',
                    err
                })
            }

            res.json({
                success: true,
                message: 'customers obtained successfully',
                data: customers,
            });
        })
});

app.get('/customer/search/:text', (req, res) => {
    const text = req.params.text;
    const regex = new RegExp(text, 'i');

    Customer.find({ name: regex })
        .populate('user', 'name')
        .populate('campaign')
        .exec((err, customers) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the customers',
                    err
                });
            }

            res.json({
                success: true,
                message: 'customers obtained successfully',
                data: customers
            });
        })
});

app.get('/customer/:id', (req, res) => {
    const id = req.params.id;

    Customer.findById(id)
        .populate('user', 'name')
        .populate('campaign', 'name')
        .exec((err, foundCustomer) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the customer',
                    err
                })
            }

            if (!foundCustomer) {
                return res.status(404).json({
                    success: false,
                    message: `customer with id ${id} is not exist`,
                    err: { message: `customer with id ${id} is not exist` }
                })
            }

            res.json({
                success: true,
                message: 'customer obtained successfully',
                data: foundCustomer,
            });
        })
});

app.post('/customer', (req, res) => {
    const body = req.body;
    const customer = new Customer({
        names: body.names,
        lastnames: body.lastnames,
        addresses: body.addresses,
        phones: body.phones,
        campaign: body.campaign
    });

    customer.save((err, savedCustomer) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'an error ocurred while attempting to create the customer',
                err
            })
        }

        res.status(201).json({
            success: true,
            message: 'customer was created successfully',
            data: savedCustomer
        })
    });
});

app.put('/customer/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Customer.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, foundCustomer) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the customer',
                err
            })
        }

        res.status(200).json({
            success: true,
            message: 'customer was updated successfully',
            data: foundCustomer
        })
    });
});

app.delete('/customer/:id', (req, res) => {
    const id = req.params.id;

    Customer.findByIdAndUpdate(id, { active: false }, (err, deletedCustomer) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the customer',
                err
            });
        }

        if (!deletedCustomer) {
            return res.status(400).json({
                success: false,
                message: `customer with id ${id} is not exist`,
                err: { message: `customer with id ${id} is not exist` }
            });
        }

        res.status(200).json({
            success: true,
            message: 'customer was deleted successfully',
            data: deletedCustomer
        });
    });
});

module.exports = app;