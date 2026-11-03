// SayByMe – Step 5: Preview Controller with Convex Apologies Integration
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || sessionStorage.getItem('saybyme_apology_slug') || sessionStorage.getItem('saybyme_proposal_slug');

  let recipient = sessionStorage.getItem('saybyme_user_name') || 'b';
  let sender = sessionStorage.getItem('saybyme_sender_name') || 'a';
  let whatHappened = sessionStorage.getItem('saybyme_apology_reason') || 'Will you forgive me?';
  let message = sessionStorage.getItem('saybyme_apology_message') || "I'm so sorry for everything that happened. You mean the absolute world to me, and making things right with you is all I care about.";
  let theme = sessionStorage.getItem('saybyme_patchup_theme') || 'kittens';
  let sticker = sessionStorage.getItem('saybyme_patchup_sticker') || '💖 100% Sincere';

  // If slug exists, fetch live record from Convex apologies table
  if (slug && typeof getApologyFromConvex === 'function') {
    try {
      const data = await getApologyFromConvex(slug);
      if (data) {
        recipient = data.recipientName || recipient;
        sender = data.senderName || sender;
        whatHappened = data.whatHappened || data.question || whatHappened;
        message = data.message || message;
        theme = data.theme || (data.celebrations && data.celebrations[0]) || theme;
        sticker = data.sticker || (data.celebrations && data.celebrations[1]) || sticker;
      }
    } catch (e) {
      console.warn("Could not load from Convex apologies table:", e);
    }
  }

  // Phone Iframe Helper - Generates fresh preview URL from the start
  const phoneIframe = document.querySelector('.phone-live-iframe');

  function getPreviewUrl() {
    const params = new URLSearchParams();
    if (slug) params.set('slug', slug);
    params.set('t', Date.now());
    return `preview.html?${params.toString()}`;
  }

  // Initialize iframe with fresh source
  if (phoneIframe) {
    phoneIframe.src = getPreviewUrl();
  }

  // Replay from the start button
  const btnReplayAll = document.getElementById('btnReplayAll');
  if (btnReplayAll && phoneIframe) {
    btnReplayAll.addEventListener('click', (e) => {
      e.preventDefault();

      // Tactile button bounce & smooth rotation of replay SVG icon
      btnReplayAll.style.transform = 'scale(0.95)';
      const icon = btnReplayAll.querySelector('svg');
      if (icon) {
        icon.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        icon.style.transform = 'rotate(-360deg)';
      }

      // Reload iframe from preview.html starting state
      const freshUrl = getPreviewUrl();
      try {
        if (phoneIframe.contentWindow && phoneIframe.contentWindow.location) {
          phoneIframe.contentWindow.location.replace(freshUrl);
        } else {
          phoneIframe.src = freshUrl;
        }
      } catch (err) {
        phoneIframe.src = freshUrl;
      }

      setTimeout(() => {
        btnReplayAll.style.transform = '';
        if (icon) {
          icon.style.transition = 'none';
          icon.style.transform = 'none';
        }
      }, 600);
    });
  }

  // Populate Header
  const headerRecip = document.getElementById('headerRecipientName');
  if (headerRecip) headerRecip.textContent = recipient;

  // Populate Summary Card
  const summaryFrom = document.getElementById('summaryFrom');
  if (summaryFrom) summaryFrom.textContent = sender;

  const summaryFor = document.getElementById('summaryFor');
  if (summaryFor) summaryFor.textContent = recipient;

  const summaryQuestion = document.getElementById('summaryQuestion');
  if (summaryQuestion) summaryQuestion.textContent = whatHappened;

  // Update chips in summary
  const playsChips = document.getElementById('playsChips');
  if (playsChips) {
    const themeLabel = theme === 'garden' ? '🌸 Garden Peace Offering' : '✨ Mending Hearts Kittens';
    playsChips.innerHTML = `
      <span class="chip-badge chip-gif">${themeLabel}</span>
      <span class="chip-badge chip-fireworks">${sticker}</span>
    `;
  }

  // Floating Audio Toggle Button on Step 5
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const bgmAudio = document.getElementById('bgmAudio');
  let isPlaying = false;

  if (audioToggleBtn && bgmAudio) {
    audioToggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        bgmAudio.pause();
        isPlaying = false;
        audioToggleBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        `;
      } else {
        bgmAudio.play().then(() => {
          isPlaying = true;
          audioToggleBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
        }).catch(() => {});
      }
    });
  }

  // Continue Final Action -> Copy Live Shareable URL
  const btnContinueFinal = document.getElementById('btnContinueFinal');
  if (btnContinueFinal) {
    btnContinueFinal.addEventListener('click', async () => {
      let finalSlug = slug;
      if (!finalSlug && typeof saveApologyToConvex === 'function') {
        const saved = await saveApologyToConvex({
          senderName: sender,
          recipientName: recipient,
          whatHappened: whatHappened,
          message: message,
          theme: theme,
          sticker: sticker
        });
        if (saved) finalSlug = saved.slug;
      }

      const shareUrl = finalSlug
        ? `${window.location.origin}/preview.html?slug=${finalSlug}`
        : `${window.location.origin}/preview.html`;

      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`🎉 Copied your live Convex Apology link to clipboard!\n\n${shareUrl}\n\nSend this to ${recipient}!`);
      } catch (err) {
        prompt(`Here is your shareable Convex link for ${recipient}:`, shareUrl);
      }
    });
  }
});
