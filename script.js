// ===== DATA STORAGE (Using memory - no localStorage) =====
let medicines = [];
let history = [];
let charts = {}; // Store chart instances

// ===== FEATURE 1: TAB NAVIGATION =====
function showTab(tabName) {
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    const allBtns = document.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// ===== FEATURE 2: ADD MEDICINE FORM =====
document.getElementById('medicine-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pillName = document.getElementById('pill-name').value;
    const dosage = document.getElementById('dosage').value;
    const time = document.getElementById('time').value;
    const frequency = document.getElementById('frequency').value;
    
    const medicine = {
        id: Date.now(),
        pillName: pillName,
        dosage: dosage,
        time: time,
        frequency: frequency,
        createdAt: new Date().toISOString()
    };
    
    medicines.push(medicine);
    
    alert('✅ Medicine added successfully!');
    document.getElementById('medicine-form').reset();
    document.querySelector('.tab-btn[onclick*="dashboard"]').click();
});

// ===== FEATURE 3: DISPLAY DASHBOARD =====
function loadDashboard() {
    const todaySchedule = document.getElementById('today-schedule');
    const allMedicines = document.getElementById('all-medicines');
    
    todaySchedule.innerHTML = '';
    allMedicines.innerHTML = '';
    
    if (medicines.length === 0) {
        todaySchedule.innerHTML = '<div class="empty-state"><p>📋 No medicines scheduled yet. Add your first medicine!</p></div>';
        return;
    }
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    medicines.forEach(medicine => {
        const [medHour, medMinute] = medicine.time.split(':').map(Number);
        const isPending = medHour > currentHour || (medHour === currentHour && medMinute > currentMinute);
        
        if (isPending) {
            todaySchedule.innerHTML += createMedicineCard(medicine, true);
        }
    });
    
    if (todaySchedule.innerHTML === '') {
        todaySchedule.innerHTML = '<div class="empty-state"><p>🎉 All done for today!</p></div>';
    }
    
    medicines.forEach(medicine => {
        allMedicines.innerHTML += createMedicineCard(medicine, false);
    });
}

// ===== FEATURE 4: CREATE MEDICINE CARD =====
function createMedicineCard(medicine, showActions) {
    const actionButtons = showActions ? `
        <div class="medicine-actions">
            <button class="btn-small btn-taken" onclick="markAsTaken(${medicine.id})">✓ Taken</button>
            <button class="btn-small btn-missed" onclick="markAsMissed(${medicine.id})">✗ Missed</button>
        </div>
    ` : `
        <div class="medicine-actions">
            <button class="btn-small btn-edit" onclick="editMedicine(${medicine.id})">Edit</button>
            <button class="btn-small btn-delete" onclick="deleteMedicine(${medicine.id})">Delete</button>
        </div>
    `;
    
    return `
        <div class="medicine-card">
            <div class="medicine-info">
                <h3>${medicine.pillName}</h3>
                <p><strong>Dosage:</strong> ${medicine.dosage}</p>
                <p><strong>Time:</strong> ${medicine.time}</p>
                <p><strong>Frequency:</strong> ${medicine.frequency}</p>
            </div>
            ${actionButtons}
        </div>
    `;
}

// ===== FEATURE 5: MARK MEDICINE AS TAKEN/MISSED =====
function markAsTaken(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
        history.push({
            id: Date.now(),
            medicineId: medicineId,
            medicineName: medicine.pillName,
            dosage: medicine.dosage,
            time: medicine.time,
            status: 'taken',
            timestamp: new Date().toISOString()
        });
        
        showNotification('Medicine Taken', `You've taken ${medicine.pillName} ${medicine.dosage}`);
        loadDashboard();
    }
}

function markAsMissed(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
        history.push({
            id: Date.now(),
            medicineId: medicineId,
            medicineName: medicine.pillName,
            dosage: medicine.dosage,
            time: medicine.time,
            status: 'missed',
            timestamp: new Date().toISOString()
        });
        
        showNotification('Medicine Missed', `You've marked ${medicine.pillName} as missed`);
        loadDashboard();
    }
}

