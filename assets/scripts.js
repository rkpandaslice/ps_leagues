        <button type="button" class="btn btn-danger" onclick="removeCustomParameter(this)" style="flex: none;" title="Remove parameter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    container.appendChild(paramDiv);
    
    // Focus on the first input
    paramDiv.querySelector('.param-name').focus();
    
    // Add animation
    paramDiv.style.opacity = '0';
    paramDiv.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        paramDiv.style.transition = 'all 0.3s ease';
        paramDiv.style.opacity = '1';
        paramDiv.style.transform = 'translateY(0)';
    }, 10);
}

function removeCustomParameter(button) {
    const paramDiv = button.parentElement;
    
    // Add exit animation
    paramDiv.style.transition = 'all 0.3s ease';
    paramDiv.style.opacity = '0';
    paramDiv.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        paramDiv.remove();
    }, 300);
}

// ===== LEAGUE CONFIGURATION =====
function saveLeagueConfig() {
    // Validate required fields
    const requiredFields = {
        'league-name': 'League name',
        'sport-type': 'Sport type',
        'season-start': 'Season start date',
        'num-teams': 'Number of teams'
    };
    
    let isValid = true;
    Object.entries(requiredFields).forEach(([fieldId, fieldName]) => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showFieldError(field, `${fieldName} is required`);
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const config = {
        leagueName: document.getElementById('league-name').value.trim(),
        sportType: document.getElementById('sport-type').value,
        customSport: document.getElementById('custom-sport').value.trim(),
        seasonStart: document.getElementById('season-start').value,
        seasonEnd: document.getElementById('season-end').value,
        numTeams: parseInt(document.getElementById('num-teams').value),
        playersPerTeam: parseInt(document.getElementById('players-per-team').value) || null,
        scheduleType: document.getElementById('schedule-type').value,
        numRounds: parseInt(document.getElementById('num-rounds').value) || null,
        matchDuration: parseInt(document.getElementById('match-duration').value) || null,
        breakDuration: parseInt(document.getElementById('break-duration').value) || null,
        startTime: document.getElementById('start-time').value,
        numVenues: parseInt(document.getElementById('num-venues').value) || 1,
        gameDays: getSelectedGameDays()
    };

    // Additional validation
    if (config.numTeams < 2) {
        showMessage('League must have at least 2 teams', 'error');
        return;
    }
    
    if (config.seasonEnd && new Date(config.seasonEnd) <= new Date(config.seasonStart)) {
        showMessage('Season end date must be after start date', 'error');
        return;
    }

    // Collect custom parameters
    const customParams = [];
    document.querySelectorAll('.custom-param').forEach(param => {
        const name = param.querySelector('.param-name').value.trim();
        const value = param.querySelector('.param-value').value.trim();
        if (name && value) {
            customParams.push({ name, value });
        }
    });

    leagueData.config = config;
    leagueData.customParameters = customParams;

    showConfigSummary();
    showMessage('League configuration saved successfully!', 'success');
    
    // Show the create page button
    document.getElementById('create-page-btn').style.display = 'inline-flex';
    
    // Save to localStorage for persistence
    saveLeagueToStorage();
}

function getSelectedGameDays() {
    const days = [];
    const dayCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="day-"]');
    dayCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            days.push(checkbox.value);
        }
    });
    return days;
}

function showConfigSummary() {
    const config = leagueData.config;
    const summaryContent = document.getElementById('summary-content');
    
    let sportDisplay = config.sportType;
    if (config.sportType === 'custom') {
        sportDisplay = config.customSport;
    }

    summaryContent.innerHTML = `
        <div class="summary-item">
            <div class="summary-value">${config.leagueName}</div>
            <div class="summary-label">League Name</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${sportDisplay}</div>
            <div class="summary-label">Sport</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${config.numTeams}</div>
            <div class="summary-label">Teams</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${config.scheduleType.replace('-', ' ')}</div>
            <div class="summary-label">Format</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${config.gameDays.length || 'Any'}</div>
            <div class="summary-label">Game Days</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${config.numVenues}</div>
            <div class="summary-label">Venues</div>
        </div>
    `;

    showElement('config-summary');
}

// ===== LEAGUE PAGE GENERATION =====
function createLeaguePage() {
    if (!leagueData.config.leagueName) {
        showMessage('Please save league configuration first', 'error');
        return;
    }

    const pageSlug = generatePageSlug(leagueData.config.leagueName);
    const leaguePageData = {
        config: leagueData.config,
        teams: leagueData.teams,
        schedule: leagueData.schedule,
        customParameters: leagueData.customParameters,
        pageSlug: pageSlug,
        createdDate: new Date().toISOString()
    };

    // Store the league data
    localStorage.setItem(`league_${pageSlug}`, JSON.stringify(leaguePageData));
    
    // Generate the league page HTML
    const leaguePageHtml = generateLeaguePageHtml(leaguePageData);
    
    // Create a new window/tab with the league page
    const newWindow = window.open('', '_blank');
    newWindow.document.write(leaguePageHtml);
    newWindow.document.close();
    
    // Update the URL to reflect the league page
    const newUrl = `${window.location.origin}${window.location.pathname.replace('league_scheduler_tool.html', '')}${pageSlug}`;
    
    showMessage(`League page created! URL: /${pageSlug}`, 'success');
    
    // Show the URL in a modal
    showLeaguePageModal(pageSlug, newUrl);
    
    // Track page creation
    trackLeaguePageCreation(pageSlug);
}

