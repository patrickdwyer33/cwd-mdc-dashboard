import * as d3 from 'd3';

export function createTable(selector) {
    const container = d3.select(selector);
    let data = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 20;

    // Create table structure
    const tableContainer = container.append('div')
        .attr('class', 'table-responsive');

    const table = tableContainer.append('table')
        .attr('class', 'data-table');

    const thead = table.append('thead');
    const tbody = table.append('tbody');

    // Create pagination controls
    const paginationContainer = container.append('div')
        .attr('class', 'pagination-container');

    const columns = [
        { key: 'specimenNo', label: 'Specimen #', width: '120px' },
        { key: 'countyName', label: 'County', width: '100px' },
        { key: 'collectionDate', label: 'Collection Date', width: '120px', format: formatDate },
        { key: 'harvestDate', label: 'Harvest Date', width: '120px', format: formatDate },
        { key: 'result', label: 'Result', width: '80px', format: formatResult },
        { key: 'deerSexName', label: 'Sex', width: '60px' },
        { key: 'deerAgeName', label: 'Age', width: '60px' },
        { key: 'sampleType', label: 'Sample Type', width: '100px' },
        { key: 'collectionTypeName', label: 'Collection', width: '120px' },
        { key: 'telecheckId', label: 'Telecheck ID', width: '120px' }
    ];

    // Create table header
    const headerRow = thead.append('tr');
    headerRow.selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .style('width', d => d.width)
        .style('cursor', 'pointer')
        .text(d => d.label)
        .on('click', function(event, d) {
            sortBy(d.key);
        });

    let sortKey = null;
    let sortDirection = 'asc';

    function sortBy(key) {
        if (sortKey === key) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey = key;
            sortDirection = 'asc';
        }

        // Update header styles
        headerRow.selectAll('th')
            .classed('sorted-asc', false)
            .classed('sorted-desc', false);

        headerRow.selectAll('th')
            .filter(d => d.key === key)
            .classed(`sorted-${sortDirection}`, true);

        // Sort data
        filteredData.sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle dates
            if (aVal instanceof Date && bVal instanceof Date) {
                aVal = aVal.getTime();
                bVal = bVal.getTime();
            }

            // Handle nulls
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Convert to strings for comparison if needed
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        currentPage = 1;
        renderTable();
        renderPagination();
    }

    function renderTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        // Clear existing rows
        tbody.selectAll('tr').remove();

        // Add rows
        const rows = tbody.selectAll('tr')
            .data(pageData)
            .enter()
            .append('tr')
            .on('mouseover', function() {
                d3.select(this).classed('highlight', true);
            })
            .on('mouseout', function() {
                d3.select(this).classed('highlight', false);
            });

        // Add cells
        rows.selectAll('td')
            .data(d => columns.map(col => ({
                key: col.key,
                value: d[col.key],
                format: col.format,
                original: d
            })))
            .enter()
            .append('td')
            .html(d => {
                if (d.format) {
                    return d.format(d.value);
                }
                return d.value || '-';
            })
            .attr('data-label', d => d.key);
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);

        paginationContainer.selectAll('*').remove();

        if (totalPages <= 1) return;

        const pagination = paginationContainer.append('div')
            .attr('class', 'pagination');

        // Previous button
        pagination.append('button')
            .attr('class', 'pagination-btn')
            .property('disabled', currentPage === 1)
            .text('Previous')
            .on('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                    renderPagination();
                }
            });

        // Page info
        pagination.append('span')
            .attr('class', 'pagination-info')
            .text(`Page ${currentPage} of ${totalPages}`);

        // Next button
        pagination.append('button')
            .attr('class', 'pagination-btn')
            .property('disabled', currentPage === totalPages)
            .text('Next')
            .on('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                    renderPagination();
                }
            });
    }

    function formatDate(date) {
        if (!date) return '-';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatResult(result) {
        if (!result) return '-';

        const colors = {
            'Pending': '#ffc107',
            'Positive': '#dc3545',
            'Negative': '#28a745'
        };

        const color = colors[result] || '#6c757d';

        return `<span class="result-badge" style="background-color: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${result}</span>`;
    }

    return {
        update(newData) {
            data = newData;
            filteredData = [...data];
            currentPage = 1;

            // Re-apply current sort if any
            if (sortKey) {
                sortBy(sortKey);
            } else {
                renderTable();
                renderPagination();
            }
        },

        search(searchTerm) {
            if (!searchTerm) {
                filteredData = [...data];
            } else {
                const term = searchTerm.toLowerCase();
                filteredData = data.filter(d => {
                    return columns.some(col => {
                        const value = d[col.key];
                        if (value == null) return false;

                        if (value instanceof Date) {
                            return formatDate(value).toLowerCase().includes(term);
                        }

                        return value.toString().toLowerCase().includes(term);
                    });
                });
            }

            currentPage = 1;
            renderTable();
            renderPagination();
        }
    };
}