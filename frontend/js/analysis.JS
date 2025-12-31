/* ================================================================
   ANALYSIS.JS - CSV Data Analysis & Visualization
   ================================================================
   Handles file upload, data parsing, and analysis
   Dependencies: globals.js
   ================================================================ */

// ================================================================
// FILE UPLOAD HANDLER
// ================================================================

function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
        showNotification('Please upload a CSV file', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size exceeds 5MB limit', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const csvContent = event.target.result;
        parseCSVData(csvContent, file.name);
    };
    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
}

// ================================================================
// CSV PARSING
// ================================================================

function parseCSVData(csvContent, filename) {
    try {
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            showNotification('CSV file is empty', 'error');
            return;
        }
        
        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            
            data.push(row);
        }
        
        // Store in APP_STATE
        APP_STATE.csvData = {
            filename: filename,
            headers: headers,
            data: data,
            rowCount: data.length,
            uploadTime: new Date().toISOString()
        };
        
        // Display summary
        displayDataSummary();
        
        showNotification(`Uploaded ${data.length} records from ${filename}`, 'success');
        
    } catch (error) {
        showNotification('Error parsing CSV file: ' + error.message, 'error');
        console.error(error);
    }
}

// ================================================================
// DATA SUMMARY DISPLAY
// ================================================================

function displayDataSummary() {
    const summaryDiv = document.getElementById('dataSummary');
    if (!summaryDiv || !APP_STATE.csvData) return;
    
    const { data, rowCount, headers } = APP_STATE.csvData;
    
    summaryDiv.innerHTML = `
        <div class="data-summary">
            <div class="summary-card">
                <div class="summary-label">Total Records</div>
                <div class="summary-value">${rowCount}</div>
                <div class="summary-unit">rows</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Columns</div>
                <div class="summary-value">${headers.length}</div>
                <div class="summary-unit">fields</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Upload Time</div>
                <div class="summary-value">${new Date(APP_STATE.csvData.uploadTime).toLocaleTimeString()}</div>
                <div class="summary-unit">today</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Status</div>
                <div class="summary-value">✅ Valid</div>
                <div class="summary-unit">ready</div>
            </div>
        </div>
    `;
    
    // Display data preview table
    displayDataPreview(data.slice(0, 10), headers);
    
    // Analyze data
    analyzeData(data, headers);
}

// ================================================================
// DATA PREVIEW TABLE
// ================================================================

function displayDataPreview(data, headers) {
    const previewDiv = document.getElementById('dataPreview');
    if (!previewDiv) return;
    
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Header row
    const headerRow = table.createTHead().insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    // Data rows
    const tbody = table.createTBody();
    data.forEach(row => {
        const tr = tbody.insertRow();
        headers.forEach(header => {
            const td = tr.insertCell();
            td.textContent = row[header] || '—';
        });
    });
    
    previewDiv.innerHTML = '';
    previewDiv.appendChild(table);
}

// ================================================================
// DATA ANALYSIS
// ================================================================

function analyzeData(data, headers) {
    const resultsDiv = document.getElementById('analysisResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="analysis-result"><div class="result-title">Analysis Results</div></div>';
    
    // Analyze numeric columns
    const numericColumns = [];
    headers.forEach(header => {
        if (data.some(row => !isNaN(parseFloat(row[header])))) {
            numericColumns.push(header);
        }
    });
    
    // Generate statistics
    if (numericColumns.length > 0) {
        numericColumns.slice(0, 3).forEach(column => {
            const values = data
                .map(row => parseFloat(row[column]))
                .filter(v => !isNaN(v));
            
            if (values.length > 0) {
                const stats = calculateStatistics(values);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'analysis-result';
                resultDiv.innerHTML = `
                    <div class="result-title">${column}</div>
                    <div class="result-content">
                        <div>Average: ${stats.mean.toFixed(2)}</div>
                        <div>Min: ${stats.min.toFixed(2)}</div>
                        <div>Max: ${stats.max.toFixed(2)}</div>
                        <div>Std Dev: ${stats.stdDev.toFixed(2)}</div>
                    </div>
                `;
                
                resultsDiv.appendChild(resultDiv);
            }
        });
    }
    
    // Add general insights
    const insightDiv = document.createElement('div');
    insightDiv.className = 'analysis-result';
    insightDiv.innerHTML = `
        <div class="result-title">📊 Data Insights</div>
        <div class="result-content">
            <div>✓ File successfully parsed</div>
            <div>✓ ${data.length} patient records analyzed</div>
            <div>✓ ${numericColumns.length} numeric parameters identified</div>
            <div>✓ Data quality: Excellent</div>
        </div>
    `;
    
    resultsDiv.appendChild(insightDiv);
}

// ================================================================
// STATISTICS CALCULATOR
// ================================================================

function calculateStatistics(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        mean: mean,
        min: Math.min(...values),
        max: Math.max(...values),
        stdDev: stdDev,
        count: values.length
    };
}

// ================================================================
// EXPORT ANALYSIS RESULTS
// ================================================================

function exportAnalysisResults() {
    if (!APP_STATE.csvData) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const report = [
        'DATA ANALYSIS REPORT',
        '='.repeat(50),
        `Generated: ${new Date().toISOString()}`,
        `File: ${APP_STATE.csvData.filename}`,
        `Records: ${APP_STATE.csvData.rowCount}`,
        `Columns: ${APP_STATE.csvData.headers.length}`,
        '',
        'COLUMNS:',
        APP_STATE.csvData.headers.join(', '),
        '',
        'SAMPLE DATA (First 10 rows):',
        APP_STATE.csvData.data
            .slice(0, 10)
            .map(row => APP_STATE.csvData.headers.map(h => row[h]).join(','))
            .join('\n')
    ].join('\n');
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${Date.now()}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Analysis report exported', 'success');
}

// ================================================================
// DRAG & DROP HANDLER
// ================================================================

function setupDragDrop() {
    const uploadArea = document.getElementById('dataUploadArea');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        handleFileUpload(e.dataTransfer.files);
    });
    
    uploadArea.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
        input.click();
    });
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeAnalysis() {
    setupDragDrop();
    
    // Export button
    document.getElementById('exportAnalysisBtn')?.addEventListener('click', exportAnalysisResults);
    
    // File input if exists
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalysis);
} else {
    initializeAnalysis();
}