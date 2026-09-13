/**
 * Thenga Kola - Application Controller & User Interface Core
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core modules
  const detector = new CoconutDetector();
  let currentScanResult = null;
  let currentImageSource = null;
  let selectedCoconutIdx = 0;

  // Sound Engine Setup
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = SoundEngine.toggleMute();
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
      soundBtn.title = isMuted ? 'Sound Muted' : 'Sound Enabled';
    });
  }

  // Navigation Tabs Router
  const navButtons = document.querySelectorAll('.nav-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  function navigateTo(targetId) {
    SoundEngine.playClick();
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });
    viewPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh merged sub-views on navigation
    if (targetId === 'recordsView') {
      renderWantedLeaderboard();
      renderCrimeRecords();
    }
    if (targetId === 'undoView') {
      renderUndoReportsList();
      renderKeralaRadar();
    }
    if (targetId === 'historyView') renderPastScans();
  }

  // Logo returns to home
  const logoBtn = document.getElementById('brandLogoHomeBtn');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('homeView');
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.target) navigateTo(btn.dataset.target);
    });
  });

  // Direct action links
  document.querySelectorAll('[data-nav-to]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.navTo);
    });
  });

  // Sample Images Loader (populate from the 23 sample files)
  const sampleImagesList = [
    '1.jpg', '2.webp', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', 
    '9.jfif', '10.jpg', '10.jfif', '11.jfif', '12.webp', '13.jfif', '14.jpeg',
    '15.jpeg', '16.jpeg', '17.jpeg', '18.jpeg', '19.jpeg', '20.jpeg', '21.jpeg', '22.jpeg'
  ];

  const sampleContainer = document.getElementById('sampleGridContainer');
  if (sampleContainer) {
    sampleImagesList.forEach((filename, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'sample-thumb';
      thumb.innerHTML = `<img src="sample images/${filename}" alt="Sample Coconut Bunch ${idx+1}" loading="lazy">`;
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.sample-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        loadSampleImage(`sample images/${filename}`);
      });
      sampleContainer.appendChild(thumb);
    });
  }

  // File Upload & Camera Handler
  const fileInput = document.getElementById('treeFileInput');
  const dropZone = document.getElementById('dropZone');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image of a coconut tree.');
      return;
    }
    SoundEngine.playShutter();
    const reader = new FileReader();
    reader.onload = (e) => {
      runAnalysisOnImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function loadSampleImage(src) {
    SoundEngine.playClick();
    runAnalysisOnImage(src);
  }

  // Camera capture trigger (Mobile & Webcam)
  const cameraBtn = document.getElementById('cameraBtn');
  if (cameraBtn) {
    cameraBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
    });
  }

  // Analysis Flow Orchestrator
  async function runAnalysisOnImage(imgSrc) {
    currentImageSource = imgSrc;
    navigateTo('analyzingView');

    const scanFill = document.getElementById('scanProgressFill');
    const scanLog = document.getElementById('scanLogText');
    const analyzeImg = document.getElementById('analyzingImgPreview');
    if (analyzeImg) analyzeImg.src = imgSrc;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const result = await detector.detect(img, (pct, status) => {
          if (scanFill) scanFill.style.width = `${pct}%`;
          if (scanLog) scanLog.textContent = `[RADAR] ${status}`;
        });

        currentScanResult = result;
        // Save scan to history
        ThengaStorage.saveScan({
          id: `SCAN-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          highestThreat: result.highestThreat,
          highestScore: result.highestScore,
          coconutCount: result.totalDetected,
          imgSrc: imgSrc
        });

        // Play alarm if dangerous coconuts detected
        if (result.highestThreat === 'Code Red' || result.highestThreat === 'Lethal') {
          SoundEngine.playAlarm();
        } else {
          SoundEngine.playSuccess();
        }

        renderResults(img, result);
        navigateTo('resultsView');
      } catch (err) {
        alert('Analysis encountered an unexpected anomaly: ' + err.message);
        navigateTo('scannerView');
      }
    };
    img.src = imgSrc;
  }

  // Render Interactive Results on Canvas
  function renderResults(img, result) {
    const canvas = document.getElementById('detectionCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;

    // Draw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Threat banner styling
    const banner = document.getElementById('resultsThreatBanner');
    const threatIcon = document.getElementById('bannerThreatIcon');
    const threatTitle = document.getElementById('bannerThreatTitle');
    const threatSubtitle = document.getElementById('bannerThreatSubtitle');
    const mascotImg = document.getElementById('resultsMascotImg');

    const topDetection = result.detections[0];
    const threatClass = topDetection ? topDetection.threatClass : 'low';

    if (banner) {
      banner.className = `threat-banner ${threatClass}`;
      threatTitle.textContent = `THREAT LEVEL: ${result.highestThreat.toUpperCase()} (Score ${result.highestScore}/100)`;
      threatSubtitle.textContent = topDetection ? topDetection.tacticalAdvice : 'Zero immediate cranial threats.';
      threatIcon.textContent = topDetection ? topDetection.skullEmoji : '🟢';
    }

    // Set mascot image based on lethality
    if (mascotImg) {
      if (result.highestThreat === 'Code Red' || result.highestThreat === 'Lethal') {
        mascotImg.src = 'images/Caution Coconut Construction Mascot.png';
      } else {
        mascotImg.src = 'images/Haloed Coconut Mascot.png';
      }
    }

    // Guided Thenga Undo Prompt trigger
    const undoPrompt = document.getElementById('undoGuidedPrompt');
    if (undoPrompt) {
      if (result.highestThreat === 'Code Red' || result.highestThreat === 'Lethal') {
        undoPrompt.style.display = 'block';
        const undoLink = document.getElementById('guidedUndoBtn');
        if (undoLink) {
          undoLink.onclick = () => {
            // Pre-fill Thenga Undo form
            navigateTo('undoView');
            const matureIn = document.getElementById('undoMatureCount');
            if (matureIn) matureIn.value = result.totalDetected;
          };
        }
      } else {
        undoPrompt.style.display = 'none';
      }
    }

    // Render Bounding Boxes on Canvas
    drawBoundingBoxes(ctx, result.detections, selectedCoconutIdx);

    // Canvas Tap/Click Handler to select individual coconuts
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const foundIdx = result.detections.findIndex(d => {
        return clickX >= d.bbox.x && clickX <= (d.bbox.x + d.bbox.width) &&
               clickY >= (d.bbox.y - 24) && clickY <= (d.bbox.y + d.bbox.height);
      });

      if (foundIdx !== -1) {
        SoundEngine.playClick();
        selectedCoconutIdx = foundIdx;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawBoundingBoxes(ctx, result.detections, selectedCoconutIdx);
        const cardItems = document.querySelectorAll('.coconut-card-item');
        cardItems.forEach((c, i) => {
          c.classList.toggle('selected', i === selectedCoconutIdx);
        });
        if (cardItems[selectedCoconutIdx]) {
          cardItems[selectedCoconutIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    // Render Coconuts Dossier List
    renderDossierList(result.detections, img);

    // Update Certificate trigger
    const certBtn = document.getElementById('generateCertBtn');
    if (certBtn) {
      certBtn.onclick = () => showSafetyCertificate(result);
    }
  }

  function drawBoundingBoxes(ctx, detections, activeIdx) {
    detections.forEach((item, idx) => {
      const { bbox, threatClass, lethalityScore } = item;
      const isSelected = idx === activeIdx;

      // Exact 4-color palette mapping
      let color = '#f1ad00'; // gold (low / moderate)
      if (threatClass === 'lethal' || threatClass === 'code-red') {
        color = '#e75a04'; // orange/red
      }

      ctx.save();
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Draw box
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

      // Corner brackets
      const cornerLen = Math.min(bbox.width, bbox.height) * 0.25;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bbox.x, bbox.y + cornerLen);
      ctx.lineTo(bbox.x, bbox.y);
      ctx.lineTo(bbox.x + cornerLen, bbox.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bbox.x + bbox.width - cornerLen, bbox.y);
      ctx.lineTo(bbox.x + bbox.width, bbox.y);
      ctx.lineTo(bbox.x + bbox.width, bbox.y + cornerLen);
      ctx.stroke();

      // Label background
      const labelText = `#${idx + 1} ${item.threatLevel.toUpperCase()} (${lethalityScore}%)`;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(bbox.x, Math.max(0, bbox.y - 24), textWidth + 12, 22);

      // Label text
      ctx.fillStyle = '#ede8d0';
      ctx.fillText(labelText, bbox.x + 6, Math.max(16, bbox.y - 8));

      ctx.restore();
    });
  }

  function renderDossierList(detections, img) {
    const listContainer = document.getElementById('coconutDossierList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    detections.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = `coconut-card-item ${idx === selectedCoconutIdx ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="coconut-idx-tag">#${idx + 1}</div>
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            ${item.alias}
            <span class="threat-badge ${item.threatClass}">${item.threatLevel}</span>
          </div>
          <div class="physics-metrics">
            <span>⚖️ ${item.physics.massKg} kg</span>
            <span>📐 Drop: ${item.physics.dropHeightMeters}m</span>
            <span>⚡ ${item.physics.impactEnergyJoules} J (${item.physics.skullCrushMultiplier}x skull threshold)</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--brand-gold); margin-top: 2px;">
            Ripeness: ${item.maturity} • Lethality Score: ${item.lethalityScore}/100
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary report-crime-btn" title="Log Incident">🚨</button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('report-crime-btn')) {
          fileCrimeFromDetection(item);
          return;
        }
        selectedCoconutIdx = idx;
        const canvas = document.getElementById('detectionCanvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawBoundingBoxes(ctx, detections, selectedCoconutIdx);
        document.querySelectorAll('.coconut-card-item').forEach((c, i) => {
          c.classList.toggle('selected', i === idx);
        });
      });

      listContainer.appendChild(card);
    });
  }

  function fileCrimeFromDetection(item) {
    SoundEngine.playClick();
    const caseNo = `TKD-CR-${Date.now().toString().slice(-6)}`;
    const newCrime = {
      caseNo: caseNo,
      date: new Date().toISOString().split('T')[0],
      location: 'Suspect Scanned on Active Palm (GPS Pending)',
      alias: item.alias,
      maturity: item.maturity,
      status: item.lethalityScore >= 80 ? 'Escaped, Still at Large' : 'Under Aerial Surveillance',
      statusClass: item.lethalityScore >= 80 ? 'status-at-large' : 'status-custody',
      description: `Target identified with ballistic kinetic energy of ${item.physics.impactEnergyJoules} Joules (${item.physics.impactVelocityKmph} km/h). Extreme loitering detected.`,
      victimImpact: 'Pre-emptive FIR registered by Thenga Kola Department.',
      dangerScore: item.lethalityScore
    };
    ThengaStorage.addCrime(newCrime);
    alert(`Case ${caseNo} officially logged into the Kerala Coconut Crime Registry!`);
    navigateTo('recordsView');
  }

  // Thenga Undo (ഉണ്ടോ?) Self-Reporting
  const undoForm = document.getElementById('thengaUndoForm');
  if (undoForm) {
    undoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      SoundEngine.playSuccess();
      const loc = document.getElementById('undoLocation').value || 'Unspecified Kerala Palm';
      const tender = parseInt(document.getElementById('undoTenderCount').value || 0);
      const mature = parseInt(document.getElementById('undoMatureCount').value || 0);
      const reporter = document.getElementById('undoReporterName').value || 'Anonymous Citizen';

      const totalRiskScore = Math.min(100, Math.round((mature * 8.5) + (tender * 2.5)));

      const newReport = {
        id: `UNDO-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        treeLocation: loc,
        tenderCount: tender,
        matureCount: mature,
        riskScore: totalRiskScore,
        reportedBy: reporter,
        status: mature > 10 ? 'Marked for Emergency Plucking' : 'Registered in Palm Census'
      };

      ThengaStorage.saveUndoReport(newReport);
      alert(`Tree Census ID #${newReport.id} successfully registered under Thenga Undo! Risk Index: ${totalRiskScore}/100.`);
      undoForm.reset();
      renderUndoReportsList();
    });
  }

  function renderUndoReportsList() {
    const list = document.getElementById('undoReportsContainer');
    if (!list) return;
    const reports = ThengaStorage.getUndoReports();
    list.innerHTML = reports.map(r => `
      <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--brand-amber);">${r.id}</span>
          <span class="status-pill status-custody">${r.status}</span>
        </div>
        <div style="font-weight: 700; font-size: 1rem;">📍 ${r.treeLocation}</div>
        <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 0.25rem;">
          Reported by: <strong>${r.reportedBy}</strong> • Date: ${r.date}
        </div>
        <div class="physics-metrics" style="margin-top: 0.5rem;">
          <span>🥥 Tender: ${r.tenderCount}</span>
          <span>🌰 Mature (High Risk): ${r.matureCount}</span>
        </div>
      </div>
    `).join('');
  }

  // Crime Records Dossier Cards
  function renderCrimeRecords() {
    const grid = document.getElementById('crimeDossierGrid');
    if (!grid) return;
    const crimes = ThengaStorage.getCrimes();
    grid.innerHTML = crimes.map(c => `
      <div class="incident-case-card">
        <div class="case-header">
          <div class="case-number">${c.caseNo}</div>
          <span class="status-badge ${c.statusClass || 'status-at-large'}">${c.status}</span>
        </div>

        <div class="case-body">
          <div class="case-suspect-title">${c.alias}</div>
          <div class="case-location">📍 ${c.location} • 📅 ${c.date || 'Historical'}</div>

          <div class="case-desc-box">
            <strong>Incident Report:</strong> ${c.description}
          </div>

          <div class="case-autopsy-box">
            <strong>🔬 Forensic Impact / Autopsy:</strong> ${c.victimImpact}
          </div>
        </div>

        <div class="case-footer">
          <div class="case-maturity-tag">Husk: ${c.maturity || 'Mature'}</div>
          <div class="case-lethality-badge">Danger Index: ${c.dangerScore}%</div>
        </div>
      </div>
    `).join('');
  }

  // Most Wanted Leaderboard
  function renderWantedLeaderboard() {
    const grid = document.getElementById('wantedCardsGrid');
    if (!grid) return;
    const wantedList = [
      {
        name: 'The Gravity Assassin',
        alias: 'AKA "Old Husk #0427"',
        bounty: '₹ 50,000 & 2 Kilos Jaggery',
        charges: 'Premeditated Fall onto Ambassador car; Evading Toddy Tapper',
        threat: 'CODE RED',
        img: 'images/Wanted Coconut 0427 Mugshot.png'
      },
      {
        name: 'The Halwa Phantom',
        alias: 'AKA "Kozhikode Sniper"',
        bounty: '₹ 25,000 & 1 Plate Biryani',
        charges: 'Menacing tourists; Dive-bombing municipal dustbin',
        threat: 'LETHAL',
        img: 'images/Falling Coconut in a Hard Hat.png'
      },
      {
        name: 'Sub-Inspector Husk',
        alias: 'AKA "Swaraj Round Menace"',
        bounty: '₹ 10,000 Bounty',
        charges: 'Intimidation during festival rehearsal; Cracking plastic furniture',
        threat: 'LETHAL',
        img: 'images/Caution Coconut Construction Mascot.png'
      }
    ];

    grid.innerHTML = wantedList.map(w => `
      <div class="wanted-card">
        <div class="wanted-header">WANTED DEAD OR GRATED</div>
        <div class="wanted-img-frame">
          <img src="${w.img}" alt="${w.name}">
        </div>
        <div class="wanted-name">${w.name}</div>
        <div class="wanted-alias">${w.alias}</div>
        <div style="font-size: 0.8rem; margin: 0.5rem 0; line-height: 1.4;"><strong>CHARGES:</strong> ${w.charges}</div>
        <div class="bounty-tag">REWARD: ${w.bounty}</div>
      </div>
    `).join('');
  }

  // Kerala District Hazard Heatmap Radar
  function renderKeralaRadar() {
    const districts = [
      { name: 'Alappuzha', threat: 'Code Red', coconuts: '4.2 Million', risk: '92%' },
      { name: 'Kozhikode', threat: 'Code Red', coconuts: '3.8 Million', risk: '88%' },
      { name: 'Thrissur', threat: 'Lethal', coconuts: '5.1 Million', risk: '76%' },
      { name: 'Thiruvananthapuram', threat: 'Lethal', coconuts: '4.9 Million', risk: '71%' },
      { name: 'Ernakulam', threat: 'Moderate', coconuts: '3.1 Million', risk: '48%' },
      { name: 'Palakkad', threat: 'Moderate', coconuts: '2.4 Million', risk: '42%' },
      { name: 'Wayanad', threat: 'Low', coconuts: '0.9 Million', risk: '18%' },
      { name: 'Idukki', threat: 'Low', coconuts: '0.6 Million', risk: '12%' },
    ];

    const list = document.getElementById('keralaDistrictList');
    if (!list) return;
    list.innerHTML = districts.map(d => `
      <div class="district-item">
        <div>
          <strong>${d.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Est. Surveillance: ${d.coconuts}</div>
        </div>
        <div style="text-align: right;">
          <span class="threat-badge ${d.threat.toLowerCase().replace(' ', '-')}">${d.threat}</span>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--brand-gold); margin-top: 2px;">Risk: ${d.risk}</div>
        </div>
      </div>
    `).join('');
  }

  // Public Complaint Filing
  const complaintForm = document.getElementById('complaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', (e) => {
      e.preventDefault();
      SoundEngine.playSuccess();
      const newComplaint = {
        id: `FIR-${Date.now().toString().slice(-5)}`,
        complainant: document.getElementById('compName').value,
        offense: document.getElementById('compOffense').value,
        location: document.getElementById('compLocation').value,
        details: document.getElementById('compDetails').value,
        status: 'Dispatched to Local Toddy Tapper Quick Reaction Team'
      };
      ThengaStorage.saveComplaint(newComplaint);
      alert(`Grievance ${newComplaint.id} submitted to Thenga Kola Rapid Response Unit!`);
      complaintForm.reset();
    });
  }

  // Past Scans Log
  function renderPastScans() {
    const container = document.getElementById('pastScansContainer');
    if (!container) return;
    const scans = ThengaStorage.getScans();
    if (scans.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-dim); padding: 2rem;">No past radar scans recorded yet. Scan a tree to start!</div>';
      return;
    }
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;">
        ${scans.map(s => `
          <div class="card" style="padding: 0.75rem; cursor: pointer;" onclick="window.reopenScan('${s.id}')">
            <img src="${s.imgSrc}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 0.5rem;" alt="Scan">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="threat-badge ${s.highestThreat.toLowerCase().replace(' ', '-')}">${s.highestThreat}</span>
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--brand-gold);">${s.highestScore}%</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.35rem;">
              📅 ${s.date} ${s.time} • 🥥 ${s.coconutCount} targets
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Safety Certificate Generator
  function showSafetyCertificate(result) {
    SoundEngine.playSuccess();
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    modal.style.display = 'flex';

    document.getElementById('certDate').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('certTreeId').textContent = `TREE-TKD-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('certThreatLevel').textContent = result.highestThreat.toUpperCase();
    document.getElementById('certLethalityScore').textContent = `${result.highestScore}/100`;

    const statusElement = document.getElementById('certStatusText');
    if (result.highestThreat === 'Low' || result.highestThreat === 'Moderate') {
      statusElement.textContent = 'CLEARED FOR OCCASIONAL SHADE & SIESTAS (STEEL HELMET RECOMMENDED)';
    } else {
      statusElement.textContent = 'CONDEMNED PALM — IMMEDIATE HARVEST OR AIR EVACUATION MANDATED';
    }
  }

  // Close Certificate Modal
  const closeCertBtn = document.getElementById('closeCertBtn');
  if (closeCertBtn) {
    closeCertBtn.addEventListener('click', () => {
      document.getElementById('certificateModal').style.display = 'none';
    });
  }

  // Print / Save Certificate
  const printCertBtn = document.getElementById('printCertBtn');
  if (printCertBtn) {
    printCertBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Set initial default view
  renderCrimeRecords();
  renderWantedLeaderboard();
  renderKeralaRadar();
});
