// Declare the DOM elements
const countriesElement = document.getElementById("dropdown-countries");
const provincesElement = document.getElementById("dropdown-provinces");
const covidcasesElement = document.getElementById("covid-cases");

// Declare the API URL
const apiCovidUrl = "https://disease.sh/v3/covid-19/historical/";

// Define a global variable for storing fetched countries
let countries;

// Define a function for fetching the data from the API and returning it as a promise
const getCovidApi = async (baseCovidApiUrl, queryParameters = "") => {
    try {
        const response = await fetch(`${baseCovidApiUrl}${queryParameters}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null; // Return null in case of an error
    }
};

// Define a function to create Highcharts chart
const createChart = (data, selectedProvince = null) => {
    try {
        let titleText = `COVID-19 Historical Data for ${data.country}`;

        if (selectedProvince) {
            titleText += ` - ${selectedProvince}`;
        }

        Highcharts.chart(covidcasesElement, {
            title: {
                text: titleText,
            },
            xAxis: {
                categories: Object.keys(data.timeline.cases),
            },
            yAxis: {
                title: {
                    text: 'Cases',
                },
            },
            series: [
                {
                    name: 'Cases',
                    data: Object.values(data.timeline.cases),
                },
            ],
        });
    } catch (error) {
        console.error("Error creating chart:", error);
    }
};

// Define a function to initialize the chart with default country on page load
const initializeChart = async (countryName, selectedProvince = null) => {
    if (!countries) {
        console.error("Countries data is not available.");
        return;
    }

    const selectedCountry = countries.find(country => country.country === countryName);

    if (selectedCountry) {
        try {
            // Fix the URL by removing the extra "historical"
            let queryParameters = selectedProvince ? `/${selectedProvince}` : "";
            const countryData = await getCovidApi(`${apiCovidUrl}${selectedCountry.country}`, queryParameters);

            if (countryData && countryData.timeline) {
                createChart(countryData, selectedProvince);
            } else {
                console.error("No valid data available for the selected country.");
            }
        } catch (error) {
            console.error("Error fetching data for the selected country:", error);
        }
    } else {
        console.error("Selected country not found in the list.");
    }
};
// Define a function to get province data and populate the dropdown
const getProvinceData = async (selectedCountry, selectedProvince = null) => {
    provincesElement.innerHTML = ""; // Clear previous options

    // Fetch province data based on the selected country and province
    let queryParameters = selectedProvince ? `/${selectedProvince}` : "";
    const countryData = await getCovidApi(`${apiCovidUrl}${selectedCountry}`, queryParameters);

    if (countryData && countryData.timeline) {
        console.log("Province Data:", countryData); // Log the fetched data

        // Populate the province dropdown
        if (countryData.province) {
            for (const province of countryData.province) {
                const provinceElement = document.createElement("option");
                provinceElement.value = province;
                provinceElement.appendChild(document.createTextNode(province));
                provincesElement.appendChild(provinceElement);
            }
        }

        // Trigger the "change" event to update the chart when provinces are populated
        provincesElement.dispatchEvent(new Event("change"));
    } else {
        console.error("No valid data available for the selected country.");
    }
};
// Implementing the "change" event listener for the country dropdown
// Displaying the Covid19 data of the country the user has selected in the dropdown menu
const handleCountryChange = async e => {
    const selectedCountryName = e.target.value;

    // Call the function to populate the province dropdown based on the selected country
    await getProvinceData(selectedCountryName);

    const selectedProvince = provincesElement.value;
    initializeChart(selectedCountryName, selectedProvince);
};
// Implementing the "change" event listener for the country dropdown
// Displaying the Covid19 data of the country the user has selected in the dropdown menu
countriesElement.addEventListener('change', handleCountryChange);

// Implementing the "change" event listener for the province dropdown
// Update the chart based on the selected province within the country
const handleProvinceChange = async () => {
    const selectedCountryName = countriesElement.value;
    const selectedProvince = provincesElement.value;
    initializeChart(selectedCountryName, selectedProvince);
};

// Implementing the "change" event listener for the province dropdown
// Update the chart based on the selected province within the country
provincesElement.addEventListener('change', handleProvinceChange);

// Call getCountryData to initialize the dropdown and event listener
countries = await getCovidApi(apiCovidUrl);
console.log("Fetched countries:", countries);

// Looping through the array and creating an option for each country
for (const country of countries) {
    const countryElement = document.createElement("option");
    countryElement.value = country.country; // Use country name as the value
    countryElement.appendChild(document.createTextNode(country.country));
    countriesElement.appendChild(countryElement);
}

// Set the default country
const defaultCountry = "Afghanistan";

// Initialize the chart with the default country on page load
initializeChart(defaultCountry);