function generatePageSlug(leagueName) {
    return leagueName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .substring(0, 50); // Limit length
}

function generateLeaguePageHtml(leagueData) {
    const config = leagueData.config;
    const sportDisplay = config.sportType === 'custom' ? config.customSport : config.sportType;
    const startDate = new Date(config.seasonStart).toLocaleDateString();
    const endDate = config.seasonEnd ? new Date(config.seasonEnd).toLocaleDateString() : 'TBD';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.leagueName} - League Portal</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>">
    <meta name="description" content="${config.leagueName} - ${sportDisplay} league with ${leagueData.teams.length} teams and ${leagueData.schedule.length} matches.">
    <style>
        /* Embedded CSS for league portal */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #1a1a1a;
            line-height: 1.6;
        }
        .hero-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 60px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .hero-title {
            font-size: 3rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 16px;
            animation: slideInUp 0.8s ease-out;
        }
        .hero-subtitle {
            font-size: 1.25rem;
            color: #666;
            margin-bottom: 32px;
            animation: slideInUp 0.8s ease-out 0.2s both;
        }
        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 48px;
            flex-wrap: wrap;
            animation: slideInUp 0.8s ease-out 0.4s both;
        }
        .stat-item { text-align: center; }
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            display: block;
        }
        .stat-label {
            font-size: 0.875rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .nav-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 32px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 16px;
        }
        .nav-tab {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #666;
        }
        .nav-tab.active {
            background: #ffffff;
            color: #1a1a1a;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .content-section { display: none; }
        .content-section.active { display: block; animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        .team-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }
        .team-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        .team-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        .team-details {
            color: #666;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .schedule-item {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
        }
        .schedule-item:hover {
            transform: translateX(8px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .match-teams {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        .match-vs {
            color: #667eea;
            margin: 0 12px;
            font-weight: 600;
        }
        .match-meta {
            color: #666;
            font-size: 0.875rem;
        }
        .empty-state {
            text-align: center;
            padding: 64px 32px;
            color: rgba(255, 255, 255, 0.8);
        }
        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 8px;
            color: #ffffff;
        }
        @media (max-width: 768px) {
            .hero-title { font-size: 2rem; }
            .hero-stats { gap: 24px; }
            .schedule-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="hero-section">
        <h1 class="hero-title">${config.leagueName}</h1>
        <p class="hero-subtitle">${sportDisplay} League • ${startDate} - ${endDate}</p>
        <div class="hero-stats">
            <div class="stat-item">
                <span class="stat-value">${leagueData.teams.length}</span>
                <span class="stat-label">Teams</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${leagueData.schedule.length}</span>
                <span class="stat-label">Matches</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${config.numVenues || 1}</span>
                <span class="stat-label">Venues</span>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('overview')">Overview</button>
            <button class="nav-tab" onclick="showTab('teams')">Teams</button>
            <button class="nav-tab" onclick="showTab('schedule')">Schedule</button>
        </div>

        <div id="overview" class="content-section active">
            <div class="card">
                <h2 class="card-title">League Information</h2>
                <p><strong>Schedule Type:</strong> ${config.scheduleType.replace('-', ' ')}</p>
                <p><strong>Match Duration:</strong> ${config.matchDuration || 'TBD'} minutes</p>
                <p><strong>Start Time:</strong> ${config.startTime || 'TBD'}</p>
                <p><strong>Game Days:</strong> ${config.gameDays?.join(', ') || 'Any day'}</p>
                ${leagueData.customParameters.length > 0 ? `
                <h3 style="margin-top: 32px; margin-bottom: 16px;">League Rules</h3>
                ${leagueData.customParameters.map(param => `
                    <p><strong>${param.name}:</strong> ${param.value}</p>
                `).join('')}
                ` : ''}
            </div>
        </div>

        <div id="teams" class="content-section">
            <div class="card">
                <h2 class="card-title">Teams (${leagueData.teams.length})</h2>
                ${leagueData.teams.length > 0 ? `
                <div class="team-grid">
                    ${leagueData.teams.map(team => `
                        <div class="team-card">
                            <div class="team-name">${team.name}</div>
                            <div class="team-details">
                                ${team.contact ? `<div><strong>Contact:</strong> ${team.contact}</div>` : ''}
                                ${team.email ? `<div><strong>Email:</strong> ${team.email}</div>` : ''}
                                ${team.phone ? `<div><strong>Phone:</strong> ${team.phone}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div class="empty-state">
                    <h3>No Teams Yet</h3>
                    <p>Teams will appear here once they're added</p>
                </div>
                `}
            </div>
        </div>

        <div id="schedule" class="content-section">
            <div class="card">
                <h2 class="card-title">Schedule (${leagueData.schedule.length} matches)</h2>
                ${leagueData.schedule.length > 0 ? `
                <div class="schedule-list">
                    ${leagueData.schedule.map(match => `
                        <div class="schedule-item">
                            <div>
                                <div class="match-teams">
                                    ${match.team1.name}<span class="match-vs">vs</span>${match.team2.name}
                                </div>
                                <div class="match-meta">
                                    ${new Date(match.date).toLocaleDateString()} at ${match.time} • ${match.venue}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div class="empty-state">
                    <h3>No Schedule Generated</h3>
                    <p>The schedule will appear here once generated</p>
                </div>
                `}
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
        }
    </script>
</body>
</html>`;
}

function showLeaguePageModal(pageSlug, fullUrl) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(4px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
        text-align: center;
        animation: modalSlideIn 0.4s ease-out;
    `;

    modal.innerHTML = `
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
        </div>
        <h2 style="color: #1a1a1a; margin-bottom: 16px; font-size: 24px; font-weight: 700;">League Page Created!</h2>
        <p style="color: #666; margin-bottom: 24px; font-size: 16px; line-height: 1.5;">
            Your professional league portal is now live and accessible at:
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 2px dashed #e5e7eb;">
            <code style="color: #667eea; font-weight: 600; font-size: 16px; word-break: break-all;">/${pageSlug}</code>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button onclick="copyLeagueUrl('${pageSlug}')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                Copy URL
            </button>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: #f3f4f6; color: #374151; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                Close
            </button>
        </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    overlay.appendChild(modal);
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    // Close modal when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Clean up styles when modal is closed
    setTimeout(() => {
        style.remove();
    }, 5000);
}

function copyLeagueUrl(pageSlug) {
    const url = `${window.location.origin}${window.location.pathname.replace('league_scheduler_tool.html', '')}${pageSlug}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showMessage('League URL copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyText(url);
        });
    } else {
        fallbackCopyText(url);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showMessage('League URL copied to clipboard!', 'success');
    } catch (err) {
        showMessage('Could not copy URL. Please copy manually: ' + text, 'warning');
    }
    document.body.removeChild(textArea);
}

// ===== LEAGUE MANAGEMENT =====
function getExistingLeagues() {
    const leagues = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('league_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                leagues.push({
                    slug: key.replace('league_', ''),
                    name: data.config.leagueName,
                    sport: data.config.sportType === 'custom' ? data.config.customSport : data.config.sportType,
                    teams: data.teams?.length || 0,
                    matches: data.schedule?.length || 0,
                    created: data.createdDate
                });
            } catch (e) {
                console.error('Error parsing league data:', e);
            }
        }
    }
    return leagues.sort((a, b) => new Date(b.created) - new Date(a.created));
}

function showLeagueManager() {
    const existingLeagues = getExistingLeagues();
    
    if (existingLeagues.length === 0) {
        showMessage('No existing leagues found. Create your first league!', 'warning');
        return;
    }
    
    // Create league manager modal (implementation would be here)
    console.log('League Manager:', existingLeagues);
    showMessage('League manager feature - check console for leagues', 'success');
}

function createLeagueManagerButton() {
    const navMenu = document.querySelector('.nav-menu');
    const managerButton = document.createElement('button');
    managerButton.className = 'nav-item';
    managerButton.onclick = showLeagueManager;
    managerButton.innerHTML = `
        <div class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3z"></path>
                <path d="M9 9h6v6H9z"></path>
            </svg>
        </div>
        <span class="nav-text">My Leagues</span>
    `;
    navMenu.appendChild(managerButton);
}

// ===== TEAM MANAGEMENT =====
function generateTeamCustomFields() {
    const container = document.getElementById('team-custom-fields');
    const config = leagueData.config;
    
    container.innerHTML = '';
    
    if (config.playersPerTeam) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label class="form-label">Number of Players (Max: ${config.playersPerTeam})</label>
            <input type="number" class="form-input" id="team-players" min="1" max="${config.playersPerTeam}" placeholder="Current roster size">
        `;
        container.appendChild(div);
    }

    // Add fields for custom parameters related to teams
    leagueData.customParameters.forEach((param, index) => {
        if (param.name.toLowerCase().includes('team')) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label class="form-label">${param.name}</label>
                <input type="text" class="form-input" id="custom-team-${index}" placeholder="${param.value}">
            `;
            container.appendChild(div);
        }
    });
}

function addTeam() {
    const name = document.getElementById('team-name').value.trim();
    const contact = document.getElementById('team-contact').value.trim();
    const email = document.getElementById('team-email').value.trim();
    const phone = document.getElementById('team-phone').value.trim();

    if (!name) {
        showMessage('Team name is required', 'error');
        document.getElementById('team-name').focus();
        return;
    }

    // Check for duplicate team names
    if (leagueData.teams.some(team => team.name.toLowerCase() === name.toLowerCase())) {
        showMessage('A team with this name already exists', 'error');
        document.getElementById('team-name').focus();
        return;
    }

    if (leagueData.teams.length >= leagueData.config.numTeams) {
        showMessage(`Maximum number of teams (${leagueData.config.numTeams}) reached`, 'error');
        return;
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        document.getElementById('team-email').focus();
        return;
    }

    const team = {
        id: Date.now(),
        name,
        contact,
        email,
        phone,
        players: document.getElementById('team-players') ? parseInt(document.getElementById('team-players').value) || 0 : 0,
        customFields: {}
    };

    // Collect custom field values
    leagueData.customParameters.forEach((param, index) => {
        const field = document.getElementById(`custom-team-${index}`);
        if (field) {
            team.customFields[param.name] = field.value.trim();
        }
    });

    leagueData.teams.push(team);
    updateTeamsList();
    clearTeamForm();
    showMessage('Team added successfully!', 'success');
    
    // Save to localStorage
    saveLeagueToStorage();
}

function generateSampleTeams() {
    const numTeams = leagueData.config.numTeams;
    const existingTeams = leagueData.teams.length;
    const teamsToGenerate = numTeams - existingTeams;

    if (teamsToGenerate <= 0) {
        showMessage('All team slots are filled', 'error');
        return;
    }

    const sampleNames = [
        'Thunder Bolts', 'Lightning Strikes', 'Storm Chasers', 'Fire Dragons',
        'Ice Wolves', 'Golden Eagles', 'Silver Sharks', 'Red Hawks',
        'Blue Waves', 'Green Machine', 'Purple Power', 'Orange Crush',
        'Black Panthers', 'White Tigers', 'Iron Lions', 'Steel Stallions',
        'Rocket Racers', 'Comet Crushers', 'Star Strikers', 'Galaxy Guardians',
        'Neon Knights', 'Cyber Cyclones', 'Plasma Pirates', 'Quantum Quakes'
    ];

    for (let i = 0; i < teamsToGenerate; i++) {
        const teamName = sampleNames[existingTeams + i] || `Team ${existingTeams + i + 1}`;
        const team = {
            id: Date.now() + i,
            name: teamName,
            contact: `Captain ${existingTeams + i + 1}`,
            email: `${teamName.toLowerCase().replace(/\s+/g, '')}@example.com`,
            phone: `(555) ${String(123 + i).padStart(3, '0')}-${String(4567 + i).padStart(4, '0')}`,
            players: leagueData.config.playersPerTeam || Math.floor(Math.random() * 10) + 5,
            customFields: {}
        };

        leagueData.teams.push(team);
    }

    updateTeamsList();
    showMessage(`Generated ${teamsToGenerate} sample teams!`, 'success');
    
    // Save to localStorage
    saveLeagueToStorage();
}

function updateTeamsList() {
    const container = document.getElementById('teams-list');
    
    if (leagueData.teams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Teams Added</h3>
                <p>Add your first team to get started with the league</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Registered Teams (${leagueData.teams.length}/${leagueData.config.numTeams})</h3>
            </div>
            <div class="card-body" style="padding: 0;">
    `;
    
    leagueData.teams.forEach((team, index) => {
        html += `
            <div class="team-item" style="margin: 0; border-radius: 0; ${index === leagueData.teams.length - 1 ? '' : 'border-bottom: 1px solid #e5e5e5;'}">
                <div class="team-info">
                    <h4>${team.name}</h4>
                    <p>
                        ${team.contact ? `Contact: ${team.contact}` : ''} 
                        ${team.contact && (team.email || team.phone) ? ' | ' : ''}
                        ${team.email ? `Email: ${team.email}` : ''} 
                        ${team.email && team.phone ? ' | ' : ''}
                        ${team.phone ? `Phone: ${team.phone}` : ''}
                        ${team.players ? ` | Players: ${team.players}` : ''}
                    </p>
                </div>
                <button class="btn btn-danger" onclick="removeTeam(${team.id})" title="Remove team">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                </button>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function removeTeam(teamId) {
    const team = leagueData.teams.find(t => t.id === teamId);
    if (!team) return;
    
    if (confirm(`Are you sure you want to remove "${team.name}" from the league?`)) {
        leagueData.teams = leagueData.teams.filter(team => team.id !== teamId);
        updateTeamsList();
        showMessage('Team removed successfully!', 'success');
        
        // Clear schedule if it exists (teams changed)
        if (leagueData.schedule.length > 0) {
            leagueData.schedule = [];
            showMessage('Schedule cleared due to team changes. Please regenerate.', 'warning');
        }
        
        saveLeagueToStorage();
    }
}

function clearTeamForm() {
    const fields = ['team-name', 'team-contact', 'team-email', 'team-phone'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const playersField = document.getElementById('team-players');
    if (playersField) playersField.value = '';

    // Clear custom fields
    leagueData.customParameters.forEach((param, index) => {
        const field = document.getElementById(`custom-team-${index}`);
        if (field) field.value = '';
    });
    
    // Focus on team name for next entry
    document.getElementById('team-name').focus();
}

// ===== SCHEDULE GENERATION =====
function populateVenueDefaults() {
    const venueField = document.getElementById('venue-names');
    if (!venueField.value.trim()) {
        const numVenues = leagueData.config.numVenues || 1;
        const defaultVenues = [];
        
        for (let i = 1; i <= numVenues; i++) {
            defaultVenues.push(numVenues === 1 ? 'Main Court' : `Court ${i}`);
        }
        
        venueField.value = defaultVenues.join('\n');
    }
}

function generateSchedule() {
    if (leagueData.teams.length < 2) {
        showMessage('Need at least 2 teams to generate a schedule', 'error');
        return;
    }

    const venues = getVenueList();
    const schedule = [];

    try {
        switch (leagueData.config.scheduleType) {
            case 'round-robin':
                schedule.push(...generateRoundRobin(leagueData.teams, venues, 1));
                break;
            case 'double-round-robin':
                schedule.push(...generateRoundRobin(leagueData.teams, venues, 2));
                break;
            case 'single-elimination':
                schedule.push(...generateElimination(leagueData.teams, venues, false));
                break;
            case 'double-elimination':
                schedule.push(...generateElimination(leagueData.teams, venues, true));
                break;
            case 'custom-rounds':
                const rounds = leagueData.config.numRounds || 1;
                schedule.push(...generateRoundRobin(leagueData.teams, venues, rounds));
                break;
            default:
                throw new Error('Invalid schedule type');
        }

        leagueData.schedule = schedule;
        displaySchedule();
        showMessage(`Schedule generated successfully! ${schedule.length} matches created.`, 'success');
        
        saveLeagueToStorage();
    } catch (error) {
        console.error('Schedule generation error:', error);
        showMessage('Error generating schedule. Please check your configuration.', 'error');
    }
}

function getVenueList() {
    const venueText = document.getElementById('venue-names').value.trim();
    const venues = venueText ? venueText.split('\n').map(v => v.trim()).filter(v => v) : [];
    
    if (venues.length === 0) {
        const numVenues = leagueData.config.numVenues || 1;
        for (let i = 1; i <= numVenues; i++) {
            venues.push(`Venue ${i}`);
        }
    }
    
    return venues;
}

function generateRoundRobin(teams, venues, rounds) {
    const matches = [];
    const startDate = new Date(leagueData.config.seasonStart);
    let currentDate = new Date(startDate);

    for (let round = 0; round < rounds; round++) {
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const match = {
                    id: matches.length + 1,
                    team1: teams[i],
                    team2: teams[j],
                    date: new Date(currentDate),
                    time: leagueData.config.startTime || '18:00',
                    venue: venues[matches.length % venues.length],
                    round: round + 1,
                    status: 'scheduled'
                };
                matches.push(match);

                currentDate = getNextGameDay(currentDate);
            }
        }
    }

    return matches;
}

function generateElimination(teams, venues, isDouble) {
    const matches = [];
    const startDate = new Date(leagueData.config.seasonStart);
    let currentDate = new Date(startDate);

    // Shuffle teams for random bracket
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    let currentRound = shuffledTeams;
    let roundNumber = 1;

    while (currentRound.length > 1) {
        const nextRound = [];
        
        for (let i = 0; i < currentRound.length; i += 2) {
            if (i + 1 < currentRound.length) {
                const match = {
                    id: matches.length + 1,
                    team1: currentRound[i],
                    team2: currentRound[i + 1],
                    date: new Date(currentDate),
                    time: leagueData.config.startTime || '18:00',
                    venue: venues[matches.length % venues.length],
                    round: roundNumber,
                    status: 'scheduled',
                    eliminationRound: getRoundName(currentRound.length)
                };
                matches.push(match);
                
                // Simulate winner for bracket progression
                nextRound.push(Math.random() > 0.5 ? currentRound[i] : currentRound[i + 1]);
                
                currentDate = getNextGameDay(currentDate);
            } else {
                // Bye to next round
                nextRound.push(currentRound[i]);
            }
        }
        
        currentRound = nextRound;
        roundNumber++;
    }

    return matches;
}

function getRoundName(teamsLeft) {
    if (teamsLeft <= 2) return 'Final';
    if (teamsLeft <= 4) return 'Semi-Final';
    if (teamsLeft <= 8) return 'Quarter-Final';
    if (teamsLeft <= 16) return 'Round of 16';
    return `Round of ${teamsLeft}`;
}

function getNextGameDay(currentDate) {
    const gameDays = leagueData.config.gameDays;
    
    if (!gameDays || gameDays.length === 0) {
        // If no specific days, advance by 2-3 days (configurable)
        currentDate.setDate(currentDate.getDate() + 2);
        return currentDate;
    }

    const dayMapping = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
    };

    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find next valid game day
    let attempts = 0;
    while (!gameDays.includes(Object.keys(dayMapping).find(key => dayMapping[key] === nextDate.getDay())) && attempts < 14) {
        nextDate.setDate(nextDate.getDate() + 1);
        attempts++;
    }

    return nextDate;
}

function displaySchedule() {
    const container = document.getElementById('schedule-preview');
    
    if (leagueData.schedule.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Schedule Generated</h3>
                <p>Generate a schedule to see matches here</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Generated Schedule (${leagueData.schedule.length} matches)</h3>
            </div>
            <div class="card-body" style="padding: 0;">
                <div class="schedule-list">
    `;

    leagueData.schedule.forEach((match, index) => {
        const dateStr = match.date.toLocaleDateString();
        const roundInfo = match.eliminationRound ? match.eliminationRound : `Round ${match.round}`;
        
        html += `
            <div class="match-item" style="margin: 0; border-radius: 0; ${index === leagueData.schedule.length - 1 ? '' : 'border-bottom: 1px solid #f3f4f6;'}">
                <div class="match-teams">
                    ${match.team1.name}<span class="match-vs">vs</span>${match.team2.name}
                </div>
                <div class="match-details">
                    ${dateStr} at ${match.time}<br>
                    ${match.venue} • ${roundInfo}
                </div>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function clearSchedule() {
    if (confirm('Are you sure you want to clear the current schedule? This action cannot be undone.')) {
        leagueData.schedule = [];
        document.getElementById('schedule-preview').innerHTML = '';
        showMessage('Schedule cleared!', 'success');
        saveLeagueToStorage();
    }
}

// ===== EXPORT FUNCTIONS =====
function exportToCSV() {
    if (leagueData.schedule.length === 0) {
        showMessage('No schedule to export', 'error');
        return;
    }

    let csv = 'Match ID,Date,Time,Team 1,Team 2,Venue,Round,Status\n';
    
    leagueData.schedule.forEach(match => {
        const row = [
            match.id,
            match.date.toLocaleDateString(),
            match.time,
            `"${match.team1.name}"`,
            `"${match.team2.name}"`,
            `"${match.venue}"`,
            match.eliminationRound || `Round ${match.round}`,
            match.status
        ].join(',');
        csv += row + '\n';
    });

    downloadFile(csv, `${leagueData.config.leagueName}_schedule.csv`, 'text/csv');
    showMessage('Schedule exported as CSV!', 'success');
}

function exportToJSON() {
    const exportData = {
        league: leagueData.config,
        teams: leagueData.teams,
        schedule: leagueData.schedule,
        customParameters: leagueData.customParameters,
        exportDate: new Date().toISOString(),
        version: '1.3'
    };

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, `${leagueData.config.leagueName}_full_data.json`, 'application/json');
    showMessage('League data exported as JSON!', 'success');
}

function printSchedule() {
    if (leagueData.schedule.length === 0) {
        showMessage('No schedule to print', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    const sportDisplay = leagueData.config.sportType === 'custom' ? 
        leagueData.config.customSport : leagueData.config.sportType;
    
    let html = `
        <html>
        <head>
            <title>${leagueData.config.leagueName} - Schedule</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; color: #1a1a1a; }
                h1 { color: #1a1a1a; border-bottom: 3px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
                .league-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #e5e5e5; padding: 12px; text-align: left; }
                th { background-color: #667eea; color: white; font-weight: 600; }
                tr:nth-child(even) { background-color: #fafafa; }
                tr:hover { background-color: #f0f9ff; }
                .match-teams { font-weight: 600; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>${leagueData.config.leagueName} Schedule</h1>
            <div class="league-info">
                <p><strong>Sport:</strong> ${sportDisplay}</p>
                <p><strong>Total Matches:</strong> ${leagueData.schedule.length}</p>
                <p><strong>Teams:</strong> ${leagueData.teams.length}</p>
                <p><strong>Schedule Type:</strong> ${leagueData.config.scheduleType.replace('-', ' ')}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Match</th>
                        <th>Venue</th>
                        <th>Round</th>
                    </tr>
                </thead>
                <tbody>
    `;

    leagueData.schedule.forEach(match => {
        html += `
            <tr>
                <td>${match.date.toLocaleDateString()}</td>
                <td>${match.time}</td>
                <td class="match-teams">${match.team1.name} vs ${match.team2.name}</td>
                <td>${match.venue}</td>
                <td>${match.eliminationRound || `Round ${match.round}`}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    
    showMessage('Schedule sent to printer!', 'success');
}

function generateShareLink() {
    const data = encodeURIComponent(JSON.stringify({
        config: leagueData.config,
        teams: leagueData.teams,
        schedule: leagueData.schedule
    }));
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${data}`;
    document.getElementById('share-link').value = shareUrl;
    showMessage('Share link generated!', 'success');
}

function copyToClipboard() {
    const shareLink = document.getElementById('share-link');
    if (!shareLink.value) {
        showMessage('Please generate a share link first', 'error');
        return;
    }
    
    copyLeagueUrl('', shareLink.value);
}

// ===== UTILITY FUNCTIONS =====
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.message:not([id])').forEach(el => el.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    messageDiv.innerHTML = `
        <span style="margin-right: 8px;">${icons[type] || icons.info}</span>
        ${message}
    `;

    document.body.appendChild(messageDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'block';
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveLeagueToStorage() {
    if (leagueData.config.leagueName) {
        const pageSlug = generatePageSlug(leagueData.config.leagueName);
        const saveData = {
            ...leagueData,
            pageSlug,
            lastModified: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(`league_${pageSlug}`, JSON.stringify(saveData));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            showMessage('Warning: Could not save league data locally', 'warning');
        }
    }
}

function loadSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
        try {
            const data = JSON.parse(decodeURIComponent(sharedData));
            leagueData.config = data.config || {};
            leagueData.teams = data.teams || [];
            leagueData.schedule = data.schedule || [];
            
            if (leagueData.config.leagueName) {
                populateFormFromConfig(leagueData.config);
                showMessage('Shared league data loaded successfully!', 'success');
                showConfigSummary();
                document.getElementById('create-page-btn').style.display = 'inline-flex';
            }
        } catch (e) {
            console.error('Error parsing shared data:', e);
            showMessage('Invalid shared data in URL', 'error');
        }
    }
}

function populateFormFromConfig(config) {
    const fieldMappings = {
        'league-name': config.leagueName,
        'sport-type': config.sportType,
        'custom-sport': config.customSport,
        'season-start': config.seasonStart,
        'season-end': config.seasonEnd,
        'num-teams': config.numTeams,
        'players-per-team': config.playersPerTeam,
        'schedule-type': config.scheduleType,
        'num-rounds': config.numRounds,
        'match-duration': config.matchDuration,
        'break-duration': config.breakDuration,
        'start-time': config.startTime,
        'num-venues': config.numVenues
    };
    
    Object.entries(fieldMappings).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    });
    
    // Handle conditional displays
    if (config.sportType === 'custom') {
        document.getElementById('custom-sport-row').style.display = 'block';
    }
    
    if (config.scheduleType === 'custom-rounds') {
        document.getElementById('custom-rounds-input').style.display = 'block';
    }
    
    // Set game days
    if (config.gameDays) {
        config.gameDays.forEach(day => {
            const checkbox = document.getElementById(`day-${day}`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// ===== ANALYTICS & TRACKING =====
function trackSectionView(sectionId) {
    // Simple analytics tracking - could be enhanced
    console.log(`Section viewed: ${sectionId}`);
}

function trackLeaguePageCreation(pageSlug) {
    console.log(`League page created: ${pageSlug}`);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save configuration
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('setup').classList.contains('active')) {
            saveLeagueConfig();
        }
    }
    
    // Ctrl+T to add team (when in teams section)
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        if (document.getElementById('teams').classList.contains('active')) {
            document.getElementById('team-name').focus();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
        closeMobileSidebar();
    }
});

// ===== ANIMATION STYLES =====
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(animationStyles);

// ===== VERSION & DEBUG INFO =====
console.log('League Scheduler Management Tool v1.3');
console.log('Features: League setup, team management, schedule generation, dynamic pages');
console.log('For support, check the README.md file');

// Export main functions for external access if needed
window.LeagueScheduler = {
    version: '1.3',
    saveConfig: saveLeagueConfig,
    addTeam: addTeam,
    generateSchedule: generateSchedule,
    createPage: createLeaguePage,
    data: leagueData
};/**
 * League Scheduler Management Tool - JavaScript
 * Comprehensive league management system with dynamic page generation
 */

// ===== GLOBAL STATE MANAGEMENT =====
let leagueData = {
    config: {},
    teams: [],
    schedule: [],
    customParameters: []
};

// Configuration for different sections
const sectionTitles = {
    setup: { title: 'League Setup', subtitle: 'Configure your league parameters and settings' },
    teams: { title: 'Team Management', subtitle: 'Add and manage teams in your league' },
    schedule: { title: 'Schedule Generation', subtitle: 'Create and manage match schedules' },
    export: { title: 'Export & Share', subtitle: 'Export your schedule and share with others' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSharedData();
    createLeagueManagerButton();
    setupEventListeners();
});

function initializeApp() {
    console.log('League Scheduler Management Tool v1.3 initialized');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('season-start').value = today;
    
    // Setup tooltips and initial states
    setupInitialStates();
}

function setupInitialStates() {
    // Hide create page button initially
    document.getElementById('create-page-btn').style.display = 'none';
    
    // Setup form validation
    setupFormValidation();
}

function setupEventListeners() {
    // Sport type change handler
    document.getElementById('sport-type').addEventListener('change', handleSportTypeChange);
    
    // Schedule type change handler
    document.getElementById('schedule-type').addEventListener('change', handleScheduleTypeChange);
    
    // Window resize handler for responsive design
    window.addEventListener('resize', handleWindowResize);
}

// ===== SIDEBAR NAVIGATION =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // Store preference
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('open');
    overlay.classList.add('show');
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function handleWindowResize() {
    if (window.innerWidth > 768) {
        closeMobileSidebar();
    }
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Update header
    const titleInfo = sectionTitles[sectionId];
    document.getElementById('contentTitle').textContent = titleInfo.title;
    document.getElementById('contentSubtitle').textContent = titleInfo.subtitle;

    // Close mobile sidebar
    closeMobileSidebar();

    // Check prerequisites and load section data
    checkSectionPrerequisites(sectionId);
    
    // Analytics tracking
    trackSectionView(sectionId);
}

function checkSectionPrerequisites(sectionId) {
    switch(sectionId) {
        case 'teams':
            if (!leagueData.config.leagueName) {
                showElement('teams-config-warning');
                hideElement('teams-content');
            } else {
                hideElement('teams-config-warning');
                showElement('teams-content');
                generateTeamCustomFields();
            }
            break;
            
        case 'schedule':
            if (!leagueData.config.leagueName || leagueData.teams.length < 2) {
                showElement('schedule-config-warning');
                hideElement('schedule-content');
            } else {
                hideElement('schedule-config-warning');
                showElement('schedule-content');
                populateVenueDefaults();
            }
            break;
            
        case 'export':
            if (leagueData.schedule.length === 0) {
                showElement('export-config-warning');
                hideElement('export-content');
            } else {
                hideElement('export-config-warning');
                showElement('export-content');
            }
            break;
    }
}

// ===== FORM HANDLING =====
function handleSportTypeChange() {
    const customRow = document.getElementById('custom-sport-row');
    const sportType = document.getElementById('sport-type').value;
    
    if (sportType === 'custom') {
        customRow.style.display = 'block';
        document.getElementById('custom-sport').focus();
    } else {
        customRow.style.display = 'none';
    }
    
    // Set default parameters based on sport
    setDefaultParameters(sportType);
}

function handleScheduleTypeChange() {
    const customRoundsInput = document.getElementById('custom-rounds-input');
    const scheduleType = document.getElementById('schedule-type').value;
    
    if (scheduleType === 'custom-rounds') {
        customRoundsInput.style.display = 'block';
        document.getElementById('num-rounds').focus();
    } else {
        customRoundsInput.style.display = 'none';
    }
}

function setDefaultParameters(sportType) {
    const defaults = {
        soccer: { duration: 90, break: 15, venues: 1 },
        basketball: { duration: 48, break: 10, venues: 1 },
        baseball: { duration: 180, break: 20, venues: 1 },
        tennis: { duration: 120, break: 10, venues: 2 },
        bocce: { duration: 60, break: 10, venues: 2 },
        volleyball: { duration: 60, break: 10, venues: 1 }
    };
    
    const config = defaults[sportType];
    if (config) {
        document.getElementById('match-duration').value = config.duration;
        document.getElementById('break-duration').value = config.break;
        document.getElementById('num-venues').value = config.venues;
    }
}

function setupFormValidation() {
    const requiredFields = ['league-name', 'sport-type', 'season-start', 'num-teams'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        }
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Additional validation based on field type
    if (field.type === 'number') {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) {
            showFieldError(field, 'Please enter a valid positive number');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#dc2626';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// ===== CUSTOM PARAMETERS MANAGEMENT =====
function addCustomParameter() {
    const container = document.getElementById('custom-parameters');
    const paramDiv = document.createElement('div');
    paramDiv.className = 'custom-param';
    
    const paramId = 'param-' + Date.now();
    paramDiv.innerHTML = `
        <input type="text" class="form-input param-name" placeholder="Parameter name (e.g., Max substitutions)" style="flex: 1;" data-param-id="${paramId}">
        <input type="text" class="form-input param-value" placeholder="Value or description" style="flex: 1;" data-param-id="${paramId}">
        <button type="button" class="btn btn-danger" onclick="removeCustomParameter(this)" style="flex: none;" title="Remove parameter">
            <svg width="16" height="16" viewBox="0 0 
