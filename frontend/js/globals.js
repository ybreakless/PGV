// ============================================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================================

// App State
const APP_STATE = {
    isLoggedIn: false,
    currentUser: null,
    currentSection: 'models',
    selectedCategory: null,
    selectedSubcategory: null,
    simulationRunning: false,
    selectedIllness: null
};

// User Database (localStorage)
const USER_DB_KEY = 'Y314_USERS';
const SESSION_KEY = 'Y314_SESSION';

// Anatomical Models Database
const ANATOMICAL_MODELS = {
    'nervous': {
        name: '🧠 NERVOUS SYSTEM',
        icon: '🧠',
        description: 'Brain, Spinal Cord, Neurons',
        subcategories: {
            'brain': { name: 'Brain', description: 'Central processing unit' },
            'spinal': { name: 'Spinal Cord', description: 'Neural highway' },
            'neurons': { name: 'Neurons', description: 'Signal transmitters' }
        }
    },
    'respiratory': {
        name: '💨 RESPIRATORY SYSTEM',
        icon: '💨',
        description: 'Lungs, Airways, Diaphragm',
        subcategories: {
            'lungs': { name: 'Lungs', description: 'Gas exchange organs' },
            'airways': { name: 'Airways', description: 'Breathing tubes' },
            'diaphragm': { name: 'Diaphragm', description: 'Breathing muscle' }
        }
    },
    'cardiovascular': {
        name: '❤️ CARDIOVASCULAR SYSTEM',
        icon: '❤️',
        description: 'Heart, Veins, Arteries',
        subcategories: {
            'heart': { name: 'Heart', description: 'Pumping organ' },
            'veins': { name: 'Veins', description: 'Return vessels' },
            'arteries': { name: 'Arteries', description: 'Delivery vessels' }
        }
    },
    'digestive': {
        name: '🍽️ DIGESTIVE SYSTEM',
        icon: '🍽️',
        description: 'Stomach, Intestines, Organs',
        subcategories: {
            'stomach': { name: 'Stomach', description: 'Digestion chamber' },
            'intestines': { name: 'Intestines', description: 'Nutrient absorption' },
            'liver': { name: 'Liver', description: 'Processing plant' }
        }
    },
    'immune': {
        name: '🛡️ IMMUNE SYSTEM',
        icon: '🛡️',
        description: 'Lymphocytes, Antibodies, Defense',
        subcategories: {
            'lymphocytes': { name: 'Lymphocytes', description: 'Immune cells' },
            'antibodies': { name: 'Antibodies', description: 'Defense proteins' },
            'organs': { name: 'Immune Organs', description: 'Spleen, thymus' }
        }
    },
    'skeletal': {
        name: '🦴 SKELETAL SYSTEM',
        icon: '🦴',
        description: 'Bones, Joints, Cartilage',
        subcategories: {
            'bones': { name: 'Bones', description: 'Structural framework' },
            'joints': { name: 'Joints', description: 'Movement points' },
            'cartilage': { name: 'Cartilage', description: 'Flexible connective' }
        }
    }
};

// Illness Database
const ILLNESS_DATABASE = {
    'flu': {
        name: 'Common Flu',
        icon: '🤒',
        description: 'Viral respiratory infection',
        vitalChanges: {
            'heart_rate': { increase: 15, max: 110 },
            'temperature': { increase: 2, max: 39 },
            'o2_sat': { decrease: 5, min: 93 },
            'blood_pressure': { increase: 10, max: 140, diastolic_increase: 8 }
        }
    },
    'diabetes': {
        name: 'Diabetes',
        icon: '🩺',
        description: 'Blood sugar regulation disorder',
        vitalChanges: {
            'heart_rate': { increase: 8, max: 90 },
            'temperature': { no_change: true },
            'o2_sat': { no_change: true },
            'blood_pressure': { increase: 15, max: 150, diastolic_increase: 10 }
        }
    },
    'hypertension': {
        name: 'Hypertension',
        icon: '💔',
        description: 'High blood pressure condition',
        vitalChanges: {
            'heart_rate': { increase: 12, max: 100 },
            'temperature': { no_change: true },
            'o2_sat': { no_change: true },
            'blood_pressure': { increase: 30, max: 180, diastolic_increase: 15 }
        }
    },
    'anemia': {
        name: 'Anemia',
        icon: '🩸',
        description: 'Low red blood cell count',
        vitalChanges: {
            'heart_rate': { increase: 20, max: 120 },
            'temperature': { no_change: true },
            'o2_sat': { decrease: 10, min: 88 },
            'blood_pressure': { decrease: 10, min: 100, diastolic_decrease: 5 }
        }
    },
    'asthma': {
        name: 'Asthma',
        icon: '💨',
        description: 'Respiratory condition',
        vitalChanges: {
            'heart_rate': { increase: 18, max: 115 },
            'temperature': { increase: 0.5, max: 37.5 },
            'o2_sat': { decrease: 8, min: 90 },
            'blood_pressure': { increase: 5, max: 130, diastolic_increase: 3 }
        }
    },
    'covid': {
        name: 'COVID-19',
        icon: '🦠',
        description: 'Viral infection',
        vitalChanges: {
            'heart_rate': { increase: 25, max: 125 },
            'temperature': { increase: 2.5, max: 39.5 },
            'o2_sat': { decrease: 15, min: 83 },
            'blood_pressure': { increase: 12, max: 145, diastolic_increase: 8 }
        }
    }
};

// Vital Signs Data
const VITAL_SIGNS = {
    heart_rate: { current: 72, baseline: 72, unit: 'BPM', min: 40, max: 180 },
    temperature: { current: 37.0, baseline: 37.0, unit: '°C', min: 35, max: 42 },
    o2_saturation: { current: 98, baseline: 98, unit: '%', min: 75, max: 100 },
    blood_pressure: { current: { sys: 120, dia: 80 }, baseline: { sys: 120, dia: 80 }, unit: 'mmHg', min: 60, max: 200 }
};

// Utility Functions
function getUsers() {
    const users = localStorage.getItem(USER_DB_KEY);
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    APP_STATE.currentUser = user;
    APP_STATE.isLoggedIn = true;
}

function getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    APP_STATE.currentUser = null;
    APP_STATE.isLoggedIn = false;
}

function showError(elementId, message) {
    const elem = document.getElementById(elementId);
    if (elem) {
        elem.textContent = message;
        elem.classList.add('show');
        setTimeout(() => {
            elem.classList.remove('show');
            elem.textContent = '';
        }, 5000);
    }
}

function formatTime(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateTimeClock() {
    const timeElement = document.getElementById('login-time-dash');
    if (timeElement) {
        timeElement.textContent = formatTime();
    }
}

// Start time clock
setInterval(updateTimeClock, 1000);

console.log('✓ Global variables initialized');
console.log('✓ User database ready');
console.log('✓ Models database loaded');