/**
 * Krishna Nagpal's 1st Birthday Invitation
 * Special Invitation from Cousin Sister Chahat Nagpal
 * Featuring: 3D Royal Envelope, Scratch-to-Reveal Date, Royal Arch Timeline, "Are You Coming?" Challenge
 */

(function () {
  'use strict';

  // --- Configuration ---
  const EVENT_CONFIG = {
    childName: "Krishna Nagpal",
    sisterName: "Chahat Nagpal",
    parentName: "Yash Nagpal",
    grandfatherName: "Jawer Lal Nagpal",
    familyName: "Nagpal Family",
    eventTitle: "1st Birthday Party",
    venueName: "Penchati Hall",
    venueAddress: "Sonraki Bazar, Jacobabad, Sindh, Pakistan",
    eventDateISO: "2026-11-19T21:00:00+05:00", // Thursday, Nov 19, 2026 at 9:00 PM PKT
    displayDate: "Thursday, 19 November 2026",
    displayTime: "9:00 PM",
    whatsappHostPhone: "923000000000",
  };

  // --- DOM Elements ---
  const envelopeWrap = document.getElementById('envelopeWrap');
  const envelopeFlap = document.getElementById('envelopeFlap');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const cardInside = document.getElementById('cardInside');
  const fullInviteSection = document.getElementById('fullInviteSection');
  const openPrompt = document.getElementById('openPrompt');
  const guestPassName = document.getElementById('guestPassName');
  
  // Audio Controls
  const bgMusicBtn = document.getElementById('bgMusicBtn');
  const floatingMusicPill = document.getElementById('floatingMusicPill');
  const musicVisualizer = document.getElementById('musicVisualizer');
  
  // Countdown Elements
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  // "Are You Coming?" Interactive Game Elements
  const btnComingYes = document.getElementById('btnComingYes');
  const btnComingNo = document.getElementById('btnComingNo');
  const comingDodgeMsg = document.getElementById('comingDodgeMsg');
  const yesSuccessModal = document.getElementById('yesSuccessModal');
  const closeYesModal = document.getElementById('closeYesModal');
  const modalWhatsAppConfirmBtn = document.getElementById('modalWhatsAppConfirmBtn');
  const tellChahatWhatsAppBtn = document.getElementById('tellChahatWhatsAppBtn');
  const modalAddToCalBtn = document.getElementById('modalAddToCalBtn');

  // Modals & Toasts
  const toastEl = document.getElementById('toast');
  const shareModal = document.getElementById('shareModal');
  const closeShareModal = document.getElementById('closeShareModal');
  const shareGuestInput = document.getElementById('shareGuestInput');
  const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
  const shareWhatsAppDirectBtn = document.getElementById('shareWhatsAppDirectBtn');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const viewEnvelopeAgainBtn = document.getElementById('viewEnvelopeAgainBtn');
  const revealAllScratchBtn = document.getElementById('revealAllScratchBtn');

  let isEnvelopeOpened = false;
  let isPlayingMusic = false;
  let audioCtx = null;
  let synthInterval = null;
  let audioGainNode = null;
  let noAttempts = 0;

  // --- URL Query Personalization ---
  function initGuestPersonalization() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('guest') || urlParams.get('name') || urlParams.get('to');
    
    if (guestParam) {
      const cleanGuest = decodeURIComponent(guestParam.replace(/\+/g, ' ')).trim();
      if (guestPassName) guestPassName.textContent = cleanGuest;
      showToast(`Welcome, ${cleanGuest}! Tap the seal to open your invite.`);
    } else {
      if (guestPassName) guestPassName.textContent = "My Dearest Friend";
    }

    if (urlParams.get('open') === '1' || urlParams.get('state') === 'open') {
      setTimeout(() => {
        openEnvelope();
      }, 400);
    }

    if (urlParams.get('scratched') === '1') {
      setTimeout(() => {
        revealAllScratchCards();
      }, 900);
    }
  }

  // --- Web Audio Synthesizer (Instant, Zero Network Dependency) ---
  function initAudioContext() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    audioGainNode = audioCtx.createGain();
    audioGainNode.gain.setValueAtTime(0.32, audioCtx.currentTime);
    audioGainNode.connect(audioCtx.destination);
  }

  function playTone(freq, time, duration = 1.2, type = 'sine') {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      const overtone = audioCtx.createOscillator();
      const overGain = audioCtx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, time);

      noteGain.gain.setValueAtTime(0, time);
      noteGain.gain.linearRampToValueAtTime(0.24, time + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      overGain.gain.setValueAtTime(0, time);
      overGain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      overGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.7);

      osc.connect(noteGain);
      overtone.connect(overGain);
      noteGain.connect(audioGainNode);
      overGain.connect(audioGainNode);

      osc.start(time);
      overtone.start(time);
      osc.stop(time + duration);
      overtone.stop(time + duration);
    } catch (e) {
      console.warn("Audio note error", e);
    }
  }

  // Playful Boing / Dodge Sound for "NO" button
  function playBoingSound() {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(audioGainNode);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (err) {}
  }

  // Triumphant Fanfare Sound for "YES!"
  function playFanfareSound() {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    playTone(523.25, now, 0.25, 'triangle'); // C5
    playTone(659.25, now + 0.15, 0.25, 'triangle'); // E5
    playTone(783.99, now + 0.3, 0.3, 'triangle'); // G5
    playTone(1046.50, now + 0.45, 0.8, 'sine'); // C6
  }

  const notes = {
    D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
    Cs5: 554.37, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00
  };

  const melodyScore = [
    { n: notes.D5, d: 0.8 }, { n: notes.A4, d: 0.4 }, { n: notes.Fs4, d: 0.6 }, { n: notes.A4, d: 0.6 },
    { n: notes.B4, d: 0.8 }, { n: notes.G4, d: 0.4 }, { n: notes.D5, d: 0.8 },
    { n: notes.A4, d: 0.8 }, { n: notes.Fs4, d: 0.4 }, { n: notes.E4, d: 0.6 }, { n: notes.Fs4, d: 0.6 },
    { n: notes.G4, d: 0.8 }, { n: notes.E4, d: 0.4 }, { n: notes.Cs4 || 277.18, d: 0.8 },
    { n: notes.Fs4, d: 0.6 }, { n: notes.A4, d: 0.6 }, { n: notes.D5, d: 0.8 }, { n: notes.Fs5, d: 1.0 },
    { n: notes.E5, d: 0.8 }, { n: notes.Cs5, d: 0.6 }, { n: notes.A4, d: 0.8 },
    { n: notes.D5, d: 1.4 }, { n: notes.A4, d: 0.5 }, { n: notes.Fs4, d: 0.5 }, { n: notes.D4, d: 1.6 }
  ];

  let currentNoteIdx = 0;
  function startProceduralMelody() {
    if (!audioCtx) initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    isPlayingMusic = true;
    updateMusicUI(true);

    if (synthInterval) clearInterval(synthInterval);
    synthInterval = setInterval(() => {
      if (!isPlayingMusic || !audioCtx) return;
      const step = melodyScore[currentNoteIdx];
      const now = audioCtx.currentTime;
      playTone(step.n, now, step.d * 1.5);

      if (currentNoteIdx % 4 === 0) {
        playTone(step.n / 2, now, 2.0, 'sine');
      }
      currentNoteIdx = (currentNoteIdx + 1) % melodyScore.length;
    }, 620);
  }

  function stopProceduralMelody() {
    isPlayingMusic = false;
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    updateMusicUI(false);
  }

  function toggleMusic() {
    if (isPlayingMusic) {
      stopProceduralMelody();
      showToast("Music paused");
    } else {
      startProceduralMelody();
      showToast("Playing Celebration Melody 🎵");
    }
  }

  function updateMusicUI(active) {
    if (bgMusicBtn) {
      bgMusicBtn.classList.toggle('playing', active);
      const icon = bgMusicBtn.querySelector('.music-icon');
      if (icon) icon.textContent = active ? '⏸' : '▶';
    }
    if (floatingMusicPill) {
      floatingMusicPill.classList.toggle('is-playing', active);
      const label = floatingMusicPill.querySelector('.pill-music-state');
      if (label) label.textContent = active ? 'Playing ♫' : 'Play Music';
    }
    if (musicVisualizer) {
      musicVisualizer.classList.toggle('active', active);
    }
  }

  function playSealBreakSound() {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    playTone(1046.50, now, 0.4, 'triangle');
    playTone(1318.51, now + 0.08, 0.5, 'sine');
    playTone(1567.98, now + 0.16, 0.7, 'sine');
    playTone(2093.00, now + 0.24, 0.9, 'triangle');
  }

  // --- Confetti Cannon ---
  function fireRoyalConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#4a6fa5', '#d4af37', '#ffffff', '#8faadc', '#e6c875']
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#385a82', '#dfbd78', '#f5f4f0']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#385a82', '#dfbd78', '#f5f4f0']
        });
      }, 300);
    }
  }

  // --- Envelope Opening Sequence ---
  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    playSealBreakSound();

    if (waxSealBtn) {
      waxSealBtn.classList.add('wax-cracking');
    }

    if (openPrompt) {
      openPrompt.style.opacity = '0';
      openPrompt.style.pointerEvents = 'none';
    }

    if (envelopeWrap) {
      envelopeWrap.classList.add('beaming-light');
    }

    setTimeout(() => {
      if (envelopeFlap) envelopeFlap.classList.add('is-opened');
      if (envelopeWrap) envelopeWrap.classList.add('is-open');
    }, 350);

    setTimeout(() => {
      if (cardInside) cardInside.classList.add('card-slides-up');
      fireRoyalConfetti();
      if (!isPlayingMusic) {
        startProceduralMelody();
      }
    }, 700);

    setTimeout(() => {
      if (fullInviteSection) fullInviteSection.classList.add('is-visible');
      const target = document.getElementById('invitationHeader') || cardInside;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1200);
  }

  function resetEnvelope() {
    isEnvelopeOpened = false;
    if (envelopeFlap) envelopeFlap.classList.remove('is-opened');
    if (envelopeWrap) {
      envelopeWrap.classList.remove('is-open');
      envelopeWrap.classList.remove('beaming-light');
    }
    if (cardInside) cardInside.classList.remove('card-slides-up');
    if (waxSealBtn) waxSealBtn.classList.remove('wax-cracking');
    if (openPrompt) {
      openPrompt.style.opacity = '1';
      openPrompt.style.pointerEvents = 'auto';
    }
    if (fullInviteSection) fullInviteSection.classList.remove('is-visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Envelope sealed again");
  }

  // --- Interactive Scratch to Reveal Date ---
  function initScratchCards() {
    const cards = document.querySelectorAll('.scratch-card-box');
    cards.forEach(card => {
      const canvas = card.querySelector('.scratch-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = 92;
      const h = 92;
      canvas.width = w;
      canvas.height = h;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#fef3d6');
      grad.addColorStop(0.3, '#dfbd78');
      grad.addColorStop(0.6, '#b68f44');
      grad.addColorStop(0.85, '#e5cd8d');
      grad.addColorStop(1, '#8b6c2d');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 28; i++) {
        const sx = (i * 17) % w;
        const sy = (i * 23) % h;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      ctx.strokeStyle = '#fbf0d0';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, w - 6, h - 6);

      ctx.fillStyle = '#4a3311';
      ctx.font = 'bold 9px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ SCRATCH ✦', w / 2, h / 2 - 4);
      ctx.font = '8px Montserrat, sans-serif';
      ctx.fillText('TO REVEAL', w / 2, h / 2 + 8);

      let isDrawing = false;
      let scratchedPixels = 0;

      function getPos(e) {
        const bounds = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - bounds.left) * (canvas.width / bounds.width),
          y: (clientY - bounds.top) * (canvas.height / bounds.height)
        };
      }

      function scratchAt(pos) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();

        scratchedPixels += 1;
        if (scratchedPixels > 25 && !card.classList.contains('is-revealed')) {
          revealCard(card, canvas);
        }
      }

      function onStart(e) {
        isDrawing = true;
        const pos = getPos(e);
        scratchAt(pos);
      }

      function onMove(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        scratchAt(pos);
      }

      function onEnd() {
        isDrawing = false;
      }

      canvas.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      canvas.addEventListener('touchstart', onStart, { passive: false });
      canvas.addEventListener('touchmove', onMove, { passive: false });
      canvas.addEventListener('touchend', onEnd);

      card.addEventListener('click', () => {
        if (!card.classList.contains('is-revealed')) {
          revealCard(card, canvas);
        }
      });
    });
  }

  function revealCard(card, canvas) {
    card.classList.add('is-revealed');
    if (canvas) {
      canvas.style.transition = 'opacity 0.5s ease';
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.style.display = 'none';
      }, 500);
    }
    playTone(1318.51, audioCtx ? audioCtx.currentTime : 0, 0.3, 'sine');
  }

  function revealAllScratchCards() {
    const cards = document.querySelectorAll('.scratch-card-box');
    cards.forEach((card, idx) => {
      setTimeout(() => {
        const canvas = card.querySelector('.scratch-canvas');
        revealCard(card, canvas);
      }, idx * 160);
    });
    fireRoyalConfetti();
    showToast("Date Revealed: Thursday, 19th November 2026 at 9:00 PM!");
  }

  // --- Live Countdown Timer (Target: 19 Nov 2026 at 9:00 PM) ---
  function updateCountdown() {
    const targetDate = new Date(EVENT_CONFIG.eventDateISO).getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // --- "ARE YOU COMING OR NOT?" INTERACTIVE GAME ---
  const noPleadingMessages = [
    "Wait... think about the cake! 🍰 Try again 🥺",
    "Are you really sure?! Chahat will cry! 😭 Try again",
    "Chahat won't let you say no! 😤 Try again",
    "Krishna is making sad baby faces at you 🥺 Try again!",
    "Wrong button bestie! Try again 😂",
    "Okay fine, you have to click YES! 🤣"
  ];

  function handleNoDodge(e) {
    if (e) e.preventDefault();
    noAttempts++;
    playBoingSound();

    // Funny message updates
    const msg = noPleadingMessages[(noAttempts - 1) % noPleadingMessages.length];
    if (comingDodgeMsg) {
      comingDodgeMsg.textContent = msg;
      comingDodgeMsg.classList.add('shake-message');
      setTimeout(() => comingDodgeMsg.classList.remove('shake-message'), 400);
    }

    // Playful dodge movement
    if (btnComingNo) {
      if (noAttempts < 5) {
        // Random offsets to dodge
        const maxX = 70;
        const maxY = 45;
        const randX = (Math.random() * (maxX * 2) - maxX);
        const randY = (Math.random() * (maxY * 2) - maxY);
        btnComingNo.style.transition = 'transform 0.25s ease';
        btnComingNo.style.transform = `translate(${randX}px, ${randY}px)`;
        btnComingNo.textContent = `NO 😢 (Try again)`;
      } else {
        // On 5th attempt, NO button surrenders and becomes a secondary YES!
        btnComingNo.style.transform = 'translate(0, 0)';
        btnComingNo.classList.remove('btn-coming-no');
        btnComingNo.classList.add('btn-coming-yes');
        btnComingNo.textContent = "Okay fine, YES! 🤣";
        btnComingNo.removeEventListener('click', handleNoDodge);
        btnComingNo.removeEventListener('mouseenter', handleNoDodge);
        btnComingNo.addEventListener('click', handleYesSuccess);
      }
    }

    // YES button gets progressively bigger and impossible to miss!
    if (btnComingYes) {
      const scale = 1 + Math.min(noAttempts * 0.1, 0.45);
      btnComingYes.style.transform = `scale(${scale})`;
      btnComingYes.classList.add('pulse-grow');
    }
  }

  function handleYesSuccess() {
    playFanfareSound();
    fireRoyalConfetti();

    if (btnComingYes) {
      btnComingYes.classList.add('celebrating');
      btnComingYes.innerHTML = `<span>💖</span> YAY! SEE YOU THERE! 🥳`;
    }

    if (comingDodgeMsg) {
      comingDodgeMsg.innerHTML = `<strong>WOOHOO! Best decision ever! 🎉</strong> Chahat is so thrilled!`;
      comingDodgeMsg.style.color = '#166534';
    }

    // Open celebration modal
    if (yesSuccessModal) {
      setTimeout(() => {
        yesSuccessModal.classList.add('is-active');
      }, 500);
    }

    showToast("Yay! Chahat can't wait to see you! 🎉");
  }

  function closeYesSuccessModal() {
    if (yesSuccessModal) yesSuccessModal.classList.remove('is-active');
  }

  function sendWhatsAppConfirmationToChahat() {
    const friendName = guestPassName && guestPassName.textContent !== "My Dearest Friend"
      ? guestPassName.textContent
      : "Your Bestie";

    const text = `Hey Chahat! 💖\n\n` +
      `I just opened baby Krishna's royal invitation and clicked *YES*! 🎂👶\n\n` +
      `I am 100% COMING to celebrate his 1st Birthday Party on *Thursday, 19th November 2026 at 9:00 PM* at *Penchati Hall, Jacobabad*!\n\n` +
      `Can't wait to party and celebrate with you and the Nagpal family! 🎉✨\n` +
      `— With love, ${friendName}`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  // --- Add to Calendar ---
  function openGoogleCalendar() {
    const title = encodeURIComponent("Krishna Nagpal's 1st Birthday Party 🎂 (Invited by Chahat)");
    const details = encodeURIComponent(
      "1st Birthday Celebration of baby Krishna Nagpal, beloved son of Yash Nagpal.\n\n" +
      "Special Invitation from Cousin Sister Chahat Nagpal!\n\n" +
      "Venue: Penchati Hall, Sonraki Bazar, Jacobabad, Sindh, Pakistan\n" +
      "Time: 9:00 PM Onwards\n" +
      "Theme: Royal Blue & Soft Pastels / Traditional Formals"
    );
    const location = encodeURIComponent("Penchati Hall, Sonraki Bazar, Jacobabad, Pakistan");
    const dates = "20261119T160000Z/20261119T190000Z";
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(gCalUrl, '_blank');
  }

  function downloadIcsFile() {
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Krishna Nagpal Birthday//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Krishna Nagpal's 1st Birthday Party 🎂 (Invited by Chahat)
DESCRIPTION:1st Birthday Party of Krishna Nagpal, son of Yash Nagpal. Invited with love by cousin sister Chahat Nagpal.
LOCATION:Penchati Hall, Sonraki Bazar, Jacobabad, Sindh, Pakistan
DTSTART:20261119T160000Z
DTEND:20261119T190000Z
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Krishna-Nagpal-1st-Birthday-Chahat.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Event saved to calendar!");
  }

  function copyVenueAddress() {
    const addr = "Penchati Hall, Sonraki Bazar, Jacobabad, Sindh, Pakistan";
    navigator.clipboard.writeText(addr).then(() => {
      showToast("Venue address copied to clipboard! 📋");
    }).catch(() => {
      showToast(addr);
    });
  }

  // --- Share Generator ---
  function openShareModal() {
    if (shareModal) {
      shareModal.classList.add('is-active');
      if (shareGuestInput) {
        shareGuestInput.value = "";
        shareGuestInput.focus();
      }
    }
  }

  function closeShareModalDialog() {
    if (shareModal) shareModal.classList.remove('is-active');
  }

  function generatePersonalizedUrl(guestName) {
    const base = window.location.origin + window.location.pathname;
    if (!guestName) return base;
    return `${base}?guest=${encodeURIComponent(guestName.trim())}`;
  }

  function copyCustomShareLink() {
    const name = shareGuestInput ? shareGuestInput.value.trim() : '';
    const link = generatePersonalizedUrl(name);
    navigator.clipboard.writeText(link).then(() => {
      showToast(name ? `Personalized link for ${name} copied! 💌` : "Invitation link copied! 💌");
      closeShareModalDialog();
    }).catch(() => {
      prompt("Copy this invitation link:", link);
    });
  }

  function shareViaWhatsApp() {
    const name = shareGuestInput ? shareGuestInput.value.trim() : '';
    const link = generatePersonalizedUrl(name);
    const greeting = name ? `Hey ${name}! 💖` : `Hey! 💖`;
    const message = `${greeting}\n\n` +
      `It's *Chahat*! You are cordially invited to celebrate my baby brother *Krishna Nagpal's 1st Birthday Party*! 🎂👶\n\n` +
      `🗓 *Date:* Thursday, 19th November 2026\n` +
      `⏰ *Timing:* 9:00 PM\n` +
      `📍 *Venue:* Penchati Hall, Sonraki Bazar, Jacobabad\n\n` +
      `Open your royal wax-sealed envelope and let me know if you're coming:\n` +
      `${link}`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  let toastTimeout = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3800);
  }

  function initEvents() {
    if (waxSealBtn) {
      waxSealBtn.addEventListener('click', openEnvelope);
      waxSealBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEnvelope();
        }
      });
    }

    if (envelopeFlap) envelopeFlap.addEventListener('click', openEnvelope);
    if (viewEnvelopeAgainBtn) viewEnvelopeAgainBtn.addEventListener('click', resetEnvelope);

    if (bgMusicBtn) bgMusicBtn.addEventListener('click', toggleMusic);
    if (floatingMusicPill) floatingMusicPill.addEventListener('click', toggleMusic);

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Scratch Cards
    initScratchCards();
    if (revealAllScratchBtn) {
      revealAllScratchBtn.addEventListener('click', revealAllScratchCards);
    }

    // "Are You Coming?" Game Listeners
    if (btnComingNo) {
      btnComingNo.addEventListener('click', handleNoDodge);
      btnComingNo.addEventListener('mouseenter', handleNoDodge);
      btnComingNo.addEventListener('touchstart', handleNoDodge, { passive: true });
    }

    if (btnComingYes) {
      btnComingYes.addEventListener('click', handleYesSuccess);
    }

    if (closeYesModal) closeYesModal.addEventListener('click', closeYesSuccessModal);
    if (modalWhatsAppConfirmBtn) modalWhatsAppConfirmBtn.addEventListener('click', sendWhatsAppConfirmationToChahat);
    if (tellChahatWhatsAppBtn) tellChahatWhatsAppBtn.addEventListener('click', sendWhatsAppConfirmationToChahat);
    if (modalAddToCalBtn) modalAddToCalBtn.addEventListener('click', openGoogleCalendar);

    // Calendar & Maps
    const btnGoogleCal = document.getElementById('btnGoogleCal');
    if (btnGoogleCal) btnGoogleCal.addEventListener('click', openGoogleCalendar);

    const btnIcsCal = document.getElementById('btnIcsCal');
    if (btnIcsCal) btnIcsCal.addEventListener('click', downloadIcsFile);

    if (copyAddressBtn) copyAddressBtn.addEventListener('click', copyVenueAddress);

    const openMapsBtn = document.getElementById('openMapsBtn');
    if (openMapsBtn) {
      openMapsBtn.addEventListener('click', () => {
        window.open('https://www.google.com/maps/search/?api=1&query=Penchati+Hall+Sonraki+Bazar+Jacobabad+Pakistan', '_blank');
      });
    }

    // Share Modal
    const openShareModalBtn = document.getElementById('openShareModalBtn');
    if (openShareModalBtn) openShareModalBtn.addEventListener('click', openShareModal);

    const floatingShareBtn = document.getElementById('floatingShareBtn');
    if (floatingShareBtn) floatingShareBtn.addEventListener('click', openShareModal);

    if (closeShareModal) closeShareModal.addEventListener('click', closeShareModalDialog);
    if (copyShareLinkBtn) copyShareLinkBtn.addEventListener('click', copyCustomShareLink);
    if (shareWhatsAppDirectBtn) shareWhatsAppDirectBtn.addEventListener('click', shareViaWhatsApp);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initGuestPersonalization();
    initEvents();
  });
})();
