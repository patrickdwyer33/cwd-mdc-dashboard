import * as d3 from 'd3';
import { loadData, processData } from './data.js';
import { createMap } from './map.js';
import { createTable } from './table.js';
import { updateStats } from './stats.js';
import './style.css';

class CWDDashboard {
    constructor() {
        this.rawData = null;
        this.data = null; // Deduplicated records
        this.filteredData = null;
        this.map = null;
        this.table = null;
        this.filters = {
            year: ''
        };

        this.init();
    }

    async init() {
        try {
            this.showLoading(true);

            // Load and process data (deduplicated only)
            this.rawData = await loadData();
            this.data = processData(this.rawData, true);

            console.log(`Loaded ${this.data.length} CWD samples`);

            // Initialize components
            await this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize metric selection
            this.initializeMetricSelection();

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
        const years = [...new Set(this.data.map(d => d.permitYear))].sort();
        const yearSelect = d3.select('#year-filter');
        yearSelect.selectAll('option:not(:first-child)').remove();
        yearSelect.selectAll('option.year-option')
            .data(years)
            .enter()
            .append('option')
            .classed('year-option', true)
            .attr('value', d => d)
            .text(d => d);
    }

    setupEventListeners() {
        // Year filter change event
        d3.select('#year-filter').on('change', () => {
            this.filters.year = d3.select('#year-filter').node().value;
            this.updateAll();
        });

        // Stat card click events to change map metric
        d3.selectAll('.stat-card').on('click', (event) => {
            const metric = event.currentTarget.getAttribute('data-metric');

            // Update selected state
            d3.selectAll('.stat-card').classed('selected', false);
            d3.select(event.currentTarget).classed('selected', true);

            // Trigger map update with new metric
            if (this.map && this.map.setMetric) {
                this.map.setMetric(metric);
            }
        });
    }

    applyFilters() {
        // Apply year filter
        this.filteredData = this.data.filter(d => {
            if (this.filters.year && d.permitYear !== this.filters.year) {
                return false;
            }
            return true;
        });
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

    initializeMetricSelection() {
        // Set initial selected state for Positive
        d3.select('.stat-card[data-metric="positive"]').classed('selected', true);
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