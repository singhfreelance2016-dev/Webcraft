// Secure Authentication System
class SecureAuth {
    constructor() {
        this.apiBase = '/.netlify/functions/auth';
        this.isAuthenticated = false;
        this.checkInterval = null;
    }
    
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.isAuthenticated = true;
                this.startSessionCheck();
                return { success: true, message: data.message };
            } else {
                // Generic error message for security
                return { 
                    success: false, 
                    message: data.error || 'Invalid credentials' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: 'Network error. Please try again.' 
            };
        }
    }
    
    async verifySession() {
        try {
            const response = await fetch(`${this.apiBase}/verify`, {
                credentials: 'include' // Include cookies
            });
            
            const data = await response.json();
            this.isAuthenticated = data.authenticated || false;
            return this.isAuthenticated;
        } catch (error) {
            console.error('Session verification error:', error);
            this.isAuthenticated = false;
            return false;
        }
    }
    
    async logout() {
        try {
            await fetch(`${this.apiBase}/logout`, {
                credentials: 'include'
            });
            
            this.isAuthenticated = false;
            this.stopSessionCheck();
            
            // Clear any client-side data
            localStorage.removeItem('clientSubmissions');
            sessionStorage.clear();
            
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    }
    
    startSessionCheck() {
        // Check session every 5 minutes
        this.checkInterval = setInterval(async () => {
            const isValid = await this.verifySession();
            if (!isValid) {
                this.handleSessionExpired();
            }
        }, 5 * 60 * 1000);
    }
    
    stopSessionCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    
    handleSessionExpired() {
        this.isAuthenticated = false;
        this.stopSessionCheck();
        
        // Show session expired message
        if (document.getElementById('dashboard')) {
            alert('Your session has expired. Please log in again.');
            window.location.reload();
        }
    }
}

// Create global auth instance
window.secureAuth = new SecureAuth();