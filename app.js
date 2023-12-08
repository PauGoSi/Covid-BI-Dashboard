// Declare the DOM elements
const countriesElement = document.getElementById("dropdown-countries")
const mainElement = document.getElementById("covid-cases");


// Declare the API URL
const apiCovidUrl = "https://disease.sh/v3/covid-19/historical/";

// Define a function for fetching the data from the API and returning it as a promise
const getCovidApi = async (baseCovidApiUrl) => {
    try {
        const response = await fetch(baseCovidApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null; // Return null in case of an error
    }
}

// Define a function to create Highcharts chart
const createChart = async (data) => {
    try {
        if (data && data.timeline && data.timeline.cases) {
            Highcharts.chart(mainElement, {
                title: {
                    text: `COVID-19 Historical Data for ${data.country}`
                },
                xAxis: {
                    categories: Object.keys(data.timeline.cases),
                },
                yAxis: {
                    title: {
                        text: 'Cases'
                    }
                },
                series: [
                    {
                        name: 'Cases',
                        data: Object.values(data.timeline.cases),
                    },
                    // Add more series for other data points (deaths, recovered, etc.)
                ]
            });
        } else {
            console.error("No valid data available to create chart.");
        }
    } catch (error) {
        console.error("Error creating chart:", error);
    }
};

const getCountryData = async () => {
    // Calling the fetchApi function
    const countries = await getCovidApi(apiCovidUrl);

    // Log the fetched countries to the console
    console.log("Fetched countries:", countries);

    // Looping through the array and creating an option for each country
    for (const country of countries) {
        const countryElement = document.createElement("option");
        countryElement.value = country.country; // Use country name as the value
        countryElement.appendChild(document.createTextNode(country.country + " " + country.province));
        countriesElement.appendChild(countryElement);
    }

    // Set the default country
    const defaultCountry = "Afghanistan";

    // Initialize the chart with the default country on page load
    const initializeChart = async (countryName) => {
        const selectedCountry = countries.find(country => country.country === countryName);

        if (selectedCountry) {
            try {
                const countryData = await getCovidApi(`${apiCovidUrl}${selectedCountry.country}`);
                
                if (countryData && countryData.timeline) {
                    createChart(countryData);
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

    // Call initializeChart with the default country
    initializeChart(defaultCountry);

    // Implementing the "change" event listener for the dropdown
    // Displaying the Covid19 data of the country the user has selected in the dropdown menu
    const handleCountryChange = async e => {
        const selectedCountryName = e.target.value;
        initializeChart(selectedCountryName);
    };

    countriesElement.addEventListener('change', handleCountryChange);
};

// Call getCountryData to initialize the dropdown and event listener
getCountryData();












