// Declare the DOM elements
const mainElement = document.querySelector('main');

// Declare the API URL
const apiCovidUrl = "https://disease.sh/v3/covid-19/historical/";

// Define a function to create Highcharts chart
const createChart = (dataArray) => {
    if (dataArray && dataArray.length > 0) {
        const data = dataArray[0]; // Assuming you want data from the first item in the array
        Highcharts.chart(mainElement, {
            title: {
                text: 'COVID-19 Historical Data for '
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
                // You can add more series for other data points (deaths, recovered, etc.)
            ]
        });
    } else {
        console.error("No data available to create chart.");
    }
}


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

// Wait for the document to be ready before executing the Highcharts code
document.addEventListener('DOMContentLoaded', () => {
    // Call the API and create the chart
    getCovidApi(apiCovidUrl)
        .then(data => {
            console.log(data);
            createChart(data);
        })
        .catch(error => console.error(error));
});

// Log the main element to the console
console.log(mainElement);
