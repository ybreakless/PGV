/* ================================================================
   MODELS.JS - 3D Model Viewer & Anatomical System Manager
   ================================================================
   Handles model selection, 3D canvas, category loading
   Dependencies: globals.js
   ================================================================ */

// ================================================================
// CATEGORY BUTTON CREATION & LOADING
// ================================================================

function loadCategories() {
    const sidebar = document.getElementById('categoriesList');
    if (!sidebar) return;
    
    sidebar.innerHTML = '';
    
    // Create buttons for each anatomical system
    Object.keys(APP_STATE.anatomicalSystems).forEach(systemKey => {
        const system = APP_STATE.anatomicalSystems[systemKey];
        const btn = document.createElement('button');
        btn.className = 'category-button';
        btn.innerHTML = `<span class="icon">${system.icon}</span><span class="label">${system.name}</span>`;
        btn.dataset.system = systemKey;
        
        btn.addEventListener('click', () => {
            selectCategory(systemKey);
        });
        
        sidebar.appendChild(btn);
    });
}

// ================================================================
// CATEGORY SELECTION & SUBCATEGORY DISPLAY
// ================================================================

function selectCategory(systemKey) {
    const system = APP_STATE.anatomicalSystems[systemKey];
    if (!system) return;
    
    // Update active state
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.category-button').classList.add('active');
    
    // Update current state
    APP_STATE.currentSystem = systemKey;
    
    // Display subcategories
    const subcategoryPanel = document.getElementById('subcategoriesList');
    if (subcategoryPanel) {
        subcategoryPanel.innerHTML = '';
        
        system.subcategories.forEach((subcategory, index) => {
            const div = document.createElement('div');
            div.className = 'subcategory-item';
            div.innerHTML = `
                <div class="subcategory-icon">${system.icon}</div>
                <div class="subcategory-info">
                    <div class="subcategory-name">${subcategory}</div>
                    <div class="subcategory-desc">Click to view details</div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                selectSubcategory(systemKey, index, subcategory);
            });
            
            subcategoryPanel.appendChild(div);
        });
    }
    
    showNotification(`Loaded ${system.name}`, 'info');
}

// ================================================================
// SUBCATEGORY SELECTION & MODEL DISPLAY
// ================================================================

function selectSubcategory(systemKey, index, subcategoryName) {
    const system = APP_STATE.anatomicalSystems[systemKey];
    
    APP_STATE.currentSubcategory = index;
    APP_STATE.currentModel = `${systemKey}_${index}`;
    
    // Update model info panel
    updateModelInfoPanel(system, subcategoryName, index);
    
    // Initialize 3D canvas placeholder
    initializeModelCanvas(systemKey, index);
    
    showNotification(`Loaded: ${subcategoryName}`, 'success');
}

// ================================================================
// MODEL INFO PANEL UPDATE
// ================================================================

function updateModelInfoPanel(system, subcategoryName, index) {
    const infoPanel = document.getElementById('modelInfoPanel');
    if (!infoPanel) return;
    
    const descriptions = {
        'cardiovascular': [
            'Heart - Main pumping organ, size of a fist',
            'Arteries - Vessels carrying oxygenated blood',
            'Veins - Vessels returning deoxygenated blood',
            'Capillaries - Smallest blood vessels for nutrient exchange'
        ],
        'respiratory': [
            'Lungs - Gas exchange organs',
            'Trachea - Windpipe bringing air to lungs',
            'Bronchi - Airways within the lungs',
            'Diaphragm - Muscle controlling breathing'
        ],
        'nervous': [
            'Brain - Central command center',
            'Spinal Cord - Main neural pathway',
            'Nerves - Communication network',
            'Synapses - Neural connections'
        ],
        'muscular': [
            'Skeletal Muscles - Voluntary movement muscles',
            'Cardiac Muscle - Heart muscle tissue',
            'Smooth Muscle - Involuntary muscles',
            'Tendons - Connect muscles to bones'
        ],
        'digestive': [
            'Stomach - Food processing organ',
            'Small Intestine - Nutrient absorption site',
            'Large Intestine - Water absorption organ',
            'Liver - Metabolic processing organ'
        ],
        'endocrine': [
            'Pancreas - Hormone and enzyme production',
            'Thyroid - Metabolism regulator',
            'Adrenal - Stress hormone producer',
            'Pituitary - Master hormone gland'
        ]
    };
    
    const systemKey = Object.keys(APP_STATE.anatomicalSystems).find(
        key => APP_STATE.anatomicalSystems[key].name === system.name
    );
    
    const desc = descriptions[systemKey]?.[index] || 'Anatomical structure';
    
    infoPanel.innerHTML = `
        <div class="model-info-title">${subcategoryName}</div>
        <div class="model-info-content">
            <div class="model-info-item">
                <strong>System:</strong> ${system.name}
            </div>
            <div class="model-info-item">
                <strong>Description:</strong> ${desc}
            </div>
            <div class="model-stats">
                <div class="stat-box">
                    <div class="stat-label">Complexity</div>
                    <div class="stat-value">High</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Details</div>
                    <div class="stat-value">${Math.floor(Math.random() * 500) + 100}</div>
                </div>
            </div>
        </div>
    `;
}

// ================================================================
// 3D CANVAS INITIALIZATION (Placeholder)
// ================================================================

function initializeModelCanvas(systemKey, index) {
    const canvas = document.getElementById('modelCanvas');
    if (!canvas) return;
    
    // Clear previous content
    canvas.innerHTML = '';
    
    // Create placeholder 3D view
    const placeholder = document.createElement('div');
    placeholder.className = 'canvas-placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-content">
            <div class="placeholder-icon">🎨</div>
            <div class="placeholder-text">3D Model Viewer</div>
            <div class="placeholder-desc">WebGL Model Ready</div>
            <div class="placeholder-info">
                Ready for Three.js / Babylon.js integration
            </div>
        </div>
    `;
    
    canvas.appendChild(placeholder);
    
    // Create control panel
    createCanvasControls(canvas);
}

// ================================================================
// CANVAS CONTROL PANEL
// ================================================================

function createCanvasControls(canvas) {
    const controlPanel = document.getElementById('canvasControls');
    if (!controlPanel) return;
    
    controlPanel.innerHTML = `
        <div class="control-group">
            <label>Rotation X:</label>
            <input type="range" id="rotationX" min="-180" max="180" value="0" class="slider-input">
            <span id="rotationXValue">0°</span>
        </div>
        
        <div class="control-group">
            <label>Rotation Y:</label>
            <input type="range" id="rotationY" min="-180" max="180" value="0" class="slider-input">
            <span id="rotationYValue">0°</span>
        </div>
        
        <div class="control-group">
            <label>Zoom:</label>
            <input type="range" id="zoom" min="0.1" max="2" value="1" step="0.1" class="slider-input">
            <span id="zoomValue">100%</span>
        </div>
        
        <div class="control-buttons">
            <button class="control-button" id="wireframeToggle">Wireframe</button>
            <button class="control-button" id="resetModelBtn">Reset</button>
            <button class="control-button" id="exportModelBtn">Export</button>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('rotationX')?.addEventListener('input', (e) => {
        document.getElementById('rotationXValue').textContent = e.target.value + '°';
    });
    
    document.getElementById('rotationY')?.addEventListener('input', (e) => {
        document.getElementById('rotationYValue').textContent = e.target.value + '°';
    });
    
    document.getElementById('zoom')?.addEventListener('input', (e) => {
        document.getElementById('zoomValue').textContent = Math.round(e.target.value * 100) + '%';
    });
    
    document.getElementById('resetModelBtn')?.addEventListener('click', resetModel);
    document.getElementById('wireframeToggle')?.addEventListener('click', toggleWireframe);
    document.getElementById('exportModelBtn')?.addEventListener('click', exportModel);
}

// ================================================================
// MODEL CONTROLS
// ================================================================

function resetModel() {
    document.getElementById('rotationX').value = 0;
    document.getElementById('rotationY').value = 0;
    document.getElementById('zoom').value = 1;
    
    document.getElementById('rotationXValue').textContent = '0°';
    document.getElementById('rotationYValue').textContent = '0°';
    document.getElementById('zoomValue').textContent = '100%';
    
    showNotification('Model reset to default', 'info');
}

function toggleWireframe() {
    const btn = document.getElementById('wireframeToggle');
    btn.classList.toggle('active');
    
    const status = btn.classList.contains('active') ? 'enabled' : 'disabled';
    showNotification(`Wireframe mode ${status}`, 'info');
}

function exportModel() {
    const modelData = {
        system: APP_STATE.currentSystem,
        model: APP_STATE.currentModel,
        timestamp: new Date().toISOString(),
        rotation: {
            x: document.getElementById('rotationX').value,
            y: document.getElementById('rotationY').value
        },
        zoom: document.getElementById('zoom').value
    };
    
    const json = JSON.stringify(modelData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `model_${APP_STATE.currentModel}_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Model exported as JSON', 'success');
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeModels() {
    loadCategories();
    
    // Select first category by default
    const firstSystem = Object.keys(APP_STATE.anatomicalSystems)[0];
    if (firstSystem) {
        setTimeout(() => {
            const firstBtn = document.querySelector('[data-system="' + firstSystem + '"]');
            if (firstBtn) firstBtn.click();
        }, 100);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModels);
} else {
    initializeModels();
}