/* ================================================================
   AUTH.JS - Authentication & Login System
   ================================================================
   Handles user authentication, sign in/up, validation
   Dependencies: globals.js (must load first)
   ================================================================ */

// ================================================================
// PASSWORD VALIDATION
// ================================================================

function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const strength = Object.values(requirements).filter(Boolean).length;
    
    return {
        isValid: strength >= 4, // Requires at least 4 criteria
        strength: strength,
        requirements: requirements,
        message: strength >= 5 ? 'Strong' : strength >= 3 ? 'Medium' : 'Weak'
    };
}

// ================================================================
// EMAIL VALIDATION
// ================================================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================================================================
// SIGN UP HANDLER
// ================================================================

function handleSignUp() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const age = document.getElementById('signupAge').value;
    const gender = document.getElementById('signupGender').value;
    
    // Validation
    if (!name || name.length < 2) {
        showNotification('Name must be at least 2 characters', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
        showNotification('Password is too weak. Use uppercase, lowercase, numbers, and special characters.', 'error');
        return;
    }
    
    if (!age || age < 1 || age > 120) {
        showNotification('Please enter a valid age', 'error');
        return;
    }
    
    if (!gender) {
        showNotification('Please select a gender', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('Y314_USERS') || '{}');
    if (users[email]) {
        showNotification('This email is already registered', 'error');
        return;
    }
    
    // Create user
    users[email] = {
        name: name,
        email: email,
        password: btoa(password), // Basic encoding (not production secure)
        age: parseInt(age),
        gender: gender,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('Y314_USERS', JSON.stringify(users));
    
    // Clear form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';
    document.getElementById('signupAge').value = '';
    document.getElementById('signupGender').value = '';
    
    showNotification('Account created successfully! Please sign in.', 'success');
    
    // Switch to login tab
    setTimeout(() => {
        switchLoginTab('signin');
    }, 1000);
}

// ================================================================
// SIGN IN HANDLER
// ================================================================

function handleSignIn() {
    const email = document.getElementById('signinEmail').value.trim().toLowerCase();
    const password = document.getElementById('signinPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('Y314_USERS') || '{}');
    
    if (!users[email]) {
        showNotification('Email not found. Please sign up first.', 'error');
        return;
    }
    
    const user = users[email];
    if (btoa(password) !== user.password) {
        showNotification('Incorrect password', 'error');
        return;
    }
    
    // Create session
    const session = {
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('Y314_SESSION', JSON.stringify(session));
    
    // Save remember me preference
    if (rememberMe) {
        localStorage.setItem('Y314_REMEMBER_EMAIL', email);
    } else {
        localStorage.removeItem('Y314_REMEMBER_EMAIL');
    }
    
    // Update APP_STATE
    APP_STATE.currentUser = session;
    APP_STATE.isLoggedIn = true;
    
    showNotification(`Welcome back, ${user.name}!`, 'success');
    
    // Show dashboard after login
    setTimeout(() => {
        hideLoginPage();
        showDashboard();
    }, 800);
}

// ================================================================
// LOGIN TAB SWITCHING
// ================================================================

function switchLoginTab(tabName) {
    // Hide all tabs
    document.getElementById('signinTab').style.display = 'none';
    document.getElementById('signupTab').style.display = 'none';
    
    // Remove active class from buttons
    document.querySelectorAll('.login-tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'signin') {
        document.getElementById('signinTab').style.display = 'block';
        document.querySelector('[data-tab="signin"]').classList.add('active');
    } else if (tabName === 'signup') {
        document.getElementById('signupTab').style.display = 'block';
        document.querySelector('[data-tab="signup"]').classList.add('active');
    }
}

// ================================================================
// AUTO-LOGIN FROM SESSION
// ================================================================

function autoLoginFromSession() {
    const session = localStorage.getItem('Y314_SESSION');
    const rememberEmail = localStorage.getItem('Y314_REMEMBER_EMAIL');
    
    if (session && rememberEmail) {
        const sessionData = JSON.parse(session);
        APP_STATE.currentUser = sessionData;
        APP_STATE.isLoggedIn = true;
        
        setTimeout(() => {
            hideLoginPage();
            showDashboard();
        }, 500);
        
        return true;
    }
    
    // Fill email if remember me was used
    if (rememberEmail) {
        document.getElementById('signinEmail').value = rememberEmail;
    }
    
    return false;
}

// ================================================================
// LOGOUT HANDLER
// ================================================================

function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Clear session
    localStorage.removeItem('Y314_SESSION');
    
    // Reset state
    APP_STATE.isLoggedIn = false;
    APP_STATE.currentUser = null;
    APP_STATE.simulationRunning = false;
    
    // Clear timers
    if (APP_STATE.simulationInterval) {
        clearInterval(APP_STATE.simulationInterval);
    }
    
    showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
        hideDashboard();
        showLoginPage();
        
        // Clear login form
        document.getElementById('signinEmail').value = '';
        document.getElementById('signinPassword').value = '';
        document.getElementById('rememberMe').checked = false;
    }, 800);
}

// ================================================================
// PASSWORD STRENGTH INDICATOR
// ================================================================

function updatePasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const strengthIndicator = document.getElementById('passwordStrengthIndicator');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!password) {
        strengthIndicator.style.display = 'none';
        return;
    }
    
    const check = validatePassword(password);
    const percentage = (check.strength / 5) * 100;
    
    strengthIndicator.style.display = 'block';
    strengthIndicator.style.width = percentage + '%';
    
    if (check.strength <= 1) {
        strengthIndicator.style.background = '#ff0055';
        strengthText.textContent = 'Very Weak';
        strengthText.style.color = '#ff0055';
    } else if (check.strength <= 2) {
        strengthIndicator.style.background = '#ffbe0b';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#ffbe0b';
    } else if (check.strength <= 3) {
        strengthIndicator.style.background = '#39ff14';
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#39ff14';
    } else if (check.strength <= 4) {
        strengthIndicator.style.background = '#00f5ff';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#00f5ff';
    } else {
        strengthIndicator.style.background = '#39ff14';
        strengthText.textContent = 'Very Strong';
        strengthText.style.color = '#39ff14';
    }
}

// ================================================================
// PASSWORD VISIBILITY TOGGLE
// ================================================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '👁️‍🗨️ Hide';
    } else {
        input.type = 'password';
        button.textContent = '👁️ Show';
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeAuth() {
    // Sign up form events
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignUp);
    }
    
    // Sign in form events
    const signinBtn = document.getElementById('signinBtn');
    if (signinBtn) {
        signinBtn.addEventListener('click', handleSignIn);
    }
    
    // Tab switching
    document.querySelectorAll('.login-tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLoginTab(e.target.dataset.tab);
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Enter key submission
    document.getElementById('signinPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignIn();
    });
    
    document.getElementById('signupConfirmPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignUp();
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}