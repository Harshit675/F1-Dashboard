// ==========================================================================
// 1. F1 TEAMS DATABASE CONFIGURATION (2026 GRID 100% ACCURATE)
// ==========================================================================
const F1_TEAMS_DATA = {
    "Ferrari": { name: "Scuderia Ferrari", color: "linear-gradient(135deg, rgba(220, 0, 0, 0.4), rgba(50, 0, 0, 0.6))", races: 1110, wins: 248, podiums: 820, drivers: "Charles Leclerc & Lewis Hamilton" },
    "Red Bull": { name: "Red Bull Racing", color: "linear-gradient(135deg, rgba(6, 0, 238, 0.4), rgba(0, 20, 50, 0.6))", races: 390, wins: 120, podiums: 265, drivers: "Max Verstappen & Isack Hadjar" }, 
    "Mercedes": { name: "Mercedes-AMG Petronas", color: "linear-gradient(135deg, rgba(0, 210, 190, 0.4), rgba(10, 30, 30, 0.6))", races: 310, wins: 125, podiums: 295, drivers: "George Russell & Kimi Antonelli" },
    "McLaren": { name: "McLaren F1 Team", color: "linear-gradient(135deg, rgba(255, 135, 0, 0.4), rgba(50, 25, 0, 0.6))", races: 980, wins: 190, podiums: 510, drivers: "Lando Norris & Oscar Piastri" },
    "Aston Martin": { name: "Aston Martin F1 Team", color: "linear-gradient(135deg, rgba(0, 111, 98, 0.4), rgba(0, 30, 25, 0.6))", races: 80, wins: 0, podiums: 9, drivers: "Fernando Alonso & Lance Stroll" },
    "Alpine": { name: "Alpine F1 Team", color: "linear-gradient(135deg, rgba(0, 140, 255, 0.4), rgba(0, 30, 60, 0.6))", races: 100, wins: 1, podiums: 7, drivers: "Pierre Gasly & Franco Colapinto" },
    "Williams": { name: "Williams Racing", color: "linear-gradient(135deg, rgba(0, 90, 255, 0.4), rgba(0, 10, 40, 0.6))", races: 830, wins: 114, podiums: 313, drivers: "Alex Albon & Carlos Sainz" },
    "Haas": { name: "Haas F1 Team", color: "linear-gradient(135deg, rgba(180, 180, 180, 0.4), rgba(30, 30, 30, 0.6))", races: 190, wins: 0, podiums: 0, drivers: "Esteban Ocon & Oliver Bearman" },
    "RB": { name: "Visa Cash App RB", color: "linear-gradient(135deg, rgba(30, 65, 255, 0.4), rgba(10, 20, 50, 0.6))", races: 390, wins: 2, podiums: 5, drivers: "Liam Lawson & Arvid Lindblad" },
    "Audi": { name: "Audi F1 Team", color: "linear-gradient(135deg, rgba(200, 0, 0, 0.4), rgba(30, 30, 30, 0.6))", races: 0, wins: 0, podiums: 0, drivers: "Nico Hulkenberg & Gabriel Bortoleto" }
};

// ==========================================================================
// 2. DOM INITIALIZATION & EVENT HANDLERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    const enterBtn = document.getElementById('enter-btn');

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            const savedUser = localStorage.getItem('f1_user_profile');
            if (!savedUser) {
                showOnboardingPrompt(() => {
                    executeDashboardEntry(welcomeScreen, dashboardContent);
                });
            } else {
                loadUserHeaderData();
                executeDashboardEntry(welcomeScreen, dashboardContent);
            }
        });
    }

    setupTeamCardModal();
    setupSettingsModal();
    setupCreditsPage();
});

// ==========================================================================
// 3. CORE FUNCTIONS
// ==========================================================================

function executeDashboardEntry(welcomeScreen, dashboardContent) {
    if (typeof gsap !== 'undefined') {
        dashboardContent.classList.add('dashboard-smooth-init');
        gsap.set(dashboardContent, { display: 'block', opacity: 0, scale: 0.92, y: 20 });

        const tl = gsap.timeline();
        tl.to(welcomeScreen, {
            opacity: 0, scale: 1.03, duration: 0.6, ease: 'power2.inOut',
            onComplete: () => { welcomeScreen.style.display = 'none'; }
        })
        .to(dashboardContent, {
            opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out',
            onComplete: () => { dashboardContent.classList.remove('dashboard-smooth-init'); }
        }, "-=0.4");
    } else {
        welcomeScreen.style.display = 'none';
        dashboardContent.style.display = 'block';
    }
}

