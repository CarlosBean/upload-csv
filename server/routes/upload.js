const express = require('express');
const fileUpload = require('express-fileupload');

const csv = require('fast-csv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const app = express();

const User = require('../models/user');
const Campaign = require('../models/campaign');
const Customer = require('../models/customer');

app.use(fileUpload());

app.put('/upload/csv/customers/:campaignid', async (req, res) => {
    const id = req.params.campaignid;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'no files were uploaded',
            err: { message: 'no files were uploaded' }
        });
    }

    if (!req.body.config) {
        return res.status(400).json({
            success: false,
            message: 'an import configuration must be provided',
            err: { message: 'an import configuration must be provided in order to proccess CSV file' }
        });
    }

    let config = JSON.parse(req.body.config);
    let columnsConfig = config.columns.map(column => column.split('-')[0] === "ignore" ? undefined : column);

    const file = req.files.file;
    const filetype = file.name.split('.').pop();
    const allowedFiletypes = ['xlsx', 'xls', 'csv'];

    if (!allowedFiletypes.includes(filetype)) {
        return res.status(400).json({
            success: false,
            message: `${filetype} files are not allowed`,
            errors: { message: `allowed filetypes are ${allowedFiletypes.join(', ')}` }
        });
    }

    Campaign.findById(id, (err, foundCampaign) => {
        const filename = `${uuidv4()}.${filetype}`;
        const fileLocation = path.resolve(__dirname, `../../uploads/temp/${filename}`);

        if (err) {
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                return res.status(404).json({
                    success: false,
                    message: `Campaign with id ${id} is not exist`,
                    err: { message: `Campaign with id ${id} is not exist` }
                });
            }

            return res.status(500).json({
                success: false,
                message: `an error ocurred while attempting to search the Campaign`,
                err
            });
        }

        if (!foundCampaign) {
            return res.status(404).json({
                success: false,
                message: `Campaign with id ${id} is not exist`,
                err: { message: `Campaign with id ${id} is not exist` }
            });
        }

        file.mv(fileLocation, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'an error ocurred while attempting to upload the file',
                    err
                });
            }

            const stream = fs.createReadStream(fileLocation);
            stream
                .pipe(csv.parse({ headers: columnsConfig, delimiter: config.delimiter }))
                .on('error', error => console.error(error))
                .on('data', async row => {
                    try {
                        stream.pause();
                        let mappedRow = Object.keys(row).map(key => {
                            return { [key.split('-')[0]]: row[key] }
                        });

                        console.log(row);

                        const data = groupBy(mappedRow);
                        await insertCustomer(res, data, foundCampaign);
                    } finally {
                        stream.resume();
                    }
                })
                .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

            if (fs.existsSync(fileLocation)) { fs.unlinkSync(fileLocation); }

            return res.json({
                success: true,
                message: 'customers created successfully',
                data: { campaign: foundCampaign.name }
            });
        });
    });
});

function groupBy(data) {
    return data.reduce((storage, item) => {
        var group = Object.keys(item)[0];
        storage[group] = storage[group] || [];
        storage[group].push(Object.values(item)[0]);
        return storage;
    }, {});
};


async function insertCustomer(res, data, campaign) {
    const customer = new Customer({
        names: data.names,
        lastnames: data.lastnames,
        addresses: data.addresses,
        phones: data.phones,
        campaign
    });

    customer.save((err, savedCustomer) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'an error ocurred while attempting to create the user',
                err
            })
        }
    });
}

module.exports = app;