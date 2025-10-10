// Medicine data storage (in-memory)
let medicines = [];
let history = [];
let currentFilter = 'all';
let charts = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDemoData();
    updateDashboard();
    updateAnalytics();
    setupFormHandler();
    loadReminders();
});

// Load demo data for testing
function loadDemoData() {
    medicines = [
        {
            id: 1,
            name: 'Aspirin',
            dosage: '500mg',
            time: '08:00',
            frequency: 'daily',
            addedDate: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Vitamin D',
            dosage: '1000 IU',
            time: '09:00',
            frequency: 'daily',
            addedDate: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Omega-3',
            dosage: '1000mg',
            time: '12:00',
            frequency: 'twice-daily',
            addedDate: new Date().toISOString()
        }
    ];

    history = [
        {
            id: 1,
            medicineName: 'Aspirin',
            dosage: '500mg',
            time: '08:00',
            status: 'taken',
            date: new Date().toISOString()
        },
        {
            id: 2,
            medicineName: 'Vitamin D',
            dosage: '1000 IU',
            time: '09:00',
            status: 'missed',
            date: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

// Tab switching function
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'analytics') {
        setTimeout(() => updateAnalytics(), 100);
    } else if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'history') {
        filterHistory(currentFilter);
    }
}

// Setup form handler
function setupFormHandler() {
    document.getElementById('medicine-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const medicine = {
            id: Date.now(),
            name: document.getElementById('pill-name').value,
            dosage: document.getElementById('dosage').value,
            time: document.getElementById('time').value,
            frequency: document.getElementById('frequency').value,
            addedDate: new Date().toISOString()
        };

        medicines.push(medicine);
        this.reset();
        updateDashboard();
        updateAnalytics();
        
        alert('✅ Medicine added successfully!');
    });
}

// Update Dashboard
function updateDashboard() {
    updateTodaySchedule();
    updateAllMedicines();
}

function updateTodaySchedule() {
    const scheduleDiv = document.getElementById('today-schedule');
    
    if (medicines.length === 0) {
        scheduleDiv.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No medicines scheduled for today. Add your first medicine!</p>';
        return;
    }

    scheduleDiv.innerHTML = medicines.map(med => `
        <div class="medicine-card">
            <div class="medicine-info">
                <h3>${med.name}</h3>
                <p>💊 Dosage: ${med.dosage}</p>
                <p>⏰ Time: ${med.time}</p>
                <p>🔄 Frequency: ${med.frequency}</p>
            </div>
            <div class="medicine-actions">
                <button class="btn-action btn-taken" onclick="markAsTaken(${med.id})">✓ Taken</button>
            </div>
        </div>
    `).join('');
}

function updateAllMedicines() {
    const allMedDiv = document.getElementById('all-medicines');
    
    if (medicines.length === 0) {
        allMedDiv.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No medicines added yet.</p>';
        return;
    }

    allMedDiv.innerHTML = medicines.map(med => `
        <div class="medicine-card">
            <div class="medicine-info">
                <h3>${med.name}</h3>
                <p>💊 Dosage: ${med.dosage}</p>
                <p>⏰ Time: ${med.time}</p>
                <p>🔄 Frequency: ${med.frequency}</p>
            </div>
            <div class="medicine-actions">
                <button class="btn-action btn-delete" onclick="deleteMedicine(${med.id})">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

// Mark medicine as taken
function markAsTaken(id) {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
        history.push({
            id: Date.now(),
            medicineName: medicine.name,
            dosage: medicine.dosage,
            time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
            status: 'taken',
            date: new Date().toISOString()
        });
        
        updateAnalytics();
        filterHistory(currentFilter);
        alert('✅ Marked as taken!');
    }
}

// Delete medicine
function deleteMedicine(id) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        medicines = medicines.filter(m => m.id !== id);
        updateDashboard();
        updateAnalytics();
        alert('🗑 Medicine deleted!');
    }
}

// Filter History
function filterHistory(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const historyDiv = document.getElementById('history-log');
    let filteredHistory = history;

    if (filter === 'taken') {
        filteredHistory = history.filter(h => h.status === 'taken');
    } else if (filter === 'missed') {
        filteredHistory = history.filter(h => h.status === 'missed');
    }

    if (filteredHistory.length === 0) {
        historyDiv.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No history records found.</p>';
        return;
    }

    historyDiv.innerHTML = filteredHistory.map(item => `
        <div class="history-item ${item.status === 'missed' ? 'missed' : ''}">
            <h4>${item.medicineName} - ${item.dosage}</h4>
            <p>⏰ Time: ${item.time}</p>
            <p>📅 Date: ${new Date(item.date).toLocaleDateString()}</p>
            <p>Status: <strong style="color: ${item.status === 'taken' ? '#4caf50' : '#f44336'}">${item.status.toUpperCase()}</strong></p>
        </div>
    `).join('');
}

// Update Analytics
function updateAnalytics() {
    updateStats();
    updateCharts();
    generateInsights();
}

function updateStats() {
    const taken = history.filter(h => h.status === 'taken').length;
    const missed = history.filter(h => h.status === 'missed').length;
    const total = taken + missed;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    document.getElementById('adherence-rate').textContent = adherenceRate + '%';
    document.getElementById('doses-taken').textContent = taken;
    document.getElementById('doses-missed').textContent = missed;
    document.getElementById('active-medicines').textContent = medicines.length;
    
    // Update profile medicine count
    const profileCount = document.getElementById('profile-medicine-count');
    if (profileCount) {
        profileCount.textContent = medicines.length;
    }
}

function calculateAdherenceRate() {
    const taken = history.filter(h => h.status === 'taken').length;
    const missed = history.filter(h => h.status === 'missed').length;
    const total = taken + missed;
    return total > 0 ? Math.round((taken / total) * 100) : 0;
}

function updateCharts() {
    createPieChart();
    createBarChart();
}

function createPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    const taken = history.filter(h => h.status === 'taken').length;
    const missed = history.filter(h => h.status === 'missed').length;

    if (charts.pieChart) {
        charts.pieChart.destroy();
    }

    charts.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Taken', 'Missed'],
            datasets: [{
                data: [taken, missed],
                backgroundColor: ['#4caf50', '#f44336'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (charts.barChart) {
        charts.barChart.destroy();
    }

    charts.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Adherence %',
                data: [85, 90, 78, 95, 88, 92, 87],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function generateInsights() {
    const insightsDiv = document.getElementById('insights-list');
    if (!insightsDiv) return;

    const adherenceRate = calculateAdherenceRate();
    const insights = [];

    if (adherenceRate >= 90) {
        insights.push('🎉 Excellent adherence! You\'re doing a great job staying on track!');
    } else if (adherenceRate >= 70) {
        insights.push('👍 Good adherence! Try to maintain this consistency.');
    } else if (adherenceRate < 70 && adherenceRate > 0) {
        insights.push('⚠️ Your adherence rate needs improvement. Set reminders to help!');
    }

    if (medicines.length === 0) {
        insights.push('💊 Start by adding your medicines to track your health journey.');
    } else if (medicines.length > 5) {
        insights.push('📋 You have multiple medicines. Consider organizing them by time.');
    }

    insights.push('💡 Tip: Take medicines at the same time daily for best results.');
    insights.push('🔔 Enable reminders to never miss a dose!');

    insightsDiv.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <p>${insight}</p>
        </div>
    `).join('');
}

