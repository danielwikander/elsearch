var current_autocomplete_companies_old = []
var current_autocomplete_companies;

$(document).ready(function () {
    current_autocomplete_companies = new Map();

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
    document.getElementById('company_search').addEventListener('input', () =>
        $(function () {
            if (document.getElementById('company_search').value.length < 4) {
                if(document.getElementById('company_search').value.length == 0) {
                    current_autocomplete_companies.clear()
                    $('input.autocomplete').autocomplete("updateData", {});
                }
                return
            }

            // Request companies from backend
            $.ajax({
                type: 'GET',
                url: 'http://localhost:8080/getCompanies',
                data: {
                    "country": document.getElementById("country").value,
                    "companyLegalName": document.getElementById("company_search").value,
                },
                success: function (response) {
                    console.log("Response retrieved successfully...")

                    // Add response to companylist
                    for (var i = 0; i < response.companies.length; i++) {
                        if (!current_autocomplete_companies.has(response.companies[i].name)) {
                            current_autocomplete_companies.set(response.companies[i].name, response.companies[i])
                        }
                    }

                    // Create list with only names for autocomplete field
                    var companies = {}
                    if (current_autocomplete_companies.size > 0) {
                        for (var company of current_autocomplete_companies.values()) {
                            companies[company.name] = null
                        }
                    }

                    $('input.autocomplete').autocomplete("updateData", companies);
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

// Get specific company by name
function getCompany(company_name) {
    var company_to_get = current_autocomplete_companies.get(company_name)
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/getCompany',
        data: {
            "id": company_to_get.id
        },
        success: function (response) {
            console.log("Company retrieved successfully...")
            // console.log(response)
            // Parse to JSON (catches if already JSON)
            try {
                response = JSON.parse(response)
            } catch { }
            fill_form(response)
        }
    });
}

// Fill the form with values from the retrieved company
function fill_form(company) {
    company.name ?
        document.getElementById('company_name').innerHTML = company['name'] : document.getElementById('company_name').innerHTML = 'Unknown';

    company.vatNo ?
        document.getElementById('vatNo').value = company['vatNo'] : document.getElementById('vatNo').value = 'Unknown';

    company.postalAddress && company.postalAddress.address ?
        document.getElementById('address').value = company.postalAddress.address : document.getElementById('address').value = 'Unknown';

    company.postalAddress && company.postalAddress.zipcode ?
        document.getElementById('zipcode').value = company.postalAddress.zipcode : document.getElementById('zipcode').value = 'Unknown';

    company.postalAddress && company.postalAddress.city ?
        document.getElementById('city').value = company.postalAddress.city : document.getElementById('city').value = 'Unknown';

    company.legalForm && company.legalForm.name ?
        document.getElementById('legal_type').value = company.legalForm.name : document.getElementById('legal_type').value = 'Unknown';

    company.economy && company.economy.turnover && company.economy.turnover.name ?
        document.getElementById('turnover').value = company.economy.turnover.name : document.getElementById('turnover').value = 'Unknown';

    company.economy && company.economy.turnover && company.economy.turnover.name && company.economy.turnover.nameCurrency && document.getElementById('turnover').value != 'Unknown' ?
        document.getElementById('turnover').value += " " + company.economy.turnover.nameCurrency : document.getElementById('turnover').value = 'Unknown';

    company.type && company.type.name ?
        document.getElementById('business_type').value = company.type.name : document.getElementById('business_type').value = 'Unknown';

    company.business && company.business.numberOfEmployees ?
        document.getElementById('number_of_employees').value = company.business.numberOfEmployees.name : document.getElementById('number_of_employees').value = 'Unknown';
}
