const express    = require('express');
var rp           = require('request-promise');
var cred         = require('./secrets.json');
var querystring  = require('querystring');
var path         = require('path');

const app = new express();
app.use(express.static(path.join(__dirname, 'frontend')));
let token;

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', async (request, response) => {
    response.sendFile(path.resolve('./frontend/index.html'));
    await refresh_token().catch(error => console.log(error))
    // let comp = await get_companies('SE', 'colu', token).catch(error => console.log(error))
    // console.log(comp)
});


app.get('/getCompanies', async (request, response) => {
    console.log("Recieved request for companies:")
    console.log(request.query.country)
    console.log(request.query.fulltext)
    console.log(" ")
    await refresh_token().catch(error => console.log(error))
    let companylist = await get_companies(request.query.country, request.query.fulltext, token).catch((error) => console.log(error))
    await response.json(companylist) //.catch(error => console.log(error))
    console.log("RETURNED :")
    console.log(companylist)
});

app.get('/getCompany', async (request, response) => {
    await refresh_token().catch(error => console.log(error))
    let company = await get_company(request.query.id, token).catch((error) => console.log(error))
    await response.json(company)
});

const get_company = async (id, token) => new Promise((resolve, reject) => {
    params = {id: id}
    // const paramString = new URLSearchParams(params)
    url = `https://api.bisnode.com/bbc/v2/companies/${id}`;
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': "application/hal+json;charset=UTF-8",
            'Accept-Charset': 'utf-8',
            'Authorization': token.token_type + ' ' + token.access_token
        }
    }
    request(options, function (err, res, body) {
        if (err) 
            reject(err)

        // if(res) 
            // console.log(res)
        // console.log(body)

        let json = JSON.parse(body);
        console.log(json)
        resolve(json)
    });
});

const get_companies = async (country, inputtext, token) => new Promise((resolve, reject) => {
    const params = { country: country, fulltext: inputtext }
    const paramString = new URLSearchParams(params)

    url = `https://api.bisnode.com/bbc/v2/companies?${paramString.toString()}`;
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': "application/hal+json;charset=UTF-8",
            'Accept-Charset': 'utf-8',
            'Authorization': token.token_type + ' ' + token.access_token
        },
        json: true
    }
    rp(options).then(async(response) => {
        resolve(response)
    }).catch(err => reject(err))

    // request(options, function (err, res, body) {
    //     if (err) {
    //         reject(err)
    //     }
    //     // if(res) 
    //         // console.log(res)
    //     // console.log(body)

    //     let json = JSON.parse(body);
    //     resolve(json)
    // });
});

const get_new_token = async() => new Promise((resolve, reject) => {
    let body = querystring.stringify({
        "grant_type": cred['grant_type'],
        "scope": cred['scope'],
        "client_id": cred['client_id'],
        "client_secret": cred['client_secret']
    });
    let options = {
        "url": 'https://login.bisnode.com/as/token.oauth2',
        "method": 'POST',
        "headers": {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body,
        json: true
    };
    rp(options).then(async(body) => {
        token = body
        token.expiration_timestamp = Date.now() + body['expires_in']
        console.log(token)
        resolve(token)
    }).catch(error => reject(error))
    // var new_token;
    // request.post(options, function (error, response, body) {
    //     if (error) {
    //         console.log("GETTOKEN ERROR")
    //         reject(error)
    //     }
    //     console.log(`statusCode: ${response.statusCode}`);
    //     new_token = JSON.parse(body);
    //     new_token.expiration_timestamp = Date.now() + new_token['expires_in'];
    //     token = new_token;
    //     console.log("GETTOKEN SUCCESS, TOKEN: ")
    //     console.log(token);
    //     resolve(token);
    // });
});

const refresh_token = async() => new Promise((resolve,reject) => {
    if (token === undefined || Date.now() + 6000 <= token.expiration_timestamp)
        get_new_token().then(resolve()).catch(reject(reason))
    else 
        resolve()
});

// async function is_token_valid() {
//     await new Promise((resolve, reject) => {
//         if (token === undefined || Date.now() + 6000 <= token.expiration_timestamp)
//             reject()
//         else 
//             resolve()
//     })
// }
// async function is_soon_to_be_expired() {
//     await new Promise((resolve, reject) => {
//         if (Date.now() + 60000 >= token.expiration_timestamp)
//             resolve()
//         else 
//             reject()
//     })
    // if (Date.now() + 60000 >= token.expiration_timestamp)
    //     await new Promise(resolve, true);
    //     // return true
    // await new Promise(reject, false);
    // // return false
// }

// const is_soon_to_be_expired = async() => {
//     // Add time margin to avoid token expiring during call (1 min)
//     if (Date.now() + 60000 >= token.expiration_timestamp)
//         return true
//     return false
// }