
document.getElementById('company_name').addEventListener('input', () => searchCompanies(company_name.value));



function searchCompanies(companyName) {
    if (companyName.length < 3) 
        return

    let country = document.getElementById('country').value
    export const getCompanies = () => {
        return fetch('http://localhost:8080/getCompanies', {
            method: 'GET'
        }).then((response) => {
            console.log(response);
        })
    };

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