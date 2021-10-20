const covidApi = {
    getSummary: async () => {
        return await fetchRequest(covidApiEndPoints.summary());
    },
    getWorldAllTimeCases: async () => {
        return await fetchRequest(covidApiEndPoints.worldAllTimeCases());
    },
    getCountryAllTimeCases: async (country, status) => {
        return await fetchRequest(covidApiEndPoints.countryAllTimeCases(country, status));
    },
    getWorldDaysCases: async () => {
        return await fetchRequest(covidApiEndPoints.worldDaysCases());
    },
    getCountryDaysCases: async (country, status) => {
        return await fetchRequest(covidApiEndPoints.countryDaysCases(country, status));
    }
}

const covidApiBase = 'https://api.covid19api.com/';

const covidApiEndPoints = {
    summary: () => {
        return getApiPath('summary');
    },
    worldAllTimeCases: () => {
        return getApiPath('world');
    },
    countryAllTimeCases: (country, status) => {
        let endPoint = `dayone/country/${country}/status/${status}`;
        return getApiPath(endPoint);
    },
    countryDaysCases: (country, status) => {
        let date = getDaysRange(30);

        let endPoint = `country/${country}/status/${status}?from=${date.startDate}&to=${date.endDate}`;
        return getApiPath(endPoint);
    },
    worldDaysCases: () => {
        let date = getDaysRange(30);

        let endPoint = `world?from=${date.startDate}&to=${date.endDate}`;
        return getApiPath(endPoint);
    }
}

//! GET THE DATE AT DAYS BEFORE TODAY 
getDaysRange = (days) => {
    let d = new Date();
    let from_d = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000));

    let to_date = `${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()} `;
    let from_date = `${from_d.getFullYear()} - ${from_d.getMonth() + 1} - ${from_d.getDate()} `;

    return {
        startDate: from_date,
        endDate: to_date
    }
}

getApiPath = (endPoint) => {
    return covidApiBase + endPoint;
}
