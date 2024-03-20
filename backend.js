import { getToken, Session } from "funcaptcha";
import axios from "axios";
import { Base64 } from 'js-base64';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getInfo(blob, pkey, site, surl) {
    let bda = util_1.getBda("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59", {});

    const token = await getToken({
        pkey: pkey,
        site: site,
        surl: surl,
        data: {
            blob: blob
        },
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59"
        },
        bda: bda
    });

    console.log(bda);

    return token;
};

async function solveCaptcha(model, image, challenge) {
    let responseData = {};
    const options = {
        method: "POST",
        url: "http://127.0.0.1:6969/createTask",
        data: {
            clientKey: "hbubu3456u3428312f84ef4esF7887411",
            task: {
                type: "FunCaptchaClassification",
                image: image,
                question: model
            }
        },
        headers: {
            "Content-Type": "application/json"
        },
    };

    await axios.request(options)
    .then(async function (response) {
        responseData['response'] = await challenge.answer(parseInt(response.data.solution.objects[0]));
    });

    return responseData;
};

async function createTask(blob, pkey, site, surl) {
    let captchaSolverResponse = {};
    let token = await getInfo(blob, pkey, site, surl);
    captchaSolverResponse['token'] = token.token;
    let session = new Session(token, {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59"
    });

    if (session.tokenInfo.sup == "1") {
        console.log("No need to do captcha, continuing...");
        captchaSolverResponse['response'] = {
            response: {
                solved: true
            }
        };
    } else {
        let challenge = await session.getChallenge();

        for(let x = 0; x < challenge.waves; x++) {
            fs.writeFileSync(`${x}.png`, await challenge.getImage());
            captchaSolverResponse['response'] = await solveCaptcha(challenge.variant, Base64.encode(await challenge.getImage()), challenge);
            await sleep(10);
        };
    
    }

    return captchaSolverResponse;
};

export { createTask };