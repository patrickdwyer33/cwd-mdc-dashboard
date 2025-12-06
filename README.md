# CWD MDC Dashboard

A web application dashboard for visualizing Missouri Department of Conservation (MDC) Chronic Wasting Disease (CWD) surveillance data across all Missouri counties.

## Overview

This interactive dashboard provides comprehensive visualization of CWD testing data from deer samples collected throughout Missouri. Users can explore sampling results through both an interactive map interface and tabular data views, allowing analysis by individual counties or statewide aggregations.

## Features

- **Interactive Map**: Visualize CWD testing locations and results across Missouri counties
- **Tabular Data Views**: Browse detailed sampling data with filtering and sorting capabilities
- **County-Level Analysis**: Examine CWD surveillance data for specific counties
- **Statewide Overview**: View aggregate statistics and trends across Missouri
- **Real-time Data**: Connected to live MDC CWD surveillance database

## Data Source

The dashboard consumes data from the MDC CWD Fall Reporting Dashboard ArcGIS REST service:

```
https://gisblue.mdc.mo.gov/arcgis/rest/services/Terrestrial/CWD_Fall_Reporting_Dashboard/MapServer/26/query
```

### Data Fields

The dataset includes comprehensive information about each deer sample:

- **Sample Information**: Collection date, specimen number, sample type, test results
- **Deer Demographics**: Sex (M/F), age category (A=Adult, Y=Young, U=Unknown)
- **Location Data**: County, township, range, section, GIS coordinates
- **Administrative**: Permit year, telecheck ID, publication status, MDC/Non-MDC classification
- **Collection Type**: Hunter-harvested (1) vs. surveillance collection (2)

### Sample Data Structure

```json
{
  "OBJECTID": 1,
  "PERMITYEAR": "2024",
  "Collection_Type": "2",
  "RESULT": "Pending",
  "CollectionDate": "20250522",
  "HARVEST_DATE": null,
  "SampleType": "RPLN",
  "Deer_Sex": "F",
  "Deer_Age": "A",
  "County": "049",
  "CountyName": "Jasper",
  "Township": null,
  "Range": null,
  "Section": null,
  "Non_MDC": 0,
  "Specimen_No": 20272083,
  "Publish": "Y",
  "TelecheckID": null
}
```

## Technology Stack

- **Frontend**: Vanilla JavaScript with D3.js for data visualization
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: CSS3 with responsive design
- **Data**: ArcGIS REST API with local fallback

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cwd-mdc-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Usage

#### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

#### Features
- **Interactive Filters**: Filter data by year, county, and test results
- **Real-time Stats**: View summary statistics that update as you filter
- **Sortable Table**: Click column headers to sort data
- **Search**: Use the search box to find specific samples
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## API Reference

The application queries the MDC ArcGIS REST service with the following parameters:

- **Format**: JSON (`f=json`)
- **Query**: All records (`where=1%3D1`)
- **Fields**: All available fields (`outFields=*`)

See `query.sql` for the complete API endpoint URL.

## Development

### Data Processing Notes

- Collection dates are stored in YYYYMMDD format
- Harvest dates use MM/DD/YYYY format when present
- County codes are 3-digit numeric strings
- Test results include: "Pending", "Positive", "Negative" (actual values TBD)
- Some location fields (Township, Range, Section) may be null for certain collection types

### Key Data Considerations

- **Collection Types**:
  - Type "1": Hunter-harvested samples
  - Type "2": Surveillance/monitoring samples
- **Age Categories**: A=Adult, Y=Young, U=Unknown, F=Fawn
- **Location Granularity**: Ranges from county-level to specific section within township/range
- **Data Completeness**: Not all samples have complete location data

## Contributing

*To be added*

## License

*To be added*

## Contact

*To be added*

---

*This project supports the Missouri Department of Conservation's efforts to monitor and track Chronic Wasting Disease in the state's deer population.*