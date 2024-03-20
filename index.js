import { createTask } from "./backend.js";
import express from "express";
import bodyParser from 'body-parser';
import multer from 'multer';

const upload = multer()
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

async function task(blob, pkey, url, surl) {
    let data = await createTask(blob, pkey, url, surl);
    let response = {};

    if (data.response.response.solved == true) {
        response['solved'] = true;
        response['token'] = data.token;
    } else if (data.response.solved == false) {
        response['solved'] = false;
        response['token'] = data.token;
    } else {
        response['solved'] = false;
        response['token'] = data.token;
    };

    return response;
};

app.post('/funcaptchaTask', upload.array(), async (req, res) => {
    let data = {};

    data['apiKey'] = req.body.apiKey;
    data['websiteUrl'] = req.body.websiteUrl;
    data['websitePublicKey'] = req.body.websitePublicKey;
    data['websiteSub'] = req.body.websiteSub;
    data['blob'] = req.body.data;

    if (!data.apiKey) {
        res.send({
            error: "Invalid API key"
        });
    } else if (!data.websiteUrl) {
        res.send({
            error: "Invalid website URL"
        });
    } else if (!data.websitePublicKey) {
        res.send({
            error: "Invalid website public key"
        });
    } else if (!data.websiteSub) {
        res.send({
            error: "Invalid website subdomain"
        });
    } else if (!data.blob) {
        res.send({
            error: "Invalid blob"
        });
    } else {
        try {
            res.send(await task(data.blob, data.websitePublicKey, data.websiteUrl, data.websiteSub));
            console.log("Just solved a captcha!");
        } catch (err) {
            console.log("Captcha task failed! |", err);
            res.send({
                solved: false,
                token: null
            });
        };
    };
});

app.listen(5846);