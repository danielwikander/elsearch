var request = require('request');
var cred = require('./secrets.json');
var querystring = require('querystring');
const express = require('express');
var cookieParser = require('cookie-parser');

const app = new express();
app.use(cookieParser());

var token;

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', function (request, response) {
    response.sendFile('./index.html', { root: __dirname});

    if (token === undefined || is_soon_to_be_expired()) {
        get_new_token();
    }
    // get_companies('SE', 'colum', token)
});


app.get('/getCompanies', async (request, response) => {
    if (token === undefined || await is_soon_to_be_expired()) 
        token = await get_new_token()

    let companylist = await get_companies(request.query.country, request.query.fulltext, token)
    response.json(companylist)
    
    // console.log(request)
    // companies = get_companies(request.query.country, request.query.fulltext, token)
    // response.json(companies);

    // get_companies('SE', 'colum', token)
});

app.get('/getCompany', async (request, response) => {
    if (token === undefined || await is_soon_to_be_expired()) 
        token = await get_new_token()
       
    let company = await get_company(request.query.id, token)
    response.json(company)
});

const get_company = async (id, token) => {
    params = {id: id}
    const paramString = new URLSearchParams(params)
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
        // if (err) 
            // console.log(err)

        // if(res) 
            // console.log(res)
        // console.log(body)


        let json = JSON.parse(body);
        return json
        // console.log(json);
    });
}

const get_companies = async (country, inputtext, token) => {
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
        }
    }
    request(options, function (err, res, body) {
        // if (err) 
            // console.log(err)

        // if(res) 
            // console.log(res)
        // console.log(body)


        let json = JSON.parse(body);
        return json
    });

}


const get_new_token = async() => {
 return new Promise((resolve, reject) => {
    let body = querystring.stringify({
        "grant_type": cred['grant_type'],
        "scope": cred['scope'],
        "client_id": cred['client_id'],
        "client_secret": cred['client_secret']
    })

    let options = {
        "url": 'https://login.bisnode.com/as/token.oauth2',
        "method": 'POST',
        "headers": {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    }
    var new_token
    request.post(options,
        function (error, response, body) {
            if (error) {
                console.error(error)
                return
            }
            console.log(`statusCode: ${response.statusCode}`)

            new_token = JSON.parse(body)
            new_token.expiration_timestamp = Date.now() + new_token['expires_in'];
            token = new_token
            resolve(token)
        });
  })
}

const is_soon_to_be_expired = async() => {
    // Add time margin to avoid token expiring during call (1 min)
    if (Date.now() + 60000 >= token.expiration_timestamp)
        return true
    return false
}