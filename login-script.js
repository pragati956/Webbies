// ===== TOGGLE BETWEEN LOGIN AND SIGNUP =====
function showLogin() {
    // Hide signup form
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    
    // Update toggle buttons
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns[0].classList.add('active');
    toggleBtns[1].classList.remove('active');
}

function showSignup() {
    // Hide login form
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    
    // Update toggle buttons
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns[0].classList.remove('active');
    toggleBtns[1].classList.add('active');
}

// ===== SIMPLE USER STORAGE (In Memory) =====
let users = [
    // Demo user for testing
    { name: 'Demo User', email: 'demo@example.com', password: 'demo123' }
];

// ===== LOGIN FORM HANDLER =====
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user info (in memory)
        window.currentUser = user;
        
        // Show success message
        alert('✅ Login successful! Welcome back, ' + user.name);
        
        // Redirect to main app
        window.location.href = 'index.html';
    } else {
        alert('❌ Invalid email or password. Try: demo@example.com / demo123');
    }
});

// ===== SIGNUP FORM HANDLER =====
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        alert('❌ User with this email already exists!');
        return;
    }
    
    // Create new user
    const newUser = {
        name: name,
        email: email,
        password: password
    };
    
    users.push(newUser);
    
    // Show success and switch to login
    alert('✅ Account created successfully! Please login.');
    
    // Clear form
    document.getElementById('signup-form').reset();
    
    // Switch to login
    showLogin();
});

// ===== INITIALIZE =====
console.log('🧪 Login page loaded!');
console.log('Demo credentials: demo@example.com / demo123');