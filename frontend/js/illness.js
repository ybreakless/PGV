/* ================================================================
   ILLNESS.JS - Disease & Condition Simulation Lab
   ================================================================
   Handles illness selection and vital sign modifications
   Dependencies: globals.js, simulation.js
   ================================================================ */

// ================================================================
// LOAD ILLNESS CARDS
// ================================================================

function loadIllnessCards() {
    const container = document.getElementById('illnessContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(APP_STATE.illnessDatabase).forEach(illnessKey => {
        const illness = APP_STATE.illnessDatabase[illnessKey];
        
        const card = document.createElement('div');
        card.className = 'illness-card';
        card.innerHTML = `
            <div class="illness-header">
                <div class="illness-icon">${illness.icon}</div>
                <div class="illness-title">${illness.name}</div>
            </div>
            
            <div class="illness-description">
                ${illness.description}
            </div>
            
            <div class="illness-vital-changes">
                <div class="change-item">
                    ❤️ Heart Rate: ${illness.vitalChanges.heartRate > 0 ? '+' : ''}${illness.vitalChanges.heartRate} BPM
                </div>
                <div class="change-item">
                    🌡️ Temperature: ${illness.vitalChanges.temperature > 0 ? '+' : ''}${illness.vitalChanges.temperature.toFixed(1)}°C
                </div>
                <div class="change-item">
                    💨 O₂ Saturation: ${illness.vitalChanges.oxygenSaturation > 0 ? '+' : ''}${illness.vitalChanges.oxygenSaturation}%
                </div>
                <div class="change-item">
                    🩸 BP Systolic: ${illness.vitalChanges.bloodPressureSystolic > 0 ? '+' : ''}${illness.vitalChanges.bloodPressureSystolic} mmHg
                </div>
            </div>
            
            <div class="illness-buttons">
                <button class="control-button" data-illness="${illnessKey}" onclick="applyIllness('${illnessKey}')">
                    Apply Condition
                </button>
                <button class="control-button danger" onclick="clearIllness()">
                    Clear
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ================================================================
// APPLY ILLNESS
// ================================================================

function applyIllness(illnessKey) {
    if (!APP_STATE.illnessDatabase[illnessKey]) return;
    
    const illness = APP_STATE.illnessDatabase[illnessKey];
    
    APP_STATE.currentIllness = illnessKey;
    
    // Update visual indicator
    document.querySelectorAll('.illness-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-illness="${illnessKey}"]`)
        ?.closest('.illness-card')
        .classList.add('active');
    
    // Update comparison view
    showIllnessComparison(illness);
    
    // Trigger vital update if simulation is running
    if (APP_STATE.simulationRunning) {
        simulateVitalSigns();
    }
    
    // Add chat notification
    addChatMessage('System', `⚠️ Applied condition: ${illness.name}. Vital signs are now affected by this condition.`, 'warning');
    
    showNotification(`${illness.name} applied`, 'warning');
}

// ================================================================
// CLEAR ILLNESS
// ================================================================

function clearIllness() {
    if (!APP_STATE.currentIllness) {
        showNotification('No illness is currently active', 'info');
        return;
    }
    
    const illnessName = APP_STATE.illnessDatabase[APP_STATE.currentIllness].name;
    
    APP_STATE.currentIllness = null;
    
    // Reset visual indicator
    document.querySelectorAll('.illness-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Clear comparison view
    const comparisonDiv = document.getElementById('illnessComparison');
    if (comparisonDiv) {
        comparisonDiv.innerHTML = '<p style="color: var(--color-text-secondary);">No condition active</p>';
    }
    
    // Trigger vital update
    if (APP_STATE.simulationRunning) {
        simulateVitalSigns();
    }
    
    addChatMessage('System', `Condition cleared. Vital signs returning to baseline.`, 'info');
    
    showNotification(`${illnessName} cleared`, 'success');
}

// ================================================================
// SHOW ILLNESS COMPARISON
// ================================================================

function showIllnessComparison(illness) {
    const comparisonDiv = document.getElementById('illnessComparison');
    if (!comparisonDiv) return;
    
    // Get normal vitals for comparison
    const normalVitals = {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 37.0,
        oxygenSaturation: 98
    };
    
    const affectedVitals = {
        heartRate: normalVitals.heartRate + illness.vitalChanges.heartRate,
        bloodPressure: `${120 + illness.vitalChanges.bloodPressureSystolic}/${80 + illness.vitalChanges.bloodPressureDiastolic}`,
        temperature: (normalVitals.temperature + illness.vitalChanges.temperature).toFixed(1),
        oxygenSaturation: normalVitals.oxygenSaturation + illness.vitalChanges.oxygenSaturation
    };
    
    comparisonDiv.innerHTML = `
        <div class="comparison-box">
            <div class="comparison-title">Normal Vitals</div>
            <div class="comparison-item">
                <div class="comparison-label">Heart Rate</div>
                <div class="comparison-value comparison-normal">${normalVitals.heartRate} BPM</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Blood Pressure</div>
                <div class="comparison-value comparison-normal">${normalVitals.bloodPressure}</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Temperature</div>
                <div class="comparison-value comparison-normal">${normalVitals.temperature}°C</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">O₂ Saturation</div>
                <div class="comparison-value comparison-normal">${normalVitals.oxygenSaturation}%</div>
            </div>
        </div>
        
        <div class="comparison-box">
            <div class="comparison-title">${illness.name} Vitals</div>
            <div class="comparison-item">
                <div class="comparison-label">Heart Rate</div>
                <div class="comparison-value comparison-affected">${affectedVitals.heartRate} BPM</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Blood Pressure</div>
                <div class="comparison-value comparison-affected">${affectedVitals.bloodPressure}</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Temperature</div>
                <div class="comparison-value comparison-affected">${affectedVitals.temperature}°C</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">O₂ Saturation</div>
                <div class="comparison-value comparison-affected">${affectedVitals.oxygenSaturation}%</div>
            </div>
        </div>
    `;
}

// ================================================================
// ILLNESS EDUCATION SECTION
// ================================================================

function getIllnessEducation(illnessKey) {
    const illness = APP_STATE.illnessDatabase[illnessKey];
    if (!illness) return '';
    
    const education = {
        'diabetes': 'Diabetes is a chronic condition affecting blood glucose regulation. Type 1 involves insulin deficiency; Type 2 involves insulin resistance. Management includes diet, exercise, and medication.',
        'hypertension': 'High blood pressure damages blood vessels and increases heart disease risk. Lifestyle changes and medications help control it. Normal is <120/80 mmHg.',
        'hypothermia': 'Dangerous condition with body temperature dropping below 35°C. Symptoms include shivering, confusion, and slowed heartbeat. Requires immediate warming.',
        'pneumonia': 'Infection causing lung inflammation and fluid accumulation. Symptoms include cough, fever, and difficulty breathing. Antibiotics and rest are typical treatments.',
        'tachycardia': 'Abnormally fast heart rate (>100 BPM at rest). Causes include stress, caffeine, fever, or cardiac issues. May require medication or treatment.'
    };
    
    return education[illnessKey] || illness.description;
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeIllness() {
    loadIllnessCards();
    
    // Initialize empty comparison box
    const comparisonDiv = document.getElementById('illnessComparison');
    if (comparisonDiv) {
        comparisonDiv.innerHTML = '<p style="color: var(--color-text-secondary);">Select a condition to see the effects on vital signs</p>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIllness);
} else {
    initializeIllness();
}