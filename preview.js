// SayByMe – Live Interactive Apology Experience Controller
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || sessionStorage.getItem('saybyme_apology_slug') || sessionStorage.getItem('saybyme_proposal_slug');

  // 1. Defaults from URL Params / Session / Fallback
  let recipient = urlParams.get('for') || urlParams.get('to') || urlParams.get('recipient') || sessionStorage.getItem('saybyme_user_name') || 's';
  let sender = urlParams.get('from') || urlParams.get('sender') || sessionStorage.getItem('saybyme_sender_name') || 'a';
  let reason = urlParams.get('why') || urlParams.get('reason') || urlParams.get('question') || sessionStorage.getItem('saybyme_apology_reason') || 'I ignored their messages. I said something hurtful.';
  let message = urlParams.get('msg') || urlParams.get('message') || sessionStorage.getItem('saybyme_apology_message') || "I am truly, deeply sorry from the bottom of my heart. You mean everything to me, and my priority will always be protecting your smile and cherishing our relationship. I promise to listen better, understand deeper, and never take you for granted.";
  let sticker = urlParams.get('sticker') || sessionStorage.getItem('saybyme_patchup_sticker') || '💖 100% Sincere';
  let theme = urlParams.get('theme') || sessionStorage.getItem('saybyme_patchup_theme') || 'kittens';

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
    } catch (e) {
      console.warn("Convex load error in preview:", e);
    }
  }

  // 2. Populate Recipient Name in Heading
  const elRecipient = document.getElementById('recipientName');
  if (elRecipient) {
    elRecipient.textContent = recipient;
  }

  // 3. Audio & Transition Handler
  const btnPlayTrigger = document.getElementById('btnPlayTrigger');
  const introCenterGroup = document.getElementById('introCenterGroup');
  const introTeddyImg = document.getElementById('introTeddyImg');

  let isOpening = false;

  function triggerOpenExperience(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOpening) return;
    isOpening = true;

    // Start background music
    try {
      if (window.saybymeBgm && typeof window.saybymeBgm.play === 'function') {
        window.saybymeBgm.play();
      } else {
        const bgm = document.getElementById('bgmAudio');
        if (bgm) {
          bgm.play().catch(() => {});
        }
      }
    } catch (err) {}

    // Tactile micro-animation feedback
    if (btnPlayTrigger) {
      btnPlayTrigger.style.transform = 'translateX(-50%) scale(0.92)';
    }
    if (introCenterGroup) {
      introCenterGroup.style.transform = 'scale(0.96)';
      introCenterGroup.style.opacity = '0.7';
    }

    // Gentle heart burst
    burstFloatingHearts();

    // Smooth navigation to letter.html preserving all parameters
    setTimeout(() => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set('t', Date.now().toString());
      if (slug) nextParams.set('slug', slug);
      if (recipient) nextParams.set('for', recipient);
      if (sender) nextParams.set('from', sender);
      if (reason) nextParams.set('why', reason);
      if (message) nextParams.set('msg', message);
      if (theme) nextParams.set('theme', theme);
      if (sticker) nextParams.set('sticker', sticker);
      window.location.href = `letter.html?${nextParams.toString()}`;
    }, 220);
  }

  if (btnPlayTrigger) {
    btnPlayTrigger.addEventListener('click', triggerOpenExperience);
  }
  if (introCenterGroup) {
    introCenterGroup.addEventListener('click', triggerOpenExperience);
  }
  if (introTeddyImg) {
    introTeddyImg.addEventListener('click', triggerOpenExperience);
  }

  // 4. Subtle Floating Hearts Burst Effect on Click
  function burstFloatingHearts() {
    const symbols = ['💖', '💜', '🥺', '🌸', '✨', '💕'];
    for (let i = 0; i < 16; i++) {
      const el = document.createElement('div');
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.fontSize = `${14 + Math.random() * 16}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.4, 1)';
      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 120;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        el.style.transform = `translate(${destX}px, ${destY}px) scale(${0.8 + Math.random() * 0.4})`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 850);
    }
  }
});
