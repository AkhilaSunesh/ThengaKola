/**
 * Thenga Kola - Storage & Sound Synthesizer Engine
 * Web Audio API synthesized retro bleeps, alert sirens, shutter clicks, and LocalStorage records.
 */

// Sound FX Synthesizer (No external MP3 files needed, 100% reliable)
const SoundEngine = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },

  playShutter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Camera click simulation
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(200, this.ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  },

  playAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now + i * 0.2);
      osc.frequency.linearRampToValueAtTime(440, now + i * 0.2 + 0.18);
      gain.gain.setValueAtTime(0.2, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.01, now + i * 0.2 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.18);
    }
  }
};

// Storage & Pre-seeded Crime / Census Database
const ThengaStorage = {
  SCAN_HISTORY_KEY: 'thenga_scan_history',
  CRIME_RECORDS_KEY: 'thenga_crime_records',
  UNDO_REPORTS_KEY: 'thenga_undo_reports',
  COMPLAINTS_KEY: 'thenga_complaints',

  initDefaults() {
    if (!localStorage.getItem(this.CRIME_RECORDS_KEY)) {
      const defaultCrimes = [
        {
          caseNo: 'TKD-CR-1994-01',
          date: '1994-08-14',
          location: 'Alappuzha Backwaters, Near Toddy Shop #4',
          alias: 'The Green Assassin',
          maturity: 'Mature',
          status: 'Escaped, Still at Large',
          statusClass: 'status-at-large',
          description: 'Dropped directly onto an Ambassador car roof with premeditated precision. Roof caved in 14 inches.',
          victimImpact: 'Driver suffered mild panic attack and spilt full flask of hot filter coffee.',
          dangerScore: 94
        },
        {
          caseNo: 'TKD-CR-2008-88',
          date: '2008-03-22',
          location: 'Thrissur Round, Near Swaraj Round Palm #12',
          alias: 'Sub-Inspector Husk',
          maturity: 'Mature',
          status: 'Consumed as Evidence',
          statusClass: 'status-consumed',
          description: 'Fell during Thrissur Pooram rehearsal. Smashed a plastic chair and rolled toward the temple gate.',
          victimImpact: 'Seized by local crowd, grated, and converted into Kerala style Coconut Chammanthi within 45 minutes.',
          dangerScore: 82
        },
        {
          caseNo: 'TKD-CR-2016-42',
          date: '2016-11-05',
          location: 'Kozhikode Beach Promenade',
          alias: 'The Halwa Phantom',
          maturity: 'Mature',
          status: 'In Police Custody',
          statusClass: 'status-custody',
          description: 'Hovered menacingly at 24 meters before dive-bombing a stainless steel street dustbin.',
          victimImpact: 'Municipal dustbin dented beyond recognition. Suspect currently stored in station evidence locker.',
          dangerScore: 89
        },
        {
          caseNo: 'TKD-CR-2023-109',
          date: '2023-05-19',
          location: 'Varkala Cliff Viewpoint',
          alias: 'The Gravity Specialist',
          maturity: 'Mature',
          status: 'Escaped, Still at Large',
          statusClass: 'status-at-large',
          description: 'Executed high-speed descent during sunset selfie crowd. Narrowly missed a German tourist.',
          victimImpact: 'Tourist embraced existential philosophy and bought a motorcycle.',
          dangerScore: 96
        }
      ];
      localStorage.setItem(this.CRIME_RECORDS_KEY, JSON.stringify(defaultCrimes));
    }

    if (!localStorage.getItem(this.UNDO_REPORTS_KEY)) {
      const defaultUndo = [
        {
          id: 'UNDO-881',
          date: '2026-09-10',
          treeLocation: 'Ernakulam Town North',
          tenderCount: 14,
          matureCount: 6,
          reportedBy: 'K. Nair (Concerned Neighbor)',
          status: 'Marked for Emergency Plucking'
        },
        {
          id: 'UNDO-882',
          date: '2026-09-11',
          treeLocation: 'Kollam Sasthamkotta',
          tenderCount: 8,
          matureCount: 11,
          reportedBy: 'Sukumaran P.',
          status: 'Under Aerial Surveillance'
        }
      ];
      localStorage.setItem(this.UNDO_REPORTS_KEY, JSON.stringify(defaultUndo));
    }
  },

  getScans() {
    try {
      return JSON.parse(localStorage.getItem(this.SCAN_HISTORY_KEY) || '[]');
    } catch(e) { return []; }
  },

  saveScan(scan) {
    const list = this.getScans();
    list.unshift(scan);
    if (list.length > 50) list.pop();
    localStorage.setItem(this.SCAN_HISTORY_KEY, JSON.stringify(list));
  },

  getCrimes() {
    try {
      return JSON.parse(localStorage.getItem(this.CRIME_RECORDS_KEY) || '[]');
    } catch(e) { return []; }
  },

  addCrime(crime) {
    const list = this.getCrimes();
    list.unshift(crime);
    localStorage.setItem(this.CRIME_RECORDS_KEY, JSON.stringify(list));
  },

  getUndoReports() {
    try {
      return JSON.parse(localStorage.getItem(this.UNDO_REPORTS_KEY) || '[]');
    } catch(e) { return []; }
  },

  saveUndoReport(report) {
    const list = this.getUndoReports();
    list.unshift(report);
    localStorage.setItem(this.UNDO_REPORTS_KEY, JSON.stringify(list));
  },

  getComplaints() {
    try {
      return JSON.parse(localStorage.getItem(this.COMPLAINTS_KEY) || '[]');
    } catch(e) { return []; }
  },

  saveComplaint(complaint) {
    const list = this.getComplaints();
    list.unshift(complaint);
    localStorage.setItem(this.COMPLAINTS_KEY, JSON.stringify(list));
  }
};

ThengaStorage.initDefaults();

window.SoundEngine = SoundEngine;
window.ThengaStorage = ThengaStorage;
