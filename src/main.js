import * as d3 from 'd3';
import { loadData, processData } from './data.js';
import { createMap } from './map.js';
import { createTable } from './table.js';
import { updateStats } from './stats.js';
import './style.css';

class CWDDashboard {
    constructor() {
        this.rawData = null;
        this.filteredData = null;
        this.map = null;
        this.table = null;
        this.filters = {
            year: '',
            county: '',
            result: ''
        };

        this.init();
    }

    async init() {
        try {
            this.showLoading(true);

            // Load and process data
            this.rawData = await loadData();
            this.filteredData = processData(this.rawData);

            console.log(`Loaded ${this.filteredData.length} CWD samples`);

            // Initialize components
            await this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.updateAll();

            this.showLoading(false);

        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to load CWD data. Please try refreshing the page.');
        }
    }

    async initializeComponents() {
        // Initialize map
        this.map = await createMap('#map');

        // Initialize table
        this.table = createTable('#data-table');

        // Populate filter options
        this.populateFilters();
    }

    populateFilters() {
        // Populate year filter
        const years = [...new Set(this.filteredData.map(d => d.permitYear))].sort();
        const yearSelect = d3.select('#year-filter');
        yearSelect.selectAll('option:not(:first-child)').remove();
        yearSelect.selectAll('option.year-option')
            .data(years)
            .enter()
            .append('option')
            .classed('year-option', true)
            .attr('value', d => d)
            .text(d => d);

        // Populate county filter
        const counties = [...new Set(this.filteredData.map(d => d.countyName))]
            .filter(d => d)
            .sort();
        const countySelect = d3.select('#county-filter');
        countySelect.selectAll('option:not(:first-child)').remove();
        countySelect.selectAll('option.county-option')
            .data(counties)
            .enter()
            .append('option')
            .classed('county-option', true)
            .attr('value', d => d)
            .text(d => d);
    }

    setupEventListeners() {
        // Filter change events
        d3.select('#year-filter').on('change', () => {
            this.filters.year = d3.select('#year-filter').node().value;
            this.updateAll();
        });

        d3.select('#county-filter').on('change', () => {
            this.filters.county = d3.select('#county-filter').node().value;
            this.updateAll();
        });

        d3.select('#result-filter').on('change', () => {
            this.filters.result = d3.select('#result-filter').node().value;
            this.updateAll();
        });

        // Table search
        d3.select('#table-search').on('input', () => {
            const searchTerm = d3.select('#table-search').node().value;
            this.table.search(searchTerm);
        });
    }

    applyFilters() {
        this.filteredData = this.rawData.filter(d => {
            const processedData = processData([d])[0];
            if (!processedData) return false;

            if (this.filters.year && processedData.permitYear !== this.filters.year) {
                return false;
            }
            if (this.filters.county && processedData.countyName !== this.filters.county) {
                return false;
            }
            if (this.filters.result && processedData.result !== this.filters.result) {
                return false;
            }
            return true;
        });

        this.filteredData = processData(this.filteredData);
    }

    updateAll() {
        this.applyFilters();

        // Update components
        this.map.update(this.filteredData);
        this.table.update(this.filteredData);
        updateStats(this.filteredData);

        // Update table count
        d3.select('#table-count').text(`${this.filteredData.length} samples`);
    }

    showLoading(show) {
        d3.select('#loading').style('display', show ? 'flex' : 'none');
    }

    showError(message) {
        this.showLoading(false);
        // You could implement a proper error modal here
        alert(message);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new CWDDashboard();
});