// ===== FEATURE 6: BROWSER NOTIFICATIONS =====
function showNotification(title, body) {
    if (!("Notification" in window)) {
        alert(title + ': ' + body);
        return;
    }
    
    if (Notification.permission === "granted") {
        new Notification(title, { body: body, icon: '🧪' });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(title, { body: body, icon: '🧪' });
            }
        });
    } else {
        alert(title + ': ' + body);
    }
}

if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// ===== FEATURE 7: EDIT MEDICINE =====
function editMedicine(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
        document.getElementById('pill-name').value = medicine.pillName;
        document.getElementById('dosage').value = medicine.dosage;
        document.getElementById('time').value = medicine.time;
        document.getElementById('frequency').value = medicine.frequency;
        
        deleteMedicine(medicineId, false);
        document.querySelector('.tab-btn[onclick*="add-medicine"]').click();
    }
}

// ===== FEATURE 8: DELETE MEDICINE =====
function deleteMedicine(medicineId, confirm = true) {
    if (confirm && !window.confirm('Are you sure you want to delete this medicine?')) {
        return;
    }
    
    medicines = medicines.filter(m => m.id !== medicineId);
    loadDashboard();
}

// ===== FEATURE 9: HISTORY LOG =====
function loadHistory(filter = 'all') {
    const historyLog = document.getElementById('history-log');
    historyLog.innerHTML = '';
    
    if (history.length === 0) {
        historyLog.innerHTML = '<div class="empty-state"><p>📊 No history yet. Start tracking your medicines!</p></div>';
        return;
    }
    
    let filteredHistory = history;
    if (filter !== 'all') {
        filteredHistory = history.filter(h => h.status === filter);
    }
    
    filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    filteredHistory.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        historyLog.innerHTML += `
            <div class="history-item ${entry.status}">
                <div>
                    <h3>${entry.medicineName}</h3>
                    <p>${entry.dosage} - Scheduled: ${entry.time}</p>
                    <p>Recorded: ${dateStr} at ${timeStr}</p>
                </div>
                <span class="status-badge ${entry.status}">${entry.status.toUpperCase()}</span>
            </div>
        `;
    });
}

function filterHistory(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadHistory(filter);
}

// ===== FEATURE 10: ADVANCED ANALYTICS WITH CHART.JS =====
function loadAnalytics() {
    const totalDoses = history.length;
    const takenDoses = history.filter(h => h.status === 'taken').length;
    const missedDoses = history.filter(h => h.status === 'missed').length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    // Update stats
    document.getElementById('adherence-rate').textContent = adherenceRate + '%';
    document.getElementById('doses-taken').textContent = takenDoses;
    document.getElementById('doses-missed').textContent = missedDoses;
    document.getElementById('active-medicines').textContent = medicines.length;
    
    // Destroy old charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
    
    // Create all charts
    createPieChart(takenDoses, missedDoses);
    createBarChart();
    createLineChart();
    createDoughnutChart();
    generateInsights(adherenceRate, takenDoses, missedDoses);
}

// ===== PIE CHART: Adherence Overview =====
function createPieChart(taken, missed) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
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
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ===== BAR CHART: Weekly Adherence Trend =====
function createBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    // Get last 7 days data
    const last7Days = [];
    const takenData = [];
    const missedData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        last7Days.push(dateStr);
        
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayHistory = history.filter(h => {
            const hDate = new Date(h.timestamp);
            return hDate >= dayStart && hDate <= dayEnd;
        });
        
        takenData.push(dayHistory.filter(h => h.status === 'taken').length);
        missedData.push(dayHistory.filter(h => h.status === 'missed').length);
    }
    
    charts.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [
                {
                    label: 'Taken',
                    data: takenData,
                    backgroundColor: '#4caf50',
                    borderRadius: 5
                },
                {
                    label: 'Missed',
                    data: missedData,
                    backgroundColor: '#f44336',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ===== LINE CHART: Daily Progress Over Time =====
function createLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    // Get last 14 days data
    const last14Days = [];
    const adherenceData = [];
    
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last14Days.push(dateStr);
        
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayHistory = history.filter(h => {
            const hDate = new Date(h.timestamp);
            return hDate >= dayStart && hDate <= dayEnd;
        });
        
        const taken = dayHistory.filter(h => h.status === 'taken').length;
        const total = dayHistory.length;
        const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
        adherenceData.push(rate);
    }
    
    charts.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last14Days,
            datasets: [{
                label: 'Adherence Rate (%)',
                data: adherenceData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
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

// ===== DOUGHNUT CHART: Medicine Distribution =====
function createDoughnutChart() {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    
    // Count medicines by frequency
    const frequencyCount = {};
    medicines.forEach(med => {
        frequencyCount[med.frequency] = (frequencyCount[med.frequency] || 0) + 1;
    });
    
    const labels = Object.keys(frequencyCount);
    const data = Object.values(frequencyCount);
    const colors = ['#667eea', '#4caf50', '#ff9800', '#f44336', '#2196f3'];
    
    charts.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1).replace('-', ' ')),
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
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
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// ===== GENERATE HEALTH INSIGHTS =====
function generateInsights(adherenceRate, taken, missed) {
    const insightsList = document.getElementById('insights-list');
    insightsList.innerHTML = '';
    
    const insights = [];
    
    // Insight 1: Overall Performance
    if (adherenceRate >= 90) {
        insights.push({
            icon: '🌟',
            title: 'Excellent Adherence!',
            description: `You're doing amazing with ${adherenceRate}% adherence rate. Keep up the great work!`
        });
    } else if (adherenceRate >= 70) {
        insights.push({
            icon: '👍',
            title: 'Good Progress',
            description: `Your ${adherenceRate}% adherence is good. Try to be more consistent to reach 90%+.`
        });
    } else if (adherenceRate > 0) {
        insights.push({
            icon: '💪',
            title: 'Room for Improvement',
            description: `Your ${adherenceRate}% adherence needs attention. Set reminders to help you stay on track.`
        });
    } else {
        insights.push({
            icon: '🎯',
            title: 'Let\'s Get Started',
            description: 'Start tracking your medicines to see your adherence insights here!'
        });
    }
    
    // Insight 2: Streak Analysis
    if (taken > 0) {
        insights.push({
            icon: '🔥',
            title: 'Dose Streak',
            description: `You've successfully taken ${taken} doses. That's dedication to your health!`
        });
    }
    
    // Insight 3: Missed Doses Warning
    if (missed > 5) {
        insights.push({
            icon: '⚠️',
            title: 'Attention Needed',
            description: `You've missed ${missed} doses. Consider enabling notifications or adjusting your schedule.`
        });
    }
    
    // Insight 4: Active Medicines
    if (medicines.length > 0) {
        insights.push({
            icon: '💊',
            title: 'Active Schedule',
            description: `You're currently tracking ${medicines.length} medicine(s). Stay organized and healthy!`
        });
    }
    
    // Render insights
    insights.forEach(insight => {
        insightsList.innerHTML += `
            <div class="insight-item">
                <strong>${insight.icon} ${insight.title}</strong>
                <p>${insight.description}</p>
            </div>
        `;
    });
}

// ===== FEATURE 11: AUTOMATIC REMINDERS =====
function checkReminders() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    medicines.forEach(medicine => {
        if (medicine.time === currentTime) {
            const today = now.toDateString();
            const alreadyLogged = history.some(h => {
                const historyDate = new Date(h.timestamp).toDateString();
                return h.medicineId === medicine.id && historyDate === today;
            });
            
            if (!alreadyLogged) {
                showNotification(
                    '⏰ Medicine Reminder',
                    `Time to take ${medicine.pillName} ${medicine.dosage}`
                );
            }
        }
    });
}

// Check for reminders every minute
setInterval(checkReminders, 60000);

// ===== LOAD USER INFO =====
function loadUserInfo() {
    const userName = document.getElementById('user-name');
    if (window.currentUser) {
        userName.textContent = '👤 ' + window.currentUser.name;
    }
}

// ===== INITIALIZE APP =====
window.onload = function() {
    loadDashboard();
    loadUserInfo();
    
    // Add some demo data for testing
    if (medicines.length === 0) {
        console.log('💡 Tip: Add some medicines to see the analytics in action!');
    }
    
    console.log('🧪 Alchemist\'s Grimoire - Medicine Tracker Loaded!');
};