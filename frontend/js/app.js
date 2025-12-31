/* ================================================================
   APP.JS - Main Application Initializer & Event Manager
   ================================================================
   Orchestrates all modules and manages UI state
   Dependencies: All other JS files (auth, models, simulation, etc.)
   ================================================================ */

// ================================================================
// PAGE VISIBILITY & MANAGEMENT
// ================================================================

function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    
    if (loginPage) loginPage.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
}

function hideLoginPage() {
    const loginPage = document.getElementById('loginPage');
    if (loginPage) loginPage.style.display = 'none';
}

function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'grid';
    
    // Focus on Models section by default
    switchSection('models');
}

function hideDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'none';
}

// ================================================================
// SECTION SWITCHING
// ================================================================

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.section-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}Section`);
    if (section) {
        section.style.display = 'block';
        
        // Add active class to button
        const btn = document.querySelector(`[data-section="${sectionName}"]`);
        if (btn) btn.classList.add('active');
        
        // Run initialization for specific sections
        if (sectionName === 'models' && !APP_STATE.modelsInitialized) {
            initializeModels();
            APP_STATE.modelsInitialized = true;
        }
        
        if (sectionName === 'illness' && !APP_STATE.illnessInitialized) {
            initializeIllness();
            APP_STATE.illnessInitialized = true;
        }
        
        if (sectionName === 'analysis' && !APP_STATE.analysisInitialized) {
            initializeAnalysis();
            APP_STATE.analysisInitialized = true;
        }
    }
}

// ================================================================
// NOTIFICATION SYSTEM
// ================================================================

function showNotification(message, type = 'info') {
    const container = document.body;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    notification.innerHTML = `
        <span class="notification-close" onclick="this.parentElement.remove()">×</span>
        <span style="margin-right: 10px;">${iconMap[type] || iconMap['info']}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// ================================================================
// FULLSCREEN TOGGLE
// ================================================================

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// ================================================================
// THEME TOGGLE
// ================================================================

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-color-scheme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('Y314_THEME', newTheme);
    
    showNotification(`Switched to ${newTheme} mode`, 'info');
}

// ================================================================
// LOAD SAVED THEME
// ================================================================

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('Y314_THEME') || 'dark';
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
}

// ================================================================
// CLOCK UPDATE
// ================================================================

function updateClock() {
    const clockElement = document.getElementById('systemClock');
    if (!clockElement) return;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// ================================================================
// USER PROFILE DISPLAY
// ================================================================

function updateUserProfile() {
    const user = APP_STATE.currentUser;
    if (!user) return;
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
}

// ================================================================
// SECTION BUTTON SETUP
// ================================================================

function setupSectionButtons() {
    document.querySelectorAll('.section-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            if (section) switchSection(section);
        });
    });
}

// ================================================================
// KEYBOARD SHORTCUTS
// ================================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+H for help
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            showNotification('Keyboard Shortcuts: Ctrl+H (help), Ctrl+M (models), Ctrl+S (simulation), Ctrl+C (chat), Ctrl+F (fullscreen)', 'info');
        }
        
        // Ctrl+M for models
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            switchSection('models');
        }
        
        // Ctrl+S for simulation
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            switchSection('simulation');
        }
        
        // Ctrl+C for chat
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            switchSection('chatbox');
        }
        
        // Ctrl+F for fullscreen (with F11 fallback)
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            toggleFullscreen();
        }
    });
}

// ================================================================
// RESPONSIVE LAYOUT HANDLER
// ================================================================

function handleResponsiveLayout() {
    const width = window.innerWidth;
    
    if (width < 768) {
        // Mobile layout
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
    } else if (width < 1024) {
        // Tablet layout
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
    } else {
        // Desktop layout
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
    }
}

// ================================================================
// MAIN INITIALIZATION
// ================================================================

function initializeApp() {
    console.log('🚀 Y-314 BioMonitor v0.05 Initializing...');
    
    // Load saved theme
    loadSavedTheme();
    
    // Setup responsive layout
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup section buttons
    setupSectionButtons();
    
    // Check for auto-login
    const isAutoLogged = autoLoginFromSession();
    
    if (isAutoLogged) {
        console.log('✅ Auto-login successful');
        updateUserProfile();
    } else {
        // Show login page
        showLoginPage();
        switchLoginTab('signin');
    }
    
    // Update clock every second
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize module event listeners
    setupEventListeners();
    
    console.log('✅ App initialization complete');
    console.log('📊 Current State:', APP_STATE);
}

// ================================================================
// EVENT LISTENER SETUP
// ================================================================

function setupEventListeners() {
    // Section switching
    const sectionButtons = document.querySelectorAll('[data-section]');
    sectionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = btn.getAttribute('data-section');
            if (section) switchSection(section);
        });
    });
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    // Help button
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelp);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
}

// ================================================================
// HELP DIALOG
// ================================================================

function showHelp() {
    const help = `
🎓 Y-314 BioMonitor Help
═══════════════════════════════════════

📚 Sections:
• Models: View anatomical systems
• Simulation: Monitor vital signs
• Chatbox: Medical AI assistant
• Illness Lab: Experiment with conditions
• Analysis: Upload and analyze data

⌨️ Keyboard Shortcuts:
• Ctrl+H: Help
• Ctrl+M: Models
• Ctrl+S: Simulation
• Ctrl+C: Chatbox
• Ctrl+F: Fullscreen

💡 Tips:
1. Start simulation to see live vitals
2. Apply illnesses to see effects
3. Chat with AI about your symptoms
4. Upload CSV for data analysis
5. Use theme toggle for dark/light mode

❓ Need More Help?
Check the documentation or contact support.
    `;
    
    alert(help);
}

// ================================================================
// SETTINGS DIALOG
// ================================================================

function showSettings() {
    showNotification('Settings panel coming soon!', 'info');
}

// ================================================================
// AUTO-LOGOUT ON INACTIVITY (Optional)
// ================================================================

function setupInactivityLogout(minutes = 30) {
    let inactivityTimer;
    
    const resetTimer = () => {
        clearTimeout(inactivityTimer);
        
        inactivityTimer = setTimeout(() => {
            if (APP_STATE.isLoggedIn) {
                showNotification('Session expired due to inactivity', 'warning');
                handleLogout();
            }
        }, minutes * 60 * 1000);
    };
    
    // Reset timer on any user activity
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('click', resetTimer);
    
    resetTimer(); // Initial setup
}

// ================================================================
// ERROR HANDLING
// ================================================================

window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    showNotification('An error occurred: ' + event.error.message, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showNotification('An error occurred', 'error');
});

// ================================================================
// DOM READY CHECK & APP START
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

// Auto-logout after 30 minutes (optional, uncomment to enable)
// setupInactivityLogout(30);

console.log('%c✨ Y-314 BioMonitor Ready ✨', 'color: #00f5ff; font-size: 14px; font-weight: bold;');