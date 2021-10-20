//! TYPEWRITER EFFECT  
$(document).ready(function () {
    var typed = new Typed(".typing", {
        strings: ["Bhavya Khurana"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    })
});

//! CREATE COLORS OBJECT 
const COLORS = {
    confirmed: '#a03331',
    recovered: '#55917f',
    deaths: '#373c43'
}

//! CREATE CASE STATUS
const caseStatus = {
    confirmed: 'confirmed',
    recovered: 'recovered',
    deaths: 'deaths'
}

let body = document.querySelector('body');

let countriesList;

let allTimeChart, daysChart, recoverRateChart;

//! ONLOAD 
window.onload = async () => {
    console.log('Ready...');

    initTheme();

    initCountryFilter();

    //! ONLY INIT CHART ON PAGE LOAD 1ST TIME 
    await initAllTimesChart();

    await initDaysChart();

    await initRecoveryRate();

    await loadData('Global');

    await loadCountrySelectList();

    document.querySelector('#country-select-toggle').onclick = () => {
        document.querySelector('#country-select-list').classList.toggle('active');
    }
}

loadData = async (country) => {
    startLoading();

    await loadSummary(country);

    await loadAllTimeChart(country);

    await loadDaysChart(country);

    endLoading();
}

startLoading = () => {
    body.classList.add('loading');
}

endLoading = () => {
    body.classList.remove('loading');
}

isGlobal = (country) => {
    return country === 'Global';
}

numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

showConfirmedTotal = (total) => {
    document.querySelector('#confirmed-total').textContent = numberWithCommas(total);
}

showRecoveredTotal = (total) => {
    document.querySelector('#recovered-total').textContent = numberWithCommas(total);
}

showDeathsTotal = (total) => {
    document.querySelector('#death-total').textContent = numberWithCommas(total);
}

loadSummary = async (country) => {

    //! COUNTRY SLUG
    let summaryData = await covidApi.getSummary();

    let summary = summaryData.Global;

    if (!isGlobal(country)) {
        summary = summaryData.Countries.filter(e => e.Slug === country)[0]
    }

    showConfirmedTotal(summary.TotalConfirmed);
    showRecoveredTotal(summary.TotalRecovered);
    showDeathsTotal(summary.TotalDeaths);

    //! LOAD RECOVERY RATE 
    await loadRecoveryRate(summary.TotalRecovered / summary.TotalConfirmed * 100);

    //! LOAD TOP COUNTRIES AFFECTED
    let casesByCountries = summaryData.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);

    let tableCountriesBody = document.querySelector('#table-countries tbody');
    tableCountriesBody.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        let row = `
                <tr>
                    <td>${casesByCountries[i].Country}</td>
                    <td>${numberWithCommas(casesByCountries[i].TotalConfirmed)}</td>
                    <td>${numberWithCommas(casesByCountries[i].TotalRecovered)}</td>
                    <td>${numberWithCommas(casesByCountries[i].TotalDeaths)}</td>
                </tr>`

        tableCountriesBody.innerHTML += row;
    }
}

//! ALL TIMES CHART 
initAllTimesChart = async () => {
    let options = {
        chart: {
            type: 'line'
        },
        colors: [COLORS.confirmed, COLORS.recovered, COLORS.deaths],
        series: [],
        xaxis: {
            categories: [],
            labels: {
                show: false
            }
        },
        grid: {
            show: false
        },
        stroke: {
            curve: 'smooth'
        }
    }
    allTimeChart = new ApexCharts(document.querySelector('#all-time-chart'), options);

    allTimeChart.render();
}

renderData = (countryData) => {
    let res = [];
    countryData.forEach(e => {
        res.push(e.Cases);
    });
    return res;
}

renderWorldData = (worldData, status) => {
    let res = [];
    worldData.forEach(e => {
        switch (status) {
            case caseStatus.confirmed:
                res.push(e.TotalConfirmed);
                break
            case caseStatus.recovered:
                res.push(e.TotalRecovered);
                break
            case caseStatus.deaths:
                res.push(e.TotalDeaths);
                break
        }
    });
    return res;
}

loadAllTimeChart = async (country) => {
    let labels = [];

    let confirmData, recoveredData, deathsData;

    if (isGlobal(country)) {
        let worldData = await covidApi.getWorldAllTimeCases();

        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
        worldData.forEach(e => {
            let d = new Date(e.Date);
            labels.push(`${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()}`);
        });

        confirmData = renderWorldData(worldData, caseStatus.confirmed);
        recoveredData = renderWorldData(worldData, caseStatus.recovered);
        deathsData = renderWorldData(worldData, caseStatus.deaths);
        console.log(worldData);
    } else {
        let confirmed = await covidApi.getCountryAllTimeCases(country, caseStatus.confirmed);
        let recovered = await covidApi.getCountryAllTimeCases(country, caseStatus.recovered);
        let deaths = await covidApi.getCountryAllTimeCases(country, caseStatus.deaths);

        confirmData = renderData(confirmed);
        recoveredData = renderData(recovered);
        deathsData = renderData(deaths);

        confirmed.forEach(e => {
            let d = new Date(e.Date);
            labels.push(`${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()}`);
        });
    }

    let series = [{
        name: 'Confirmed',
        data: confirmData
    }, {
        name: 'Recovered',
        data: recoveredData
    }, {
        name: 'Deaths',
        data: deathsData
    }]

    allTimeChart.updateOptions({
        series: series,
        xaxis: {
            categories: labels
        }
    });
}

