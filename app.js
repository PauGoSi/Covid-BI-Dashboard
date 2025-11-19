// DOM elements for dropdown menus
const countriesElement = document.getElementById("dropdown-countries");
const provincesElement = document.getElementById("dropdown-provinces");

// DOM element for the Highcharts combined graph
const covidChartElement = document.getElementById("covid-chart");

// API URL
const apiCovidUrl = "https://disease.sh/v3/covid-19/historical/";

// Global variable for storing fetched countries
let countries;

// Generic fetch helper
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
        return null;
    }
};

// Create a single Highcharts chart with 3 curves
const createCombinedChart = (data, selectedProvince = null) => {
    try {
        let titleText = `COVID-19 Historical Data – ${data.country}`;
        if (selectedProvince) {
            titleText += ` (${selectedProvince})`;
        }

        const dates = Object.keys(data.timeline.cases);
        const cases = Object.values(data.timeline.cases);
        const deaths = Object.values(data.timeline.deaths || {});
        const recovered = Object.values(data.timeline.recovered || {});

        Highcharts.chart(covidChartElement, {
            chart: {
                // This controls the main SVG background (the big rect behind everything)
                backgroundColor: '#020617',          // dark

                // This is the plot area (inside the axes)
                plotBackgroundColor: '#020617',
                plotBorderWidth: 0,
                plotShadow: false,

                zoomType: 'x',
                style: {
                    fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: titleText,
                style: {
                    color: '#e5e7eb'
                }
            },
            subtitle: {
                text: 'Drag to zoom – click legend to hide/show series',
                style: {
                    color: '#9ca3af'
                }
            },
            xAxis: {
                categories: dates,
                crosshair: true,
                lineColor: '#4b5563',
                tickColor: '#4b5563',
                labels: {
                    style: {
                        color: '#9ca3af'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Number of people',
                    style: {
                        color: '#9ca3af'
                    }
                },
                labels: {
                    style: {
                        color: '#9ca3af'
                    }
                },
                gridLineColor: '#1f2937'
            },
            legend: {
                itemStyle: {
                    color: '#e5e7eb'
                },
                itemHoverStyle: {
                    color: '#38bdf8'
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                backgroundColor: '#020617',
                borderColor: '#38bdf8',
                style: {
                    color: '#e5e7eb'
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            halo: {
                                size: 10,
                                attributes: {
                                    fill: "#38bdf8",
                                    opacity: 0.25
                                }
                            }
                        }
                    }
                }
            },
            series: [{
                    name: "Cases",
                    data: cases
                },
                {
                    name: "Deaths",
                    data: deaths
                },
                {
                    name: "Recovered",
                    data: recovered
                }
            ]
        });
    } catch (error) {
        console.error("Error creating chart:", error);
    }
};

// Fetch data for selected country (+ optional province) and draw chart
const initializeChart = async (countryName, selectedProvince = null) => {
    if (!countries) {
        console.error("Countries data is not available.");
        return;
    }

    const selectedCountry = countries.find(
        (country) => country.country === countryName
    );

    if (!selectedCountry) {
        console.error("Selected country not found in the list.");
        return;
    }

    try {
        let queryParameters = selectedProvince ? `/${selectedProvince}` : "";
        const countryData = await getCovidApi(
            `${apiCovidUrl}${selectedCountry.country}`,
            queryParameters
        );

        if (countryData && countryData.timeline) {
            createCombinedChart(countryData, selectedProvince);
        } else {
            console.error("No valid data available for the selected country.");
        }
    } catch (error) {
        console.error("Error fetching data for the selected country:", error);
    }
};

// Get province data and populate the dropdown
const getProvinceData = async (selectedCountry, selectedProvince = null) => {
    provincesElement.innerHTML = ""; // Clear previous options

    // First option: "All provinces"
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.appendChild(document.createTextNode("All provinces"));
    provincesElement.appendChild(defaultOption);

    let queryParameters = selectedProvince ? `/${selectedProvince}` : "";
    const countryData = await getCovidApi(
        `${apiCovidUrl}${selectedCountry}`,
        queryParameters
    );

    if (countryData) {
        if (countryData.province && countryData.province.length > 0) {
            for (const province of countryData.province) {
                const provinceElement = document.createElement("option");
                provinceElement.value = province;
                provinceElement.appendChild(document.createTextNode(province));
                provincesElement.appendChild(provinceElement);
            }

            provincesElement.disabled = false;
        } else {
            // No provinces for this country
            provincesElement.disabled = true;
        }
    } else {
        console.error("No valid data available for the selected country.");
    }

    // Trigger change to update the chart
    provincesElement.dispatchEvent(new Event("change"));
};

// Remove duplicate countries from dropdown
const removeDuplicateCountries = () => {
    const uniqueCountries = Array.from(
        new Set(countries.map((country) => country.country))
    );

    countriesElement.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.appendChild(document.createTextNode("Select a country…"));
    countriesElement.appendChild(placeholderOption);

    for (const country of uniqueCountries) {
        const countryElement = document.createElement("option");
        countryElement.value = country;
        countryElement.appendChild(document.createTextNode(country));
        countriesElement.appendChild(countryElement);
    }
};

// Country change handler
const handleCountryChange = async (e) => {
    const selectedCountryName = e.target.value;
    if (!selectedCountryName) {
        return;
    }
    await getProvinceData(selectedCountryName);
};

// Province change handler
const handleProvinceChange = async () => {
    const selectedCountryName = countriesElement.value;
    if (!selectedCountryName) return;

    const selectedProvince = provincesElement.value || null;
    initializeChart(selectedCountryName, selectedProvince);
};

// Event listeners
countriesElement.addEventListener("change", handleCountryChange);
provincesElement.addEventListener("change", handleProvinceChange);

// ---- Initial load ----

// This endpoint must return the list of countries with historical data.
// Adjust if your API requires query parameters (e.g. ?lastdays=all)
countries = await getCovidApi(apiCovidUrl);
console.log("Fetched countries:", countries);

removeDuplicateCountries();

const defaultCountry = "Afghanistan";
countriesElement.value = defaultCountry;

// Populate provinces + draw default chart
await getProvinceData(defaultCountry);
await initializeChart(defaultCountry, null);
