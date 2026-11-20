// SayByMe – Live Interactive Apology Experience Controller
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || sessionStorage.getItem('saybyme_proposal_slug');

  // 1. Defaults from Session / Fallback
  let recipient = sessionStorage.getItem('saybyme_user_name') || 'b';
  let sender = sessionStorage.getItem('saybyme_sender_name') || 'a';
  let reason = sessionStorage.getItem('saybyme_apology_reason') || 'I know I hurt your feelings earlier, and seeing you upset broke my heart.';
  let message = sessionStorage.getItem('saybyme_apology_message') || 'I am truly, deeply sorry from the bottom of my heart. You mean everything to me, and my priority will always be protecting your smile and cherishing our relationship. I promise to listen better, understand deeper, and never take you for granted.';
  let sticker = sessionStorage.getItem('saybyme_patchup_sticker') || '💖 100% Sincere';
  let theme = sessionStorage.getItem('saybyme_patchup_theme') || 'kittens';

  // Load from Convex Database if slug exists
  if (slug && typeof getApologyFromConvex === 'function') {
    try {
      const data = await getApologyFromConvex(slug);
      if (data) {
        recipient = data.recipientName || recipient;
        sender = data.senderName || sender;
        reason = data.whatHappened || data.question || reason;
        message = data.message || message;
        if (Array.isArray(data.celebrations)) {
          theme = data.theme || (data.celebrations && data.celebrations[0]) || theme;
          sticker = data.sticker || (data.celebrations && data.celebrations[1]) || sticker;
        }
      }
    } catch(e) {
      console.warn("Convex load error in preview:", e);
    }
  }

  // 2. Populate Names and Content
  const elRecipient = document.getElementById('recipientName');
  if (elRecipient) elRecipient.textContent = recipient;

  const elSender = document.getElementById('senderName');
  if (elSender) elSender.textContent = sender;

  const peekRecipient = document.getElementById('peekRecipientName');
  if (peekRecipient) peekRecipient.textContent = recipient;

  const letterRecipient = document.getElementById('letterRecipientName');
  if (letterRecipient) letterRecipient.textContent = recipient;

  const peekStamp = document.getElementById('peekStamp');
  if (peekStamp) peekStamp.textContent = sticker;

  const letterStamp = document.getElementById('letterStampBadge');
  if (letterStamp) letterStamp.textContent = sticker;

  const peekText = document.getElementById('peekText');
  if (peekText) peekText.textContent = reason;

  const confessionText = document.getElementById('confessionText');
  if (confessionText) confessionText.textContent = reason;

  const letterMessage = document.getElementById('letterMessageText');
  if (letterMessage) letterMessage.textContent = message;

  const reconciliationImg = document.getElementById('reconciliationImg');
  const reconciliationBadge = document.getElementById('reconciliationBadge');
  const reconciliationCaption = document.getElementById('reconciliationCaption');

  if (reconciliationImg) {
    if (theme === 'garden') {
      reconciliationImg.src = 'assets/patchup_couple.jpg';
      reconciliationImg.alt = 'Garden Peace Offering';
      if (reconciliationBadge) reconciliationBadge.textContent = 'Garden Peace Offering 🌸';
      if (reconciliationCaption) reconciliationCaption.textContent = 'A peaceful blooming garden promise with dancing butterflies.';
    } else {
      reconciliationImg.src = 'assets/patchup_kittens.jpg';
      reconciliationImg.alt = 'Mending Hearts Kittens';
      if (reconciliationBadge) reconciliationBadge.textContent = 'Mending Hearts ✨';
      if (reconciliationCaption) reconciliationCaption.textContent = 'Piecing back our sweet memories together with endless love and cuddles.';
    }
  }

  // 3. Audio synthesis for pleasant chime effect
  function playChimeSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
      });
    } catch(e) {}
  }

  function playConfettiSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.75);
      });
    } catch(e) {}
  }

  // 4. Envelope Opening & Transition to Letter
  const envelopeBox = document.getElementById('envelopeBox');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const sceneEnvelope = document.getElementById('sceneEnvelope');
  const sceneLetter = document.getElementById('sceneLetter');
  const btnFoldBack = document.getElementById('btnFoldBack');

  let isOpening = false;

  function triggerEnvelopeOpen() {
    if (isOpening) return;
    isOpening = true;

    if (envelopeBox) {
      envelopeBox.style.transform = 'scale(0.96)';
      envelopeBox.style.transition = 'transform 0.15s ease';
    }

    if (window.saybymeBgm) {
      window.saybymeBgm.play();
    }

    // Direct immediate transition to next page (letter.html) without showing letter shade/delay
    const t = Date.now();
    const nextUrl = slug ? `letter.html?slug=${slug}&t=${t}` : `letter.html?t=${t}`;
    window.location.href = nextUrl;
  }

  function triggerEnvelopeFoldBack() {
    isOpening = false;
    sceneLetter.style.display = 'none';
    sceneEnvelope.style.display = 'flex';
    sceneEnvelope.classList.remove('fade-out');
    envelopeBox.classList.remove('opened');
  }

  if (envelopeBox) envelopeBox.addEventListener('click', triggerEnvelopeOpen);
  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerEnvelopeOpen();
    });
  }
  if (btnFoldBack) btnFoldBack.addEventListener('click', triggerEnvelopeFoldBack);

  // 5. Confetti Shower
  function burstSealConfetti() {
    for (let i = 0; i < 30; i++) {
      const conf = document.createElement('div');
      conf.textContent = ['💖', '💕', '✨', '🌸', '♥'][Math.floor(Math.random() * 5)];
      conf.style.position = 'fixed';
      conf.style.left = '50%';
      conf.style.top = '48%';
      conf.style.fontSize = `${14 + Math.random() * 16}px`;
      conf.style.pointerEvents = 'none';
      conf.style.zIndex = '999';
      conf.style.transition = 'all 0.9s cubic-bezier(0.2, 0.8, 0.4, 1)';
      document.body.appendChild(conf);

      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 150;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        conf.style.transform = `translate(${destX}px, ${destY}px) scale(${0.8 + Math.random() * 0.5})`;
        conf.style.opacity = '0';
      });

      setTimeout(() => conf.remove(), 950);
    }
  }

  // 6. Interactive Forgiveness
  const btnForgiveYes = document.getElementById('btnForgiveYes');
  const btnForgiveHug = document.getElementById('btnForgiveHug');
  const forgivenBanner = document.getElementById('forgivenBanner');

  if (btnForgiveYes) {
    btnForgiveYes.addEventListener('click', () => {
      playConfettiSound();
      burstCelebrationConfetti();
      btnForgiveYes.textContent = 'Forgiven Forever! 💕';
      btnForgiveYes.style.background = '#2cb579';
      if (forgivenBanner) {
        forgivenBanner.style.display = 'block';
        forgivenBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  if (btnForgiveHug) {
    btnForgiveHug.addEventListener('click', () => {
      playChimeSound();
      burstHugEmojis();
      btnForgiveHug.textContent = 'Big Warm Hug Sent! 🫂';
      btnForgiveHug.style.borderColor = '#2cb579';
      btnForgiveHug.style.color = '#2cb579';
    });
  }

  function burstCelebrationConfetti() {
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.textContent = ['🎉', '💖', '🥰', '💕', '🌸', '✨'][Math.floor(Math.random() * 6)];
      el.style.position = 'fixed';
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = '-20px';
      el.style.fontSize = `${16 + Math.random() * 18}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      el.style.transition = `transform ${2 + Math.random() * 2}s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.2s ease`;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 3500);
    }
  }

  function burstHugEmojis() {
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      el.textContent = ['🫂', '💕', '🥰', '🌸'][Math.floor(Math.random() * 4)];
      el.style.position = 'fixed';
      el.style.left = `${35 + Math.random() * 30}%`;
      el.style.bottom = '100px';
      el.style.fontSize = `${20 + Math.random() * 14}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      el.style.transition = `transform 1.6s ease-out, opacity 1.6s ease-out`;
      document.body.appendChild(el);

      const offsetX = (Math.random() - 0.5) * 180;
      requestAnimationFrame(() => {
        el.style.transform = `translate(${offsetX}px, -280px) scale(1.2)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1800);
    }
  }

  // 7. Audio Button managed by bgm.js
});
