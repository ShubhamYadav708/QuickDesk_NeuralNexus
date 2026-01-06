// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    
    // Handle Sign In
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }
    
    // Handle Sign Up
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
});

function handleSignIn(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        // Mock authentication
        const users = JSON.parse(localStorage.getItem('quickdesk_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        setLoading(submitBtn, false);
        
        if (user) {
            // Store session
            const sessionData = {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            
            if (rememberMe) {
                localStorage.setItem('quickdesk_session', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('quickdesk_session', JSON.stringify(sessionData));
            }
            
            showSuccess('Sign in successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showError('password', 'Invalid email or password');
        }
    }, 1500);
}

function handleSignUp(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = formData.get('role');
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    if (!fullName || fullName.trim().length < 2) {
        showError('fullName', 'Full name must be at least 2 characters');
        hasErrors = true;
    }
    
    if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (!password || password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        hasErrors = true;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (!role) {
        showError('role', 'Please select an account type');
        hasErrors = true;
    }
    
    if (!agreeTerms) {
        showError('agreeTerms', 'You must agree to the terms and conditions');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('quickdesk_users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        setLoading(submitBtn, false);
        
        if (existingUser) {
            showError('email', 'An account with this email already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            fullName: fullName.trim(),
            email: email,
            password: password, // In real app, this would be hashed
            role: role,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        users.push(newUser);
        localStorage.setItem('quickdesk_users', JSON.stringify(users));
        
        showSuccess('Account created successfully! Redirecting to sign in...');
        
        // Redirect to sign in page
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
    }, 1500);
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(fieldName, message) {
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    const formGroup = field.closest('.form-group') || field.parentElement;
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearErrors() {
    // Remove error classes
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
    
    // Remove error messages
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.remove();
    });
    
    // Remove success messages
    document.querySelectorAll('.success-message').forEach(msg => {
        msg.remove();
    });
}

function showSuccess(message) {
    const form = document.querySelector('.auth-form');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = 'Processing...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = button.form.id === 'signinForm' ? 'Sign In' : 'Create Account';
    }
}

// Check if user is already logged in
function checkAuthStatus() {
    const session = localStorage.getItem('quickdesk_session') || sessionStorage.getItem('quickdesk_session');
    if (session && (window.location.pathname.includes('signin.html') || window.location.pathname.includes('signup.html'))) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Run auth check on page load
checkAuthStatus();