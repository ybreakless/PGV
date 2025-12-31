/* ================================================================
   SIMULATION.JS - Vital Signs Simulation Engine
   ================================================================
   Manages real-time vital sign calculations and updates
   Dependencies: globals.js
   ================================================================ */

// ================================================================
// VITAL SIGN SIMULATION ALGORITHM
// ================================================================

function simulateVitalSigns() {
    if (!APP_STATE.simulationRunning) return;
    
    const activityLevel = parseFloat(document.getElementById('activitySlider')?.value || 0);
    const stressLevel = parseFloat(document.getElementById('stressSlider')?.value || 0);
    
    // Base vital values
    let heartRate = 72;
    let bloodPressure = { systolic: 120, diastolic: 80 };
    let temperature = 37.0;
    let oxygenSaturation = 98;
    
    // Apply activity level effects (0-100)
    heartRate += (activityLevel * 1.5);
    oxygenSaturation -= (activityLevel * 0.15);
    temperature += (activityLevel * 0.05);
    
    // Apply stress level effects (0-100)
    heartRate += (stressLevel * 1.2);
    bloodPressure.systolic += (stressLevel * 0.8);
    bloodPressure.diastolic += (stressLevel * 0.5);
    temperature += (stressLevel * 0.03);
    
    // Apply illness effects if active
    if (APP_STATE.currentIllness) {
        const illness = APP_STATE.illnessDatabase[APP_STATE.currentIllness];
        if (illness) {
            heartRate += illness.vitalChanges.heartRate;
            bloodPressure.systolic += illness.vitalChanges.bloodPressureSystolic;
            bloodPressure.diastolic += illness.vitalChanges.bloodPressureDiastolic;
            temperature += illness.vitalChanges.temperature;
            oxygenSaturation += illness.vitalChanges.oxygenSaturation;
        }
    }
    
    // Add random fluctuations for realism
    heartRate += (Math.random() - 0.5) * 5;
    temperature += (Math.random() - 0.5) * 0.1;
    oxygenSaturation += (Math.random() - 0.5) * 0.3;
    
    // Clamp values to realistic ranges
    heartRate = Math.max(40, Math.min(180, Math.round(heartRate)));
    temperature = Math.max(35.0, Math.min(42.0, parseFloat(temperature.toFixed(1))));
    oxygenSaturation = Math.max(75, Math.min(100, Math.round(oxygenSaturation)));
    bloodPressure.systolic = Math.max(80, Math.min(200, Math.round(bloodPressure.systolic)));
    bloodPressure.diastolic = Math.max(50, Math.min(130, Math.round(bloodPressure.diastolic)));
    
    // Update APP_STATE
    APP_STATE.vitals = {
        heartRate: heartRate,
        bloodPressure: `${bloodPressure.systolic}/${bloodPressure.diastolic}`,
        temperature: temperature,
        oxygenSaturation: oxygenSaturation,
        timestamp: new Date().toISOString()
    };
    
    // Save to history
    if (!APP_STATE.vitalHistory) {
        APP_STATE.vitalHistory = [];
    }
    APP_STATE.vitalHistory.push(APP_STATE.vitals);
    
    // Keep history size manageable
    if (APP_STATE.vitalHistory.length > 1000) {
        APP_STATE.vitalHistory.shift();
    }
    
    // Update UI
    updateVitalDisplay();
    
    // Check for anomalies
    detectAnomalies(heartRate, temperature, oxygenSaturation);
}

// ================================================================
// UPDATE VITAL DISPLAY
// ================================================================

function updateVitalDisplay() {
    if (!APP_STATE.vitals) return;
    
    // Heart Rate
    const hrElement = document.querySelector('[data-vital="heartRate"] .vital-value');
    if (hrElement) {
        hrElement.textContent = APP_STATE.vitals.heartRate;
        updateVitalTrend('heartRate', APP_STATE.vitals.heartRate / 180 * 100);
    }
    
    // Blood Pressure
    const bpElement = document.querySelector('[data-vital="bloodPressure"] .vital-value');
    if (bpElement) {
        bpElement.textContent = APP_STATE.vitals.bloodPressure;
        const systolic = parseInt(APP_STATE.vitals.bloodPressure.split('/')[0]);
        updateVitalTrend('bloodPressure', systolic / 200 * 100);
    }
    
    // Temperature
    const tempElement = document.querySelector('[data-vital="temperature"] .vital-value');
    if (tempElement) {
        tempElement.textContent = APP_STATE.vitals.temperature.toFixed(1) + '°C';
        updateVitalTrend('temperature', (APP_STATE.vitals.temperature - 35) / 7 * 100);
    }
    
    // Oxygen Saturation
    const o2Element = document.querySelector('[data-vital="oxygenSaturation"] .vital-value');
    if (o2Element) {
        o2Element.textContent = APP_STATE.vitals.oxygenSaturation + '%';
        updateVitalTrend('oxygenSaturation', APP_STATE.vitals.oxygenSaturation / 100 * 100);
    }
}

// ================================================================
// UPDATE VITAL TREND BAR
// ================================================================

