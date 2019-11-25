var current_autocomplete_companies = {}

$(document).ready(function () {
    // Add autocomplete element 
    var elem = document.querySelector('.autocomplete');
    var instance = M.Autocomplete.init(elem, {});

    $('input.autocomplete').autocomplete({
        data: {},
        limit: 5,
        onAutocomplete: (val) => {
            getCompany(val)
        }
    });

    // Add eventlistener on textfield for autocomplete
    document.getElementById('company_name').addEventListener('input', () =>
        $(function () {
            if (document.getElementById('company_name').value.length < 4) {
                return
            }

            // Request companies from backend
            console.log("Making get request..")
            $.ajax({
                type: 'GET',
                url: 'http://localhost:8080/getCompanies',
                data: {
                    "country": document.getElementById("country").value,
                    "fulltext": document.getElementById("company_name").value,
                },
                success: function (response) {
                    console.log("Response retrieved successfully...")
                    current_autocomplete_companies = response.companies
                    var companies = {}
                    for (var i = 0; i < response.companies.length; i++) {
                        companies[response.companies[i].name] = null // response.companies[i].id
                        // if (!response.companies[i] in current_autocomplete_companies) {
                            // console.log("ADDING TO current")
                            // current_autocomplete_companies.push(response.companies[i])
                        // }
                    }
                    // console.log("current in get request")
                    // console.log(current_autocomplete_companies)

                    // $('input.autocomplete').autocomplete({
                    //     data: companies,
                    //     limit: 5,
                    //     onAutocomplete: (val) => {
                    //         console.log("onAutocomplete()")
                    //         for (let company in response.companies) {
                    //             if (company.name == val)
                    //                 fillForm(company)
                    //             break
                    //         }
                    //     }
                    // });

                    $('input.autocomplete').autocomplete("updateData", companies);
                    var elem = document.querySelector('.autocomplete');
                    var instance = M.Dropdown.getInstance(elem);
                    // instance.updateData(companies);
                    if (instance) {
                        if (!instance.isOpen)
                            instance.open();
                        instance.recalculateDimensions();
                    }
                }
            });
        })
    );
});

var TESTDATA = {
    "$schema": "https://api.bisnode.com/bbc/v2/schemas/company.schema.json",
    "$lastModified": "2019-05-24T19:07:22.084Z",
    "name": "Apple Import",
    "country": {
        "code": "SE",
        "name": "Sweden"
    },
    "status": {
        "code": "ST90",
        "name": "Not yet active"
    }, "type": {
        "code": "TY99",
        "name": "Unknown"
    },
    "registrationDate": "1985-11-18",
    "nationalRegistrationNumber": "5905120316",
    "vatNo": "SE590512031601",
    "legalForm": {
        "code": "JF10",
        "name": "Propriotorship"
    },
    "business": {
        "activities": {
            "mainActivity": {
                "code": "HG0000900",
                "description": "Main industry unknown"
            },
            "subActivities": [],
            "local": {
                "mainActivity": {
                    "code": "HG0000900",
                    "description": "Unknown"
                },
                "subActivities": [
                    {
                        "code": "OV990",
                        "description": "Class unknown"
                    }
                ]
            }
        },
        "numberOfEmployees": {
            "code": "AA99",
            "name": "Unknown"
        },
        "numberOfOfficeEmployees": {
            "code": "KA01",
            "name": "0"
        }
    },
    "addressSource": "PARAD, 169 93 Solna, Sweden",
    "id": "1:102725275",
    "_links": {
        "self": {
            "href": "https://api.bisnode.com/bbc/v2/companies/1:102725275"
        }
    }
}

function getCompany(company_name) {
    // let company_name = document.getElementById('company_name').value;
    var company_to_get;
    console.log(current_autocomplete_companies)
    for (let i = 0; i < current_autocomplete_companies.length; i++) {
        console.log(current_autocomplete_companies[i].name)
        if (current_autocomplete_companies[i].name == company_name) {
            company_to_get = current_autocomplete_companies[i];
            console.log("FOUND MATCH")
            break;
        }
    }

    console.log(company_to_get)
    // Get company from backend
    // FUNCTIONAL - USE TEST DATA IN THE MEANTIME
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/getCompany',
        data: {
            "id": company_to_get.id // TODO: Cannot read prop ID of undefined? 
        },
        success: function (response) {
            console.log("Company retrieved successfully...")
            console.log(response)
            fill_form(JSON.parse(response))
        }
    });
    // fill_form(TESTDATA)
}



function fill_form(company) {
    console.log(company)
    document.getElementById('vatNo').value = company['vatNo'];
    document.getElementById('address').value = company['addressSource'];
    // document.getElementById('zipcode').value = company.zipcode; // ?
    // document.getElementById('city').value = company.city;// ?
    document.getElementById('legal_type').value = company['legalForm']['name'];
    // document.getElementById('turnover').value = company.turnover;// ?
    // document.getElementById('business_type').value = company.business.;// ?
    document.getElementById('number_of_employees').value = company['business']['numberOfEmployees']['name'];
}


const searchcountry = async searchBox => {
    const res = await fetch('../data/countries.json');
    const countries = await res.json();

    //Get & Filter Through Entered Data
    let fits = countries.filter(country => {
        const regex = new RegExp(`^${searchBox}`, 'gi');
        return country.name.match(regex) || country.abbr.match(regex);
    });

    //Clears Data If Search Input Field Is Empty
    if (searchBox.length === 0) {
        fits = [];
        countryList.innerHTML = '';
    }
    outputHtml(fits);
};


function fillform(company) {
    document.getElementById('address').value = company.address
}
