import * as d3 from 'd3';

const API_URL = 'https://gisblue.mdc.mo.gov/arcgis/rest/services/Terrestrial/CWD_Fall_Reporting_Dashboard/MapServer/26/query?f=json&where=1%3D1&outFields=*';

export async function loadData() {
    try {
        // Try to fetch from API first
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features.map(feature => feature.attributes);
        } else {
            throw new Error('No features found in API response');
        }
    } catch (error) {
        console.warn('Failed to load from API, falling back to local data:', error);

        // Fallback to local data file
        try {
            const localData = await d3.json('/output-data.json');
            if (localData.features && localData.features.length > 0) {
                return localData.features.map(feature => feature.attributes);
            } else {
                throw new Error('No features found in local data');
            }
        } catch (localError) {
            console.error('Failed to load local data:', localError);
            throw new Error('Failed to load data from both API and local file');
        }
    }
}

export function processData(rawData) {
    if (!rawData || !Array.isArray(rawData)) {
        console.error('Invalid data provided to processData');
        return [];
    }

    return rawData.map(d => {
        try {
            return {
                objectId: d.OBJECTID,
                permitYear: d.PERMITYEAR,
                collectionType: d.Collection_Type,
                collectionTypeName: getCollectionTypeName(d.Collection_Type),
                result: d.RESULT || 'Unknown',
                collectionDate: parseDate(d.CollectionDate),
                harvestDate: parseHarvestDate(d.HARVEST_DATE),
                sampleType: d.SampleType,
                deerSex: d.Deer_Sex,
                deerSexName: getDeerSexName(d.Deer_Sex),
                deerAge: d.Deer_Age,
                deerAgeName: getDeerAgeName(d.Deer_Age),
                county: d.County,
                countyName: d.CountyName,
                coreArea: d.CoreArea,
                township: d.Township,
                range: d.Range,
                townshipRange: d.TownshipRange,
                section: d.Section,
                gisLabel: d.GISlabel,
                nonMDC: d.Non_MDC === 1,
                mobileApp: d.MobileApp,
                specimenNo: d.Specimen_No,
                publish: d.Publish === 'Y',
                telecheckId: d.TelecheckID
            };
        } catch (error) {
            console.warn('Error processing data row:', error, d);
            return null;
        }
    }).filter(d => d !== null);
}

function getCollectionTypeName(type) {
    switch (type) {
        case '1': return 'Hunter Harvest';
        case '2': return 'Surveillance';
        default: return 'Unknown';
    }
}

function getDeerSexName(sex) {
    switch (sex) {
        case 'M': return 'Male';
        case 'F': return 'Female';
        default: return 'Unknown';
    }
}

function getDeerAgeName(age) {
    switch (age) {
        case 'A': return 'Adult';
        case 'Y': return 'Young';
        case 'F': return 'Fawn';
        case 'U': return 'Unknown';
        default: return 'Unknown';
    }
}

function parseDate(dateString) {
    if (!dateString) return null;

    // Handle YYYYMMDD format
    if (typeof dateString === 'string' && dateString.length === 8) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return new Date(year, month - 1, day);
    }

    return null;
}

function parseHarvestDate(dateString) {
    if (!dateString) return null;

    // Handle MM/DD/YYYY format
    if (typeof dateString === 'string' && dateString.includes('/')) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    return null;
}

export function groupByCounty(data) {
    const grouped = d3.group(data, d => d.countyName);

    return Array.from(grouped, ([county, samples]) => ({
        county,
        count: samples.length,
        pending: samples.filter(d => d.result === 'Pending').length,
        positive: samples.filter(d => d.result === 'Positive').length,
        negative: samples.filter(d => d.result === 'Negative').length,
        samples
    })).filter(d => d.county); // Remove entries without county names
}