let currentYear = '2026';

/* ==========================================
   1. LIVE TELEMETRY (LEFT SIDEBAR - DRIVERS ONLY)
   ========================================== */
async function fetchSeasonStandings(year) {
    try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`); 
        const data = await response.json();
        
        const tableBody = document.getElementById('standings-body');
        
        // Safety Check: If season hasn't started yet
        if (!data.MRData.StandingsTable.StandingsLists || data.MRData.StandingsTable.StandingsLists.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No standings yet.</td></tr>`;
            return;
        }

        const drivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        tableBody.innerHTML = ""; 
        
        // Loop through the entire grid to populate driver standings
        drivers.forEach(driverData => {
            let driverName = driverData.Driver.givenName.charAt(0) + ". " + driverData.Driver.familyName;
            
            let row = `
                <tr>
                    <td>${driverData.position}</td>
                    <td>${driverName}</td>
                    <td class="points">${driverData.points}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Telemetry lost.", error);
    }
}

/* ==========================================
   2. DYNAMIC SEASON LOADER
   ========================================== */
async function loadSeason(year) {
    currentYear = year;
    
    // 1. Update the left sidebar for the new year
    fetchSeasonStandings(year);
    document.getElementById('sidebar-title').innerText = `${year} Season Standings`;

    // 2. Fetch the full race schedule for the year
    try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        
        const tabsContainer = document.getElementById('race-tabs');
        tabsContainer.innerHTML = ""; // Wipe old tabs
        
        // 3. Build a tab for every single race in the schedule
        races.forEach(race => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.innerText = race.raceName.replace('Grand Prix', 'GP').toUpperCase();
            
            // Attach the click event to load this specific race
            btn.onclick = () => loadRaceResults(race, btn);
            
            tabsContainer.appendChild(btn);
        });

        // Auto-click the first race of the season so the screen isn't blank
        if (tabsContainer.firstChild) {
            tabsContainer.firstChild.click();
        }

    } catch (error) {
        console.error("Could not load season schedule:", error);
    }
}

/* ==========================================
   3. SPECIFIC RACE RESULTS (MAIN PANEL)
   ========================================== */
async function loadRaceResults(raceInfo, clickedButton) {
    document.getElementById('race-title').innerText = raceInfo.raceName;
    
    // Format the date beautifully (e.g., "Sun, 5 Jul")
    let raceDate = new Date(raceInfo.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    document.getElementById('race-date').innerText = raceDate;
    document.getElementById('race-track').innerText = raceInfo.Circuit.circuitName;
    
    // --- AUTOMATED YOUTUBE SEARCH LOGIC ---
    const searchQuery = `F1 ${currentYear} ${raceInfo.raceName} Highlights`;
    const urlSafeQuery = encodeURIComponent(searchQuery);
    
    const youtubeLink = document.getElementById('youtube-link');
    if (youtubeLink) {
        youtubeLink.href = `https://www.youtube.com/results?search_query=${urlSafeQuery}`;
    }
    // --------------------------------------

    // Highlight active button
    if (clickedButton) {
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    // Fetch grid results for this exact year and round
    try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${currentYear}/${raceInfo.round}/results.json`);
        const data = await response.json();
        
        const tbody = document.getElementById('results-body');
        tbody.innerHTML = ""; 

        // Safety Net
        if (!data.MRData.RaceTable.Races || data.MRData.RaceTable.Races.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Race results not yet available.</td></tr>`;
            return; 
        }

        const results = data.MRData.RaceTable.Races[0].Results;

        results.forEach(driverRow => {
            let driverName = driverRow.Driver.givenName.charAt(0) + ". " + driverRow.Driver.familyName;
            let displayTime = driverRow.Time ? driverRow.Time.time : driverRow.status;

            let tableRow = `
                <tr>
                    <td>${driverRow.position}</td>
                    <td>${driverName}</td>
                    <td>${driverRow.Constructor.name}</td>
                    <td>${displayTime}</td>
                    <td class="points">${driverRow.points}</td>
                </tr>
            `;
            tbody.innerHTML += tableRow;
        });
    } catch (error) {
        console.error("Could not fetch race grid:", error);
    }
}

/* ==========================================
   4. IGNITION SEQUENCE
   ========================================== */
window.onload = () => {
    const yearSelect = document.getElementById('year-select');
    const startingYear = yearSelect ? yearSelect.value : '2026';
    loadSeason(startingYear); 
};