function updateVitalTrend(vitalKey, percentage) {
    const trendFill = document.querySelector(`[data-vital="${vitalKey}"] .vital-trend-fill`);
    if (trendFill) {
        percentage = Math.max(0, Math.min(100, percentage));
        trendFill.style.width = percentage + '%';
    }
}

// ================================================================
// ANOMALY DETECTION
// ================================================================

function detectAnomalies(heartRate, temperature, o2Sat) {
    const anomalies = [];
    
    if (heartRate < 50 || heartRate > 120) {
        anomalies.push(`⚠️ Abnormal Heart Rate: ${heartRate} BPM`);
    }
    
    if (temperature < 36.1 || temperature > 38.5) {
        anomalies.push(`⚠️ Abnormal Temperature: ${temperature.toFixed(1)}°C`);
    }
    
    if (o2Sat < 90) {
        anomalies.push(`⚠️ Low Oxygen: ${o2Sat}%`);
    }
    
    // Display anomalies in chatbox
    if (anomalies.length > 0 && !APP_STATE.lastAnomalyTime) {
        anomalies.forEach(anomaly => {
            addChatMessage('System', anomaly, 'warning');
        });
        APP_STATE.lastAnomalyTime = Date.now();
    } else if (anomalies.length === 0) {
        APP_STATE.lastAnomalyTime = null;
    }
}

// ================================================================
// START SIMULATION
// ================================================================

function startSimulation() {
    if (APP_STATE.simulationRunning) return;
    
    APP_STATE.simulationRunning = true;
    
    // Update button state
    const startBtn = document.getElementById('startSimBtn');
    const stopBtn = document.getElementById('stopSimBtn');
    if (startBtn) startBtn.classList.add('active');
    if (stopBtn) stopBtn.classList.remove('active');
    
    // Clear previous interval if exists
    if (APP_STATE.simulationInterval) {
        clearInterval(APP_STATE.simulationInterval);
    }
    
    // Start simulation loop (update every 1 second)
    APP_STATE.simulationInterval = setInterval(simulateVitalSigns, 1000);
    
    // Initial update
    simulateVitalSigns();
    
    showNotification('Simulation started', 'success');
}

// ================================================================
// STOP SIMULATION
// ================================================================

function stopSimulation() {
    APP_STATE.simulationRunning = false;
    
    if (APP_STATE.simulationInterval) {
        clearInterval(APP_STATE.simulationInterval);
        APP_STATE.simulationInterval = null;
    }
    
    // Update button state
    const startBtn = document.getElementById('startSimBtn');
    const stopBtn = document.getElementById('stopSimBtn');
    if (startBtn) startBtn.classList.remove('active');
    if (stopBtn) stopBtn.classList.add('active');
    
    showNotification('Simulation stopped', 'info');
}

// ================================================================
// RESET VITALS
// ================================================================

function resetVitals() {
    APP_STATE.vitals = {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 37.0,
        oxygenSaturation: 98,
        timestamp: new Date().toISOString()
    };
    
    // Reset sliders
    document.getElementById('activitySlider').value = 0;
    document.getElementById('stressSlider').value = 0;
    
    updateVitalDisplay();
    showNotification('Vitals reset to normal', 'success');
}

// ================================================================
// EXPORT VITALS DATA
// ================================================================

function exportVitalsData() {
    if (!APP_STATE.vitalHistory || APP_STATE.vitalHistory.length === 0) {
        showNotification('No vital history to export', 'warning');
        return;
    }
    
    const csvContent = [
        ['Timestamp', 'Heart Rate (BPM)', 'Blood Pressure', 'Temperature (°C)', 'Oxygen Saturation (%)'].join(','),
        ...APP_STATE.vitalHistory.map(vital => [
            vital.timestamp,
            vital.heartRate,
            vital.bloodPressure,
            vital.temperature,
            vital.oxygenSaturation
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vital_signs_${Date.now()}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Vitals exported as CSV', 'success');
}

// ================================================================
// SLIDER EVENT HANDLERS
// ================================================================

function onActivitySliderChange() {
    const value = document.getElementById('activitySlider').value;
    const display = document.getElementById('activityValue');
    if (display) display.textContent = value;
    
    if (APP_STATE.simulationRunning) {
        simulateVitalSigns();
    }
}

function onStressSliderChange() {
    const value = document.getElementById('stressSlider').value;
    const display = document.getElementById('stressValue');
    if (display) display.textContent = value;
    
    if (APP_STATE.simulationRunning) {
        simulateVitalSigns();
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeSimulation() {
    // Initialize vital display
    APP_STATE.vitals = {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 37.0,
        oxygenSaturation: 98
    };
    updateVitalDisplay();
    
    // Button event listeners
    document.getElementById('startSimBtn')?.addEventListener('click', startSimulation);
    document.getElementById('stopSimBtn')?.addEventListener('click', stopSimulation);
    document.getElementById('resetVitalsBtn')?.addEventListener('click', resetVitals);
    document.getElementById('exportVitalsBtn')?.addEventListener('click', exportVitalsData);
    
    // Slider event listeners
    document.getElementById('activitySlider')?.addEventListener('input', onActivitySliderChange);
    document.getElementById('stressSlider')?.addEventListener('input', onStressSliderChange);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSimulation);
} else {
    initializeSimulation();
}