function showOnboardingPrompt(onComplete) {
    const existing = document.querySelector('.onboarding-overlay');
    if (existing) existing.remove();

    // Pull current data for pre-filling when editing via settings
    const savedData = JSON.parse(localStorage.getItem('f1_user_profile')) || {};
    const currentName = savedData.name || '';
    const currentAge = savedData.age || '';
    const currentTeam = savedData.team || '';

    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-card glass-panel" style="background: rgba(20, 20, 20, 0.95); border: 1px solid rgba(238, 9, 9, 0.4); padding: 30px; border-radius: 12px; width: 400px; text-align: center; font-family: 'Orbitron', sans-serif; color: white;">
            <h2>Driver Setup</h2>
            <p style="font-size:0.8rem; margin-bottom:15px; color:#aaa;">Configure your pit profile for the 2026 season.</p>
            
            <input type="text" id="setup-name" placeholder="Enter Your Name (Optional)" value="${currentName}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); color:white; border-radius:6px;" />
            <input type="number" id="setup-age" placeholder="Enter Your Age (Optional)" value="${currentAge}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); color:white; border-radius:6px;" />
            
            <select id="setup-team" style="width:100%; padding:12px; margin-bottom:15px; background:#111; border:1px solid rgba(255,255,255,0.2); color:white; border-radius:6px;">
                <option value="" disabled ${!currentTeam ? 'selected' : ''}>Select Favorite Team</option>
                ${Object.keys(F1_TEAMS_DATA).map(team => `<option value="${team}" ${currentTeam === team ? 'selected' : ''}>${team}</option>`).join('')}
            </select>
            
            <button id="save-profile-btn" style="background:#ee0909; border:none; color:white; padding:12px; width:100%; border-radius:6px; cursor:pointer; font-weight:bold; font-family:inherit;">CONFIRM & ENTER</button>
        </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('save-profile-btn').addEventListener('click', () => {
        // Name and age are now optional; default if left blank
        const name = document.getElementById('setup-name').value.trim() || 'Driver';
        const age = document.getElementById('setup-age').value.trim() || '--';
        const team = document.getElementById('setup-team').value;

        // Only team selection is compulsory
        if (!team) {
            alert('Please select your Favorite Team to continue.');
            return;
        }

        const userData = { name, age, team };
        localStorage.setItem('f1_user_profile', JSON.stringify(userData));
        
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        
        loadUserHeaderData();
        if (onComplete) onComplete();
    });
}

function loadUserHeaderData() {
    const data = JSON.parse(localStorage.getItem('f1_user_profile'));
    if (!data) return;

    const welcomeText = document.getElementById('welcome-user-text');
    const viewCardBtn = document.getElementById('view-team-card-btn');

    if (welcomeText) {
        welcomeText.textContent = `Hi ${data.name}, welcome to the ${data.team} dashboard`;
    }
    
    if (viewCardBtn) {
        viewCardBtn.style.display = 'inline-flex';
    }
}

function setupTeamCardModal() {
    const btn = document.getElementById('view-team-card-btn');
    const modal = document.getElementById('team-card-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
        const data = JSON.parse(localStorage.getItem('f1_user_profile'));
        if (!data || !F1_TEAMS_DATA[data.team]) return;

        const teamInfo = F1_TEAMS_DATA[data.team];
        document.getElementById('modal-team-name').textContent = teamInfo.name;
        document.getElementById('modal-team-tagline').textContent = `Official ${data.team} Constructor Overview`;
        document.getElementById('stat-races').textContent = teamInfo.races;
        document.getElementById('stat-wins').textContent = teamInfo.wins;
        document.getElementById('stat-podiums').textContent = teamInfo.podiums;
        document.getElementById('stat-drivers').textContent = teamInfo.drivers;
        document.getElementById('team-modal-theme').style.background = teamInfo.color;

        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('active'));
    });

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) return;
    
    settingsBtn.addEventListener('click', () => {
        showOnboardingPrompt(() => {
            loadUserHeaderData();
        });
    });
}

function setupCreditsPage() {
    const showBtn = document.getElementById('show-credits-btn');
    const closeBtn = document.getElementById('close-credits-btn');
    const creditsPage = document.getElementById('credits-page');

    if (!showBtn || !closeBtn || !creditsPage) return;

    showBtn.addEventListener('click', () => {
        creditsPage.style.display = 'flex';
        requestAnimationFrame(() => creditsPage.classList.add('active'));
    });

    const closeCredits = () => {
        creditsPage.classList.remove('active');
        setTimeout(() => { creditsPage.style.display = 'none'; }, 300);
    };

    closeBtn.addEventListener('click', closeCredits);
    
    creditsPage.addEventListener('click', (e) => { 
        if (e.target === creditsPage) closeCredits(); 
    });
}

function transitionRaceData(updateDataCallback) {
    const raceDisplay = document.querySelector('.race-display');

    if (typeof gsap !== 'undefined' && raceDisplay) {
        gsap.to(raceDisplay, {
            opacity: 0, y: 15, duration: 0.25, ease: 'power2.in',
            onComplete: () => {
                updateDataCallback();
                gsap.fromTo(raceDisplay, 
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
                );
            }
        });
    } else {
        updateDataCallback();
    }
}