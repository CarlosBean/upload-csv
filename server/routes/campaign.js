const express = require('express');
const Campaign = require('../models/campaign');

const app = express();

app.get('/campaign', (req, res) => {
    Campaign.find({ active: true })
        .sort('name')
        .populate('user', 'name')
        .exec((err, campaigns) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'an error ocurred while attempting to find the campaigns',
                    err
                })
            }

            res.json({
                success: true,
                message: 'campaigns obtained successfully',
                data: campaigns,
            });
        })
});

app.get('/campaign/:id', (req, res) => {
    const id = req.params.id;

    Campaign.findById(id, (err, foundCampaign) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to find the campaign',
                err
            })
        }

        if (!foundCampaign) {
            return res.status(404).json({
                success: false,
                message: `campaign with id ${id} is not exist`,
                err: { message: `campaign with id ${id} is not exist` }
            })
        }

        res.json({
            success: true,
            message: 'campaign obtained successfully',
            data: foundCampaign,
        });
    })
});

app.post('/campaign', (req, res) => {
    const body = req.body;
    const campaign = new Campaign({
        name: body.name,
        description: body.description,
        //user: req.user._id
    });

    campaign.save((err, savedCampaign) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'an error ocurred while attempting to create the campaign',
                err
            })
        }

        res.status(201).json({
            success: true,
            message: 'campaign was created successfully',
            data: savedCampaign
        })
    });
});

app.put('/campaign/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Campaign.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, foundCampaign) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the campaign',
                err
            })
        }

        res.status(200).json({
            success: true,
            message: 'campaign was updated successfully',
            data: foundCampaign
        })
    });
});

app.delete('/campaign/:id', (req, res) => {
    const id = req.params.id;

    Campaign.findByIdAndUpdate(id, { active: false }, (err, deletedCampaign) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'an error ocurred while attempting to update the campaign',
                err
            });
        }

        if (!deletedCampaign) {
            return res.status(400).json({
                success: false,
                message: `campaign with id ${id} is not exist`,
                err: { message: `campaign with id ${id} is not exist` }
            });
        }

        res.status(200).json({
            success: true,
            message: 'campaign was deleted successfully',
            data: deletedCampaign
        });
    });
});

module.exports = app;