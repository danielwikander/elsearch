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
    try {
        response.sendFile(path.resolve('./frontend/index.html'));
        await refresh_token()
    } catch (err) {
        console.log(err)
    }
});

app.get('/getCompanies', async (request, response) => {
    try {
        await refresh_token()
        companylist = await get_company_list_from_bisnode(request.query.country, request.query.fulltext)//.catch((error) => console.log(error))
        await response.json(companylist)
    } catch (err) {
        console.log(err)
    }
});

app.get('/getCompany', async (request, response) => {
    try {
        // Searches for company in elastic
        const elastic_response = await get_company_from_elastic(request.query.id);
        if (elastic_response.found == true) {
            await response.json(elastic_response._source)
        } else {
            // If not found in elastic, get from bisnode
            await refresh_token()
            const bisnode_response = await get_company_from_bisnode(request.query.id)
            await response.json(bisnode_response)
            await add_to_elastic(bisnode_response)
        }
    } catch (err) {
        console.log(err)
    }
});


const get_company_from_elastic = async (company_id) => {
    try {
        const { body } = await esclient.get({
            index: 'company',
            id: company_id,
        }).catch(error => {
            if (error.statusCode === 404)
                console.log("Company not found in elastic..")
        })
        console.log("Retrieved company from elastic:")
        console.dir(body._source.name)
        return body
    } catch (error) {
        let bod = {}
        bod.found = false
        return bod
    }
}

const add_to_elastic = async (company) => {
    company = JSON.parse(company)
    console.log("ADDING COMPANY TO ELASTIC:")
    console.dir(company.name)
    await esclient.create({
        index: 'company',
        id: company.id,
        body: company,
        refresh: true
    }) 
}

const get_company_from_bisnode = async (id) => {
    params = { id: id }
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
    return await rp(options).then(async (response) => {
        return response;
    })
}

const get_company_list_from_bisnode = async (country, inputtext) => {
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
    return await rp(options).then(async (response) => {
        return response
    })
}

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
        console.log("New bisnode token:")
        console.log(token)
        // return token
        resolve(token)
    }).catch(error => reject(error))
});

const refresh_token = async () => {
    if (token === undefined || Date.now() + 6000 <= token.expiration_timestamp)
        await get_new_token()
}

// const refresh_token = async () => new Promise((resolve, reject) => {
//     if (token === undefined || Date.now() + 6000 <= token.expiration_timestamp)
//         get_new_token().then(resolve()).catch(reject(reason))
//     else
//         resolve()
// });