initDaysChart = async () => {
    let options = {
        chart: {
            type: 'line'
        },
        colors: [COLORS.confirmed, COLORS.recovered, COLORS.deaths],
        series: [],
        xaxis: {
            categories: [],
            labels: {
                show: false
            }
        },
        grid: {
            show: false
        },
        stroke: {
            curve: 'smooth'
        }
    }
    daysChart = new ApexCharts(document.querySelector('#days-chart'), options);

    daysChart.render();
}

loadDaysChart = async (country) => {
    let labels = [];

    let confirmData, recoveredData, deathsData;

    if (isGlobal(country)) {
        let worldData = await covidApi.getWorldDaysCases();

        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
        worldData.forEach(e => {
            let d = new Date(e.Date);
            labels.push(`${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()}`);
        });

        confirmData = renderWorldData(worldData, caseStatus.confirmed);
        recoveredData = renderWorldData(worldData, caseStatus.recovered);
        deathsData = renderWorldData(worldData, caseStatus.deaths);
        console.log(worldData);
    } else {
        let confirmed = await covidApi.getCountryDaysCases(country, caseStatus.confirmed);
        let recovered = await covidApi.getCountryDaysCases(country, caseStatus.recovered);
        let deaths = await covidApi.getCountryDaysCases(country, caseStatus.deaths);

        confirmData = renderData(confirmed);
        recoveredData = renderData(recovered);
        deathsData = renderData(deaths);

        confirmed.forEach(e => {
            let d = new Date(e.Date);
            labels.push(`${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()}`);
        });
    }

    let series = [{
        name: 'Confirmed',
        data: confirmData
    }, {
        name: 'Recovered',
        data: recoveredData
    }, {
        name: 'Deaths',
        data: deathsData
    }]

    daysChart.updateOptions({
        series: series,
        xaxis: {
            categories: labels
        }
    });
}

initRecoveryRate = async () => {
    let options = {
        chart: {
            type: 'radialBar',
            height: '350'
        },
        series: [],
        labels: ['Recovery Rate'],
        colors: [COLORS.recovered]
    }
    recoverRateChart = new ApexCharts(document.querySelector('#recover-rate-chart'), options);

    recoverRateChart.render();
}

loadRecoveryRate = async (rate) => {
    //! USE updateSeries 
    recoverRateChart.updateSeries([rate]);
}

//! COUNTRY SELECT
renderCountrySelectList = (list) => {
    let countrySelectList = document.querySelector('#country-select-list')
    countrySelectList.querySelectorAll('div').forEach(e => e.remove())
    list.forEach(e => {
        let item = document.createElement('div')
        item.classList.add('country-item')
        item.textContent = e.Country

        item.onclick = async () => {
            document.querySelector('#country-select span').textContent = e.Country
            countrySelectList.classList.toggle('active')
            await loadData(e.Slug)
        }

        countrySelectList.appendChild(item)
    })
}

loadCountrySelectList = async () => {
    let summaryData = await covidApi.getSummary();

    countriesList = summaryData.Countries;

    let countrySelectList = document.querySelector('#country-select-list');

    let item = document.createElement('div');
    item.classList.add('country-item');
    item.textContent = 'Global';
    item.onclick = async () => {
        document.querySelector('#country-select span').textContent = 'Global'
        country_select_list.classList.toggle('active')
        await loadData('Global')
    }
    countrySelectList.appendChild(item);

    renderCountrySelectList(countriesList);
}

//! COUNTRY FILTER
initCountryFilter = () => {
    let input = document.querySelector('#country-select-list input');
    input.onkeyup = () => {
        let filtered = countriesList.filter(e => e.Country.toLowerCase().includes(input.value));
        renderCountrySelectList(filtered);
    }
}

//! DARK MODE SWITCH
initTheme = () => {
    let darkModeSwitch = document.getElementById('darkmode-switch');
    darkModeSwitch.onclick = () => {
        darkModeSwitch.classList.toggle('dark');
        body.classList.toggle('dark');

        setDarkChart(body.classList.contains('dark'));
    }
}

//! SET DARK MODE FOR CHARTS
setDarkChart = (dark) => {
    let theme = {
        theme: {
            mode: dark ? 'dark' : 'light'
        }
    }
    allTimeChart.updateOptions(theme)
    daysChart.updateOptions(theme)
    recoverRateChart.updateOptions(theme)
}