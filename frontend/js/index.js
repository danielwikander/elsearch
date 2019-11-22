
// document.getElementById('company_name').addEventListener('input', () => searchCompanies(company_name.value));

// document.addEventListener('DOMContentLoaded', function() {
//   var elems = document.querySelectorAll('select');
//   var instances = M.FormSelect.init(elems, options);
// });

// document.getElementById('company_name').addEventListener('input', () =>
//     $(function () {
//     console.log('input event listener activated')
//         $.ajax({
//             type: 'GET',
//             url: '/getCompanies' +
//                 '?country=' + document.getElementById("country").value +
//                 '?fulltext=' + document.getElementById("company_name").value,
//             success: function (response) {
//                 company_list = []
//                 for (company in response.companies) {
//                     company_list.push({
//                         name: company.name,
//                         id: company.id
//                     })
//                 }
//                 $('input.autocomplete').autocomplete({
//                     data: company_list
//                 });
//             }
//         });
//     }
// ));

// document.addEventListener('DOMContentLoaded', function () {
//         var data =  {
//             "Apple": null,
//             "Microsoft": null,
//             "Google": 'https://placehold.it/250x250'
//         }
//     var elems = document.querySelectorAll('.autocomplete');
//     var instances = M.Autocomplete.init(elems, data);
// });


$(document).ready(function () {
    // var elems = document.querySelectorAll('.autocomplete');
    // var instance = M.Autocomplete.init(elems, options);

    // $('select').formSelect();
    // $('.modal').modal();

    // $('input.autocomplete').autocomplete({
    //     data: {
    //         "Apple": null,
    //         "Microsoft": null,
    //         "Google": 'https://placehold.it/250x250'
    //     },
    // });

    testdata = {
        id: "001",
        text: "companyname"
    }

    // $('input.company_name').autocomplete({
    //     data: testdata
    // });
    var elem = document.querySelector('.autocomplete');
    var instance = M.Autocomplete.init(elem, testdata);
    // var elems = document.querySelectorAll('.autocomplete');
    // var instances = M.Autocomplete.init(elems, testdata);

    document.getElementById('company_name').addEventListener('input', () =>
        $(function () {
            if (document.getElementById('company_name').value.length < 4)
                return

            console.log('input event listener activated')
            $.ajax({
                type: 'GET',
                url: 'http://localhost:8080/getCompanies',
                data: {
                    "country": document.getElementById("country").value,
                    "fulltext": document.getElementById("company_name").value,
                },
                success: function (response) {
                    // console.log(response)
                    // console.log(response.companies)
                    company_list = []
                    for (var i = 0; i < response.companies.length; i++) {
                        company_list.push({
                            text: response.companies[i].name,
                            id: response.companies[i].id
                        })
                        // company_list.push(response.companies[i])
                    }
                    console.log(company_list)
                    // for (company in response.companies) {
                    //     console.log(company.name)
                    //     console.log(company.id)
                    // company_list.push({
                    //     name: company.name,
                    //     id: company.id
                    // })
                    // }
                    testdata = {
                        id: "001",
                        text: "companyname"
                    }
                    $('input.autocomplete').autocomplete({
                        data: company_list
                    });
                }
            });
        }
        ));

    // TEST
    //     $(function () {
    //         $.ajax({
    //             type: 'GET',
    //             url: '/getCompanies' +
    //                 '?country=' + document.getElementById("country").value +
    //                 '?fulltext=' + document.getElementById("company_name").value,
    //             success: function (response) {
    //                 company_list = []
    //                 for (company in response.companies) {
    //                     company_list.push({
    //                         name: company.name,
    //                         id: company.id
    //                     })
    //                 }
    //                 $('input.autocomplete').autocomplete({
    //                     data: company_list
    //                 });
    //             }
    //         });
    //     });
});
function getId() {
    alert($('#company').data('id'));
}

// function searchCompanies(companyName) {
//     if (companyName.length < 3)
//         return

//     let country = document.getElementById('country').value
//     export const getCompanies = () => {
//         return fetch('http://localhost:8080/getCompanies', {
//             method: 'GET'
//         }).then((response) => {
//             console.log(response);
//         })
//     };

// }

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

// $(function() {
//     $.ajax({
//       type: 'GET',
//       url: 'https://restcountries.eu/rest/v2/all?fields=name',
//       success: function(response) {
//         var countryArray = response;
//         var dataCountry = {};
//         for (var i = 0; i < countryArray.length; i++) {
//           //console.log(countryArray[i].name);
//           dataCountry[countryArray[i].name] = countryArray[i].flag; //countryArray[i].flag or null
//         }
//         $('input.autocomplete').autocomplete({
//           data: dataCountry,
//           limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
//         });
//       }
//     });
//   });

// $(".autocomplete").each(function () {
//     let self = this;
//     $(this).autocomplete();
//     $(this).on("input change", function () {
//         $.ajax({
//             url: '/getCompanies',
//             type: 'get',
//             cache: false,
//             // getCompanies?country=SE&fulltext=col
//             data: { country: document.getElementById('country').value,
//                     fulltext: document.getElementById('company').value},
//             success: function (companies) {

//                 var companyNameList = {}


//                 var countryArray = response;
//         var dataCountry = {};
//         for (var i = 0; i < countryArray.length; i++) {
//           //console.log(countryArray[i].name);
//           dataCountry[countryArray[i].name] = countryArray[i].flag; //countryArray[i].flag or null
//         }


//                 companies = JSON.parse(companies);
//                 $(self).autocomplete("updateData", companies/*should be object*/);
//             },
//             error: function (err) {
//                 console.log(err);
//             }
//         });
//     });
// });