// Chatbot Functions
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    chatWindow.classList.toggle('active');
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message === '') return;

    addChatMessage(message, 'user');
    input.value = '';

    setTimeout(() => {
        const response = generateBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

function addChatMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function generateBotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return 'Hello! 👋 How can I assist you with your medicines today?';
    }
    else if (msg.includes('help') || msg.includes('what can you do')) {
        return 'I can help you with:\n• Adding and tracking medicines 💊\n• Checking your schedule 📅\n• Viewing adherence stats 📊\n• Setting reminders 🔔\n• Answering medicine questions ❓';
    }
    else if (msg.includes('how many medicine') || msg.includes('total medicine')) {
        return `You currently have ${medicines.length} active medicine${medicines.length !== 1 ? 's' : ''} in your tracker. 💊`;
    }
    else if (msg.includes('adherence') || msg.includes('compliance') || msg.includes('rate')) {
        const rate = calculateAdherenceRate();
        return `Your current adherence rate is ${rate}%. ${rate >= 80 ? 'Great job! Keep it up! 💪' : 'Try to improve by setting reminders! 📱'}`;
    }
    else if (msg.includes('today') || msg.includes('schedule')) {
        return `You have ${medicines.length} medicine${medicines.length !== 1 ? 's' : ''} scheduled for today. Check the Dashboard tab to see details! 📋`;
    }
    else if (msg.includes('add') && msg.includes('medicine')) {
        return 'To add a new medicine:\n1. Go to "Add Medicine" tab ➕\n2. Fill in medicine name, dosage, time\n3. Select frequency\n4. Click "Add Medicine" button! 💊';
    }
    else if (msg.includes('reminder')) {
        return 'Click the 🔔 Reminders button in the navigation bar to view and manage all your medicine reminders!';
    }
    else if (msg.includes('history') || msg.includes('log')) {
        const taken = history.filter(h => h.status === 'taken').length;
        const missed = history.filter(h => h.status === 'missed').length;
        return `Your medicine history:\n✅ Taken: ${taken}\n❌ Missed: ${missed}\nCheck the History tab for more details! 📋`;
    }
    else if (msg.includes('thank')) {
        return 'You\'re welcome! Happy to help you stay healthy! 😊💊';
    }
    else if (msg.includes('bye') || msg.includes('goodbye')) {
        return 'Goodbye! Take care and don\'t forget your medicines! 👋💊';
    }
    else if (msg.includes('analytics') || msg.includes('stats')) {
        return 'Check the Analytics tab 📈 to see detailed statistics, charts, and health insights about your medicine adherence!';
    }
    else {
        return 'I\'m here to help you manage your medicines! You can ask me about:\n• Your schedule 📅\n• Adherence rate 📊\n• Adding medicines 💊\n• Setting reminders 🔔\n• And more!';
    }
}

// Toggle Reminders Popup
function toggleReminders() {
    const popup = document.getElementById('reminders-popup');
    popup.classList.toggle('active');
    
    if (popup.classList.contains('active')) {
        loadReminders();
    }
}

function loadReminders() {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) return;

    if (medicines.length === 0) {
        remindersList.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No reminders set. Add medicines to create reminders!</p>';
        return;
    }

    remindersList.innerHTML = medicines.map(med => `
        <div class="reminder-item">
            <h4>💊 ${med.name}</h4>
            <p>Dosage: ${med.dosage}</p>
            <p>Frequency: ${med.frequency}</p>
            <span class="reminder-time">⏰ ${med.time}</span>
        </div>
    `).join('');
}

// Show Profile Popup
function showProfile() {
    const popup = document.getElementById('profile-popup');
    popup.classList.toggle('active');
}

// Edit Profile (placeholder)
function editProfile() {
    alert('Profile editing feature coming soon! 🚀');
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
    const remindersPopup = document.getElementById('reminders-popup');
    const profilePopup = document.getElementById('profile-popup');
    
    if (event.target === remindersPopup) {
        remindersPopup.classList.remove('active');
    }
    if (event.target === profilePopup) {
        profilePopup.classList.remove('active');
    }
});