// Simple password protection for dashboard
document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    // Default password (CHANGE THIS IN PRODUCTION!)
    const DEFAULT_PASSWORD = 'sanskarsingh9807812524';
    
    // Check if user is already logged in
    checkAuthStatus();

    // Login button click event
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        attemptLogin();
    });

    // Enter key in password field
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            attemptLogin();
        }
    });

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    function attemptLogin() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError('Please enter a password');
            return;
        }

        // For demo purposes, using simple password check
        // In production, you should use proper authentication
        if (password === DEFAULT_PASSWORD) {
            // Successful login
            localStorage.setItem('dashboardAuthenticated', 'true');
            localStorage.setItem('dashboardLoginTime', Date.now().toString());
            
            // Hide login, show dashboard
            loginScreen.style.display = 'none';
            dashboard.style.display = 'block';
            
            // Clear password field
            passwordInput.value = '';
            passwordError.style.display = 'none';
            
            // Dispatch event for dashboard to initialize
            window.dispatchEvent(new Event('dashboardLogin'));
        } else {
            showError('Invalid password. Try again.');
        }
    }

    function checkAuthStatus() {
        const isAuthenticated = localStorage.getItem('dashboardAuthenticated');
        const loginTime = localStorage.getItem('dashboardLoginTime');
        
        // Check if login was within last 24 hours
        if (isAuthenticated === 'true' && loginTime) {
            const timeSinceLogin = Date.now() - parseInt(loginTime);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (timeSinceLogin < twentyFourHours) {
                // Still logged in
                loginScreen.style.display = 'none';
                dashboard.style.display = 'block';
                window.dispatchEvent(new Event('dashboardLogin'));
            } else {
                // Session expired
                logout();
            }
        } else {
            // Not logged in
            loginScreen.style.display = 'flex';
            dashboard.style.display = 'none';
        }
    }

    function logout() {
        localStorage.removeItem('dashboardAuthenticated');
        localStorage.removeItem('dashboardLoginTime');
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
        
        // Reset form
        passwordInput.value = '';
        passwordError.style.display = 'none';
        
        // Add logout notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Successfully logged out';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showError(message) {
        passwordError.textContent = message;
        passwordError.style.display = 'block';
        passwordInput.style.borderColor = '#ef4444';
        
        // Shake animation
        passwordInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Export functions for use in dashboard.js
window.auth = {
    logout: function() {
        localStorage.removeItem('dashboardAuthenticated');
        localStorage.removeItem('dashboardLoginTime');
        window.location.reload();
    },
    
    isAuthenticated: function() {
        const isAuthenticated = localStorage.getItem('dashboardAuthenticated');
        const loginTime = localStorage.getItem('dashboardLoginTime');
        
        if (isAuthenticated === 'true' && loginTime) {
            const timeSinceLogin = Date.now() - parseInt(loginTime);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            return timeSinceLogin < twentyFourHours;
        }
        return false;
    },
    
    updatePassword: function(newPassword) {
        // Note: In a real application, this would be handled server-side
        // This is just for demo purposes
        console.log('Password update would be handled server-side');
        return false;
    }
};