const express = require('express');
var rp = require('request-promise');
var cred = require('./secrets.json');
var querystring = require('querystring');
var path = require('path');
const { Client } = require('@elastic/elasticsearch')
const esclient = new Client({
    node: cred['elastic_url'],
    auth: {
        username: cred['elastic_user'],
        password: cred['elastic_password']
    }
})

const app = new express();
app.use(express.static(path.join(__dirname, 'frontend')));
let token;

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', async (request, response) => {
    response.sendFile(path.resolve('./frontend/index.html'));
    await refresh_token().catch(error => console.log(error))
});


app.get('/getCompanies', async (request, response) => {
    await refresh_token().catch(error => console.log(error))
    let companylist = await get_companies(request.query.country, request.query.fulltext, token).catch((error) => console.log(error))
    await response.json(companylist) //.catch(error => console.log(error))
});

app.get('/getCompany', async (request, response) => {
    try {
        let company = await get_from_elastic(request.query.id).catch((error) => console.log(error))
        if (company) {
            await response.json(company)
        } else {
            await refresh_token().catch(error => console.log(error))
            company = await get_company(request.query.id, token).catch((error) => console.log(error))
            await response.json(company)
            await add_to_elastic(company).catch((error => console.log(error)))
        }
    } catch (error) {
        console.log("CATCH ERROR")
        console.log(error)
    }
});

const get_from_elastic = async (company_id) => {
    const { body } = await esclient.search({
        index: 'company',
        body: {
            query: {
                match: { id: company_id }
            }
        }
    })
    console.log("RETRIEVED FROM ELASTIC:")
    console.log(body)

    console.log("elastic length :")
    console.log(body.hits.hits.length)
    if (body.hits.hits.length > 0) {
        for (let i = 0; i < body.hits.hits.length; i++) {
            console.log(body.hits.hits[i])
        }
        console.log("ELASTIC RESOLVED.")
        Promise.resolve(body)
    } else {
        console.log("ELASTIC REJECTED.")
        Promise.reject()
    }
}

const add_to_elastic = async (company) => {
    console.log("COMPANY TO ADD TO ELASTIC:")
    var newcomp = {id :1, name: 'test'}
    console.log(company)
    console.log("ADDING COMPANY TO ELASTIC")
    await esclient.index({
        index: 'company',
        body: company,
        id: company.id
    }), function (err, resp, status) {
        console.log(resp);
    }
}

const get_company = async (id, token) => new Promise((resolve, reject) => {
    params = { id: id }
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
    rp(options).then(async (response) => {
        resolve(response)
    }).catch(err => reject(err))
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
    rp(options).then(async (response) => {
        resolve(response)
    }).catch(err => reject(err))
});

const get_new_token = async () => new Promise((resolve, reject) => {
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
    rp(options).then(async (body) => {
        token = body
        token.expiration_timestamp = Date.now() + body['expires_in']
        console.log(token)
        resolve(token)
    }).catch(error => reject(error))
});


const refresh_token = async () => new Promise((resolve, reject) => {
    if (token === undefined || Date.now() + 6000 <= token.expiration_timestamp)
        get_new_token().then(resolve()).catch(reject(reason))
    else
        resolve()
});