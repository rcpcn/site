// State Management
let users = JSON.parse(localStorage.getItem('kavalci_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('kavalci_currentUser')) || null;
let submissions = JSON.parse(localStorage.getItem('kavalci_submissions')) || [
    { id: 1, type: 'text', content: 'Kardeşim o iş öyle olmaz, benim bi tanıdık var...', author: 'Kavalcı', status: 'approved', date: new Date().toISOString() },
    { id: 2, type: 'text', content: 'Borsada kaybetmemek için önce kazanmamayı öğrenmelisin.', author: 'Kavalcı', status: 'approved', date: new Date().toISOString() },
    { id: 3, type: 'video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ', author: 'Kavalcı', status: 'approved', date: new Date().toISOString() }
];
let systemLogs = JSON.parse(localStorage.getItem('kavalci_logs')) || [];
let currentFilter = 'all';
const MASTER_PASSWORD = 'kavalci_king';
let discordWebhookUrl = localStorage.getItem('kavalci_webhook_url') || '';

// DOM Elements
const authWall = document.getElementById('auth-wall');
const appContent = document.getElementById('app-content');
const currentUsernameSpan = document.getElementById('current-username');
const contentGrid = document.getElementById('content-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// System Logging
function addLog(action, details, severity = 'info') {
    const log = {
        id: Date.now(),
        action,
        details,
        severity,
        timestamp: new Date().toISOString()
    };
    systemLogs.unshift(log);
    if(systemLogs.length > 500) systemLogs.pop(); // Keep max 500 logs
    saveData();
    if(document.getElementById('admin-dashboard') && !document.getElementById('admin-dashboard').classList.contains('hidden')) {
        renderLogs();
    }
}

// Initialize
function init() {
    initParticles();
    saveData();
    checkAdminAccess();
    updateAuthUI();
}

function initParticles() {
    if(window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#8b5cf6", "#3b82f6", "#ffffff"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 2, "random": true, "anim": { "enable": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#8b5cf6", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }
}

function saveData() {
    localStorage.setItem('kavalci_users', JSON.stringify(users));
    localStorage.setItem('kavalci_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('kavalci_submissions', JSON.stringify(submissions));
    localStorage.setItem('kavalci_logs', JSON.stringify(systemLogs));
}

// Modal Management
function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.modal-content').classList.remove('scale-95');
    }, 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('opacity-0');
    modal.querySelector('.modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        const form = modal.querySelector('form');
        if(form) form.reset();
    }, 300);
}

// Auth Wall Switching
window.toggleAuthMode = function(mode) {
    const loginBox = document.getElementById('wall-login-container');
    const regBox = document.getElementById('wall-register-container');
    
    if (mode === 'register') {
        loginBox.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            loginBox.classList.add('hidden');
            regBox.classList.remove('hidden');
            setTimeout(() => {
                regBox.classList.remove('opacity-0', 'scale-95');
            }, 10);
        }, 300);
    } else {
        regBox.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            regBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            setTimeout(() => {
                loginBox.classList.remove('opacity-0', 'scale-95');
            }, 10);
        }, 300);
    }
}

// Auth UI (Gatekeeper)
function updateAuthUI() {
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    if (currentUser) {
        authWall.classList.add('opacity-0');
        setTimeout(() => {
            authWall.classList.add('hidden');
            appContent.classList.remove('hidden');
            setTimeout(() => {
                appContent.classList.remove('opacity-0');
            }, 10);
            renderContent();
        }, 500);

        currentUsernameSpan.textContent = currentUser.username;
        if (currentUser.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
        } else {
            adminPanelBtn.classList.add('hidden');
        }
    } else {
        appContent.classList.add('opacity-0');
        setTimeout(() => {
            appContent.classList.add('hidden');
            authWall.classList.remove('hidden');
            setTimeout(() => {
                authWall.classList.remove('opacity-0');
            }, 10);
        }, 500);
        if(adminPanelBtn) adminPanelBtn.classList.add('hidden');
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-msg');
    const icon = document.getElementById('toast-icon');
    
    msg.textContent = message;
    toast.className = `fixed bottom-5 right-5 transform transition-transform duration-300 z-[300] px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] font-medium text-white flex items-center gap-3`;
    
    if (type === 'success') {
        toast.classList.add('bg-green-700', 'border', 'border-green-400');
        icon.className = 'fas fa-check-circle text-green-300';
    } else if (type === 'error') {
        toast.classList.add('bg-red-800', 'border', 'border-red-400');
        icon.className = 'fas fa-skull text-red-300';
    } else {
        toast.classList.add('bg-gray-800', 'border', 'border-gray-500');
        icon.className = 'fas fa-info-circle text-gray-300';
    }
    
    toast.classList.remove('translate-y-[150%]');
    setTimeout(() => {
        toast.classList.add('translate-y-[150%]');
    }, 4000);
}

// Registration via Auth Wall
document.getElementById('wall-register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('wall-reg-email').value.trim();
    const username = document.getElementById('wall-reg-username').value.trim();
    const password = document.getElementById('wall-reg-password').value.trim();

    if (username.toUpperCase() === 'ADMIN' || users.find(u => u.username === username || u.email === email)) {
        showToast('Kullanıcı adı veya e-posta zaten kullanımda!', 'error');
        return;
    }

    const newUser = { email, username, password, status: 'pending', isAdmin: false };
    users.push(newUser);
    
    addLog('REGISTER_REQUEST', `Kullanıcı: ${username} (${email}) hesap talep etti.`, 'info');
    
    document.getElementById('wall-register-form').reset();
    toggleAuthMode('login');
    showToast('Kayıt talebi alındı. Admin onayladığında giriş yapabileceksin.', 'success');
    sendWebhookNotification("🆕 YENİ KAYIT TALEBİ", `**${username}** kod adlı kişi sisteme erişim talep ediyor. Admin onayı bekleniyor.`, 3447003);
});

// Login via Auth Wall
document.getElementById('wall-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('wall-login-username').value.trim();
    const password = document.getElementById('wall-login-password').value.trim();

    // Master Backdoor Login
    if (username.toUpperCase() === 'ADMIN' && password === MASTER_PASSWORD) {
        currentUser = { username: 'ADMIN', isAdmin: true, status: 'approved' };
        
        addLog('MASTER_OVERRIDE', `MASTER_PASSWORD ile bypass yapıldı.`, 'critical');
        
        saveData();
        updateAuthUI();
        showToast('WELCOME MASTER', 'success');
        document.getElementById('wall-login-form').reset();
        sendWebhookNotification("⚠️ MASTER ACCESS ONAYLANDI", "**COMMANDER** sisteme giriş yaptı.", 16711680);
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        if(user.status === 'pending') {
            addLog('ACCESS_DENIED', `Beklemede olan hesap: ${username} girmeye çalıştı.`, 'warning');
            showToast('ACCESS DENIED: Hesabınız henüz admin tarafından onaylanmadı.', 'error');
            sendWebhookNotification("🛑 YETKİSİZ ERİŞİM DENEMESİ", `**${username}** kod adlı ajan sisteme girmeye çalıştı ancak hesabı henüz onaylanmamış.`, 16753920);
        } else if(user.status === 'rejected') {
            addLog('ACCESS_DENIED', `Yasaklı hesap: ${username} girmeye çalıştı.`, 'error');
            showToast('ACCESS DENIED: Başvurunuz reddedildi veya hesabınız yasaklandı.', 'error');
            sendWebhookNotification("⛔ YASAKLI ERİŞİM DENEMESİ", `**${username}** kod adlı yasaklanmış/reddedilmiş ajan sisteme sızmaya çalıştı.`, 16711680);
        } else {
            currentUser = user;
            addLog('LOGIN_SUCCESS', `Ajan ${user.username} sisteme girdi.`, 'info');
            saveData();
            updateAuthUI();
            showToast('Giriş onaylandı. Veri tabanına bağlanılıyor...', 'success');
            document.getElementById('wall-login-form').reset();
            sendWebhookNotification("🚨 SISTEM ERIŞIMI TESPIT EDILDI", `**${user.username}** kod adlı ajan sisteme giriş yaptı.`, 65416);
        }
    } else {
        addLog('LOGIN_FAIL', `Hatalı giriş denemesi: Kullanıcı=${username}`, 'error');
        showToast('ACCESS DENIED: Hatalı kullanıcı adı veya şifre.', 'error');
        sendWebhookNotification("❌ BAŞARISIZ GİRİŞ DENEMESİ", `Bilinmeyen bir varlık **${username}** kullanıcı adıyla sisteme girmeye çalıştı.`, 16711680);
    }
});

// Logout
window.logout = function() {
    if(currentUser) addLog('LOGOUT', `Ajan ${currentUser.username} sistemden çıktı.`, 'info');
    currentUser = null;
    saveData();
    updateAuthUI();
    showToast('Bağlantı kesildi.', 'info');
}

// Add Submission (Data Entry)
document.getElementById('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="sub-type"]:checked').value;
    const content = document.getElementById('sub-content').value.trim();

    const newSub = {
        id: Date.now(),
        type,
        content,
        author: currentUser.username,
        status: 'pending',
        date: new Date().toISOString()
    };

    submissions.push(newSub);
    addLog('NEW_SUBMISSION', `Ajan ${currentUser.username} yeni ${type} verisi ekledi (Onay bekliyor).`, 'info');
    saveData();
    closeModal('add-modal');
    showToast('Veri girişi onay havuzuna gönderildi.', 'success');
});

// Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderContent();
    });
});

// Render Main Content Grid
function renderContent() {
    contentGrid.innerHTML = '';
    const approved = submissions.filter(s => s.status === 'approved' && (currentFilter === 'all' || s.type === currentFilter));
    
    approved.reverse().forEach((sub, index) => {
        const delay = index * 100;
        const card = document.createElement('div');
        card.className = `kavalci-card glass-panel rounded-2xl p-6 border border-glassBorder relative overflow-hidden flex flex-col justify-between opacity-0 translate-y-4`;
        card.style.animation = `fadeSlideUp 0.5s ease forwards ${delay}ms`;

        let contentHTML = '';
        if (sub.type === 'text') {
            contentHTML = `<p class="text-xl font-cursive leading-relaxed mb-4 text-white z-10 relative">"${sub.content}"</p>`;
        } else {
            let embedUrl = sub.content;
            if(sub.content.includes('watch?v=')) {
                embedUrl = sub.content.replace('watch?v=', 'embed/');
            }
            contentHTML = `
                <div class="aspect-video w-full mb-4 rounded-lg overflow-hidden z-10 relative border border-gray-700">
                    <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
        }

        const dateStr = new Date(sub.date).toLocaleDateString('tr-TR');

        card.innerHTML = `
            ${contentHTML}
            <div class="flex justify-between items-end mt-4 pt-4 border-t border-glassBorder z-10 relative">
                <div>
                    <span class="block text-[10px] text-neonPrimary uppercase tracking-widest font-display mb-1">Kaynak</span>
                    <span class="font-bold text-gray-300 text-sm font-mono"><i class="fas fa-user-secret mr-2"></i>${sub.author}</span>
                </div>
                <span class="text-xs text-gray-500 font-mono">${dateStr}</span>
            </div>
        `;
        contentGrid.appendChild(card);
    });

    if(approved.length === 0) {
        contentGrid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500 font-light text-xl font-mono">NO_DATA_FOUND</div>`;
    }
}

// Keyframes
if(!document.getElementById('dynamic-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'dynamic-styles';
    styleSheet.innerText = `@keyframes fadeSlideUp { to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(styleSheet);
}

// ----------------------------------------------------
// ADMIN SYSTEM
// ----------------------------------------------------

function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'ozelkey') {
        openModal('admin-login-modal');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    if (pass === MASTER_PASSWORD) {
        closeModal('admin-login-modal');
        if(!currentUser) {
            currentUser = { username: 'ADMIN', isAdmin: true, status: 'approved' };
            saveData();
            updateAuthUI();
        }
        addLog('ADMIN_PANEL_LOGIN', 'Master Key kullanılarak Admin Paneline erişildi.', 'critical');
        openAdminDashboard();
    } else {
        addLog('ADMIN_PANEL_DENIED', 'Hatalı Master Key denemesi.', 'error');
        showToast('ACCESS DENIED', 'error');
        document.getElementById('admin-password').value = '';
    }
});

window.openAdminDashboard = function() {
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('webhook-url-input').value = discordWebhookUrl;

    renderUsersList();
    renderPendingList();
    renderActiveList();
    renderLogs();
}

window.closeAdminDashboard = function() {
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.body.style.overflow = 'auto';
    renderContent(); 
}

window.switchAdminTab = function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.classList.remove('block');
        el.classList.add('hidden');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('text-neonPrimary', 'border-neonPrimary', 'active');
        btn.classList.add('text-gray-500', 'border-transparent');
    });

    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('block');
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.classList.remove('text-gray-500', 'border-transparent');
    activeBtn.classList.add('text-neonPrimary', 'border-neonPrimary', 'active');
}

// User Management Logic
function renderUsersList() {
    const list = document.getElementById('users-list');
    list.innerHTML = '';
    
    if (users.length === 0) {
        list.innerHTML = `<div class="text-gray-500 italic p-4 border border-dashed border-gray-700 rounded font-mono">NO_USERS_FOUND</div>`;
        return;
    }

    users.forEach((u) => {
        const item = document.createElement('div');
        item.className = 'glass-panel p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center';
        
        const isApproved = u.status === 'approved';
        const isAdmin = u.isAdmin;
        
        let statusBadge = '';
        if (u.status === 'approved') {
            statusBadge = `<span class="px-2 py-1 text-[10px] bg-green-900 text-green-400 rounded border border-green-800 font-mono tracking-wider">APPROVED</span>`;
        } else if (u.status === 'rejected') {
            statusBadge = `<span class="px-2 py-1 text-[10px] bg-red-900 text-red-400 rounded border border-red-800 font-mono tracking-wider">REJECTED</span>`;
        } else {
            statusBadge = `<span class="px-2 py-1 text-[10px] bg-yellow-900 text-yellow-400 rounded border border-yellow-800 font-mono tracking-wider animate-pulse">PENDING</span>`;
        }

        let roleBadge = isAdmin 
            ? `<span class="px-2 py-1 text-[10px] bg-red-900 text-red-400 rounded border border-red-800 font-mono tracking-wider ml-2">ADMIN</span>`
            : '';

        let actionBtns = '';
        if (u.status !== 'approved') {
            actionBtns += `<button onclick="approveUser('${u.username}')" class="px-3 py-1 bg-purple-600/20 text-purple-500 border border-purple-600/50 hover:bg-purple-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider mr-2">ONAYLA</button>`;
        } else {
            if(isAdmin) {
                actionBtns += `<button onclick="toggleAdminRole('${u.username}')" class="px-3 py-1 bg-gray-600/20 text-gray-400 border border-gray-600/50 hover:bg-red-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider mr-2">YETKİYİ AL</button>`;
            } else {
                actionBtns += `<button onclick="toggleAdminRole('${u.username}')" class="px-3 py-1 bg-blue-600/20 text-blue-500 border border-blue-600/50 hover:bg-blue-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider mr-2">ADMIN YAP</button>`;
            }
        }

        if (u.status !== 'rejected') {
            actionBtns += `<button onclick="rejectUser('${u.username}')" class="px-3 py-1 bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider">REDDET / BANLA</button>`;
        }

        item.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded bg-black/50 border border-gray-700 flex items-center justify-center text-xl text-neonPrimary">
                    <i class="fas fa-user-astronaut"></i>
                </div>
                <div>
                    <div class="font-bold text-white flex items-center">${u.username} <div class="ml-3 flex gap-1">${statusBadge}${roleBadge}</div></div>
                    <div class="text-xs text-gray-500 font-mono">${u.email}</div>
                </div>
            </div>
            <div class="flex gap-2">
                ${actionBtns}
            </div>
        `;
        list.appendChild(item);
    });
}

window.approveUser = function(username) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex > -1) {
        users[userIndex].status = 'approved';
        const adminName = currentUser ? currentUser.username : "Bilinmeyen Yetkili";
        
        addLog('USER_APPROVED', `Ajan ${username}, ${adminName} yetkilisi tarafından onaylandı.`, 'info');
        saveData();
        renderUsersList();
        showToast(`${username} adlı ajanın giriş izni onaylandı.`, 'success');
        
        sendWebhookNotification("✅ HESAP ONAYLANDI", `**${username}** kod adlı ajan, **${adminName}** yetkilisi tarafından onaylandı. Artık giriş yapabilir.`, 3066993);
    }
}

window.rejectUser = function(username) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex > -1) {
        users[userIndex].status = 'rejected';
        users[userIndex].isAdmin = false;
        const adminName = currentUser ? currentUser.username : "Bilinmeyen Yetkili";
        
        addLog('USER_REJECTED', `Ajan ${username}, ${adminName} yetkilisi tarafından reddedildi/yasaklandı.`, 'error');
        saveData();
        renderUsersList();
        showToast(`${username} adlı ajan reddedildi/yasaklandı.`, 'error');
        
        sendWebhookNotification("⛔ HESAP REDDEDİLDİ / YASAKLANDI", `**${username}** kod adlı ajan, **${adminName}** yetkilisi tarafından sistemden banlandı veya kaydı reddedildi.`, 16711680);
    }
}

window.toggleAdminRole = function(username) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex > -1) {
        users[userIndex].isAdmin = !users[userIndex].isAdmin;
        const roleStr = users[userIndex].isAdmin ? "ADMIN yetkisi verildi" : "ADMIN yetkisi alındı";
        addLog('ROLE_UPDATED', `Ajan ${username} için ${roleStr}. (Yapan: ${currentUser.username})`, 'warning');
        
        if (currentUser && currentUser.username === username) {
            currentUser.isAdmin = users[userIndex].isAdmin;
            updateAuthUI();
        }
        saveData();
        renderUsersList();
        showToast(`Yetki seviyesi güncellendi.`, 'success');
    }
}

// Content Management Logic
function renderPendingList() {
    const list = document.getElementById('pending-list');
    list.innerHTML = '';
    const pending = submissions.filter(s => s.status === 'pending');

    if (pending.length === 0) {
        list.innerHTML = `<div class="text-gray-500 italic p-4 border border-dashed border-gray-700 rounded font-mono">HAVUZ BOŞ</div>`;
        return;
    }

    pending.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'glass-panel p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center';
        
        let preview = sub.type === 'text' ? `"${sub.content}"` : `<a href="${sub.content}" target="_blank" class="text-blue-400 underline font-mono text-sm">VIEW_MEDIA <i class="fas fa-external-link-alt text-xs"></i></a>`;

        item.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-[10px] px-2 py-1 bg-yellow-900 text-yellow-400 rounded font-mono tracking-wider">${sub.type.toUpperCase()}</span>
                    <span class="text-xs font-bold text-gray-300 font-mono">AJAN: ${sub.author}</span>
                </div>
                <div class="text-white font-cursive text-xl">${preview}</div>
            </div>
            <div class="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button onclick="adminAction(${sub.id}, 'approve')" class="flex-1 sm:flex-none px-4 py-2 bg-purple-600/20 text-purple-500 border border-purple-600/50 hover:bg-purple-600 hover:text-white rounded transition-colors text-xs font-bold tracking-widest"><i class="fas fa-check mr-2"></i>ONAY</button>
                <button onclick="adminAction(${sub.id}, 'reject')" class="flex-1 sm:flex-none px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white rounded transition-colors text-xs font-bold tracking-widest"><i class="fas fa-trash mr-2"></i>RED</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderActiveList() {
    const list = document.getElementById('active-list');
    list.innerHTML = '';
    const active = submissions.filter(s => s.status === 'approved');

    if (active.length === 0) {
        list.innerHTML = `<div class="text-gray-500 italic p-4 border border-dashed border-gray-700 rounded font-mono">VERİ YOK</div>`;
        return;
    }

    active.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'glass-panel p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center';
        
        let preview = sub.type === 'text' ? `"${sub.content.substring(0, 60)}${sub.content.length > 60 ? '...' : ''}"` : `<a href="${sub.content}" target="_blank" class="text-blue-400 underline font-mono text-sm">VIEW_MEDIA <i class="fas fa-external-link-alt text-xs"></i></a>`;

        item.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-[10px] px-2 py-1 bg-purple-900 text-purple-400 rounded font-mono tracking-wider">${sub.type.toUpperCase()}</span>
                    <span class="text-xs font-bold text-gray-400 font-mono">AJAN: ${sub.author}</span>
                </div>
                <div class="text-white text-md font-sans">${preview}</div>
            </div>
            <div class="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button onclick="adminAction(${sub.id}, 'delete')" class="flex-1 sm:flex-none px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white rounded transition-colors text-xs font-bold tracking-widest"><i class="fas fa-trash mr-2"></i>SİL</button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.adminAction = function(id, action) {
    const subIndex = submissions.findIndex(s => s.id === id);
    if (subIndex === -1) return;

    const subInfo = submissions[subIndex].content.substring(0,20) + '...';

    if (action === 'approve') {
        submissions[subIndex].status = 'approved';
        addLog('CONTENT_APPROVED', `İçerik onaylandı: ${subInfo} (Yapan: ${currentUser.username})`, 'info');
        showToast('Veri onaylandı ve sisteme işlendi.', 'success');
    } else if (action === 'reject' || action === 'delete') {
        submissions.splice(subIndex, 1);
        addLog(action === 'reject' ? 'CONTENT_REJECTED' : 'CONTENT_DELETED', `İçerik silindi: ${subInfo} (Yapan: ${currentUser.username})`, 'warning');
        showToast(action === 'reject' ? 'Veri reddedildi ve yok edildi.' : 'Aktif veri silindi.', 'error');
    }
    
    saveData();
    renderPendingList();
    renderActiveList();
}

// System Logs Logic
function renderLogs() {
    const list = document.getElementById('logs-list');
    if(!list) return;
    list.innerHTML = '';
    
    if (systemLogs.length === 0) {
        list.innerHTML = `<div class="text-gray-500 italic p-4 text-center">Henüz kaydedilmiş log bulunmuyor.</div>`;
        return;
    }

    systemLogs.forEach(log => {
        const item = document.createElement('div');
        
        let colorClass = 'text-blue-400';
        if (log.severity === 'warning') colorClass = 'text-yellow-400';
        if (log.severity === 'critical' || log.severity === 'error') colorClass = 'text-red-500';
        if (log.action.includes('SUCCESS') || log.action.includes('APPROVED')) colorClass = 'text-green-400';

        const d = new Date(log.timestamp);
        const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;

        item.className = 'border-b border-gray-800/50 pb-2 mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start';
        item.innerHTML = `
            <span class="text-gray-500 shrink-0">[${timeStr}]</span>
            <span class="${colorClass} font-bold shrink-0 w-32">${log.action}</span>
            <span class="text-gray-300 break-all">${log.details}</span>
        `;
        list.appendChild(item);
    });
}

window.clearLogs = function() {
    systemLogs = [];
    addLog('LOGS_CLEARED', `Admin ${currentUser ? currentUser.username : 'Unknown'} logları sildi.`, 'critical');
    renderLogs();
    showToast('Tüm geçmiş loglar temizlendi!', 'success');
}

// Admin Direct Add
document.getElementById('admin-add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('admin-sub-type').value;
    const content = document.getElementById('admin-sub-content').value.trim();

    const newSub = {
        id: Date.now(),
        type,
        content,
        author: 'COMMANDER',
        status: 'approved',
        date: new Date().toISOString()
    };

    submissions.push(newSub);
    addLog('SYSTEM_BYPASS', `Bypass verisi eklendi. Tür: ${type}. Yapan: ${currentUser.username}`, 'critical');
    saveData();
    document.getElementById('admin-add-form').reset();
    showToast('Bypass verisi anında enjekte edildi!', 'success');
    renderActiveList();
});

// Discord Webhook Settings
document.getElementById('webhook-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('webhook-url-input').value.trim();
    discordWebhookUrl = url;
    localStorage.setItem('kavalci_webhook_url', discordWebhookUrl);
    addLog('SETTINGS_UPDATE', `Discord Webhook URL güncellendi. Yapan: ${currentUser.username}`, 'warning');
    showToast('Discord Webhook URL başarıyla güncellendi.', 'success');
});

// Send Discord Notification
function sendWebhookNotification(title, description, color = 65416) {
    if (!discordWebhookUrl) return;

    const payload = {
        content: null,
        embeds: [
            {
                title: title,
                description: description,
                color: color,
                timestamp: new Date().toISOString()
            }
        ]
    };

    fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(err => console.error('Webhook Error:', err));
}

// Interactive Spotlight / Tilt Effects
document.addEventListener('mousemove', (e) => {
    // Spotlight effect for cards and panels
    document.querySelectorAll('.glass-panel, .kavalci-card').forEach(panel => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panel.style.setProperty('--mouse-x', `${x}px`);
        panel.style.setProperty('--mouse-y', `${y}px`);
        if(!panel.classList.contains('mouse-glow')) panel.classList.add('mouse-glow');
    });

    // 3D Parallax effect for the hero text
    const text = document.querySelector('.interactive-text');
    if (text) {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px tilt
        const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
        text.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
});

// Run
init();
