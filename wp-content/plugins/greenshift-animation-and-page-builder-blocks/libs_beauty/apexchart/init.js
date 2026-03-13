var GSloadedChart = false;

const onGSChartInteraction = () => {
    if (GSloadedChart === true) {
        return;
    }
    GSloadedChart = true;

    const ChartScript = document.createElement("script");
    ChartScript.src = gs_chart_params.pluginURL + "/libs/apexchart/apexchart.min.js";
    ChartScript.id = 'gs-chart-loaded';
    document.body.appendChild(ChartScript);

    ChartScript.addEventListener('load', function () {
        GSChartRun();
    });
};

// HTML sanitization function to prevent XSS
const sanitizeChartData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeChartData(item));
    }

    const sanitized = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            
            // Sanitize text fields that ApexCharts renders as HTML
            if (key === 'name' || key === 'categories' || key === 'labels' || 
                (Array.isArray(value) && key !== 'data' && key !== 'series')) {
                if (typeof value === 'string') {
                    // HTML encode the string
                    sanitized[key] = value
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;')
                        .replace(/\//g, '&#x2F;');
                } else if (Array.isArray(value)) {
                    // Sanitize array of strings
                    sanitized[key] = value.map(item => 
                        typeof item === 'string' 
                            ? item.replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/"/g, '&quot;')
                                  .replace(/'/g, '&#x27;')
                                  .replace(/\//g, '&#x2F;')
                            : item
                    );
                } else {
                    sanitized[key] = value;
                }
            } else if (key === 'series' && Array.isArray(value)) {
                // Recursively sanitize series array
                sanitized[key] = value.map(series => {
                    if (typeof series === 'object' && series !== null) {
                        return sanitizeChartData(series);
                    }
                    return series;
                });
            } else {
                // Recursively sanitize nested objects
                sanitized[key] = sanitizeChartData(value);
            }
        }
    }
    return sanitized;
};

const GSChartRun = (documentObject) => {
    let document = documentObject || window.document;
    let charts = document.querySelectorAll('[data-chart-data]');
    for (let i = 0; i < charts.length; i++) {
        let chart = charts[i];
        let rawData = chart.getAttribute('data-chart-data');
        let chartData;

        try {

            // Try to parse it once
            chartData = JSON.parse(rawData);

            // If chartData is still a string, it might be double-encoded
            if (typeof chartData === 'string') {
                chartData = JSON.parse(chartData);
            }


            if (typeof chartData !== 'object') {
                throw new Error('Chart data is not an object after parsing');
            }
            
            // Sanitize the chart data to prevent XSS
            chartData = sanitizeChartData(chartData);
        } catch (e) {
            console.error('Error parsing chart data:', e);
            continue;
        }

        // Handle standard dynamic attributes
        Array.from(chart.attributes).forEach(attr => {
            if (attr.name === 'data-xaxis-categories') {
                let dynamicData = parseAttributeData(attr.value);
                if (chartData.xaxis && dynamicData && dynamicData.length > 0) {
                    console.log(dynamicData);
                    // Sanitize categories before setting
                    chartData.xaxis.categories = dynamicData.map(item => 
                        typeof item === 'string' 
                            ? item.replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/"/g, '&quot;')
                                  .replace(/'/g, '&#x27;')
                                  .replace(/\//g, '&#x2F;')
                            : item
                    );
                }
            } else if (attr.name === 'data-yaxis-categories') {
                let dynamicData = parseAttributeData(attr.value);
                if (chartData.yaxis && dynamicData && dynamicData.length > 0) {
                    // Sanitize categories before setting
                    chartData.yaxis.categories = dynamicData.map(item => 
                        typeof item === 'string' 
                            ? item.replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/"/g, '&quot;')
                                  .replace(/'/g, '&#x27;')
                                  .replace(/\//g, '&#x2F;')
                            : item
                    );
                }
            } else if (attr.name === 'data-labels') {
                let dynamicData = parseAttributeData(attr.value);
                if (dynamicData && dynamicData.length > 0) {
                    // Sanitize labels before setting
                    chartData.labels = dynamicData.map(item => 
                        typeof item === 'string' 
                            ? item.replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/"/g, '&quot;')
                                  .replace(/'/g, '&#x27;')
                                  .replace(/\//g, '&#x2F;')
                            : item
                    );
                }
            } else if (attr.name.startsWith('data-series-')) {
                let seriesIndex = attr.name.replace('data-series-', '');
                let dynamicData = parseAttributeData(attr.value);

                // Find matching series by index or name
                if (chartData.series && dynamicData && dynamicData.length > 0) {
                    if (!isNaN(seriesIndex) && chartData.series[parseInt(seriesIndex)]) {
                        // If index is numeric, update that series
                        chartData.series[parseInt(seriesIndex)].data = dynamicData;
                    } else {
                        // If index is a name, find and update that series
                        let series = chartData.series.find(s => s.name === seriesIndex);
                        if (series) {
                            series.data = dynamicData;
                        }
                    }
                }
            } else if (attr.name == 'data-series') {
                let dynamicData = parseAttributeData(attr.value);
                if (chartData.series && dynamicData && dynamicData.length > 0) {
                    // Sanitize series data before setting
                    chartData.series = sanitizeChartData(dynamicData);
                }
            } else if (attr.name === 'data-series-numbers') {
                let dynamicData = parseAttributeData(attr.value);
                if (chartData.series && dynamicData && dynamicData.length > 0) {
                    // Sanitize series data before setting
                    chartData.series = sanitizeChartData(dynamicData);
                }
            } else if (attr.name == 'data-extra-json') {
                let dynamicData;
                try {
                    dynamicData = JSON.parse(attr.value);
                    // Sanitize extra JSON data before merging
                    dynamicData = sanitizeChartData(dynamicData);
                    chartData = {...chartData, ...dynamicData};
                } catch (e) {
                    console.error('Error parsing extra JSON data:', e);
                }
            }
        });

        function parseAttributeData(value) {
            if (!value || value.trim() === '') {
                return [];
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                const items = value.split(',').map(item => {
                    let trimmed = item.trim();
                    // Only convert to number if it's not empty and is a valid number
                    if (trimmed !== '' && !isNaN(trimmed)) {
                        return parseFloat(trimmed);
                    }
                    return trimmed || null;
                }).filter(item => item !== null && item !== '');

                return items.length ? items : [];
            }
        }

        let chartInstance = new ApexCharts(chart, chartData);
        chartInstance.render();
        let chartId = chart.getAttribute('data-chart-id');
        if (chartId) {
            window[chartId] = chartInstance;
            const downloadDataURI = (uri, filename) => {
                var a = document.createElement('a');
                a.href = uri;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            if (document.querySelector('.download-chart-' + chartId)) {
                document.querySelector('.download-chart-' + chartId).addEventListener('click', function () {
                    chartInstance.dataURI().then(function (uri) {
                        downloadDataURI(uri.imgURI, 'chart.png');
                    });
                });
            }
        }

    }
}

document.body.addEventListener("mouseover", onGSChartInteraction, { once: true });
document.body.addEventListener("touchmove", onGSChartInteraction, { once: true });
window.addEventListener("scroll", onGSChartInteraction, { once: true });
document.body.addEventListener("keydown", onGSChartInteraction, { once: true });

let GSChartImmediateLoading = document.querySelector('[data-immediate-loading]');
if (GSChartImmediateLoading) {
    onGSChartInteraction();
}