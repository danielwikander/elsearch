var current_autocomplete_companies = []

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
                current_autocomplete_companies = []
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
                    // current_autocomplete_companies = response.companies
                    var companies = {}

                    // Add response to companylist
                    for (var i = 0; i < response.companies.length; i++) {
                        console.log("adding company to list...")
                        current_autocomplete_companies.push(response.companies[i])
                    }

                    console.log("current autocomplete:")
                    console.log(current_autocomplete_companies)
                    // Create list with only names for autocomplete field
                    if (current_autocomplete_companies.length > 1) {
                        for (let i = 0; i < current_autocomplete_companies.length; i++) {
                            companies[current_autocomplete_companies[i].name] = null 
                        }
                    }

                    $('input.autocomplete').autocomplete("updateData", companies);
                    console.log("updated autocomplete...")
                    var elem = document.querySelector('.autocomplete');
                    var instance = M.Dropdown.getInstance(elem);
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
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/getCompany',
        data: {
            "id": company_to_get.id 
        },
        success: function (response) {
            console.log("Company retrieved successfully...")
            console.log(response)
            fill_form(JSON.parse(response))
        }
    });
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
