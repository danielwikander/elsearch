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
    document.getElementById('company_search').addEventListener('input', () =>
        $(function () {
            if (document.getElementById('company_search').value.length < 4) {
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
                    "fulltext": document.getElementById("company_search").value,
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
    var company_to_get;
    for (let i = 0; i < current_autocomplete_companies.length; i++) {
        if (current_autocomplete_companies[i].name == company_name) {
            company_to_get = current_autocomplete_companies[i];
            break;
        }
    }

    console.log(company_to_get)
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
            } catch {}
            fill_form(response)
        }
    });
}



function fill_form(company) {
    // Fill the form with values from the retrieved company
    console.log(company)
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
