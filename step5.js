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

  const summaryMessageType = document.getElementById('summaryMessageType');
  if (summaryMessageType) summaryMessageType.textContent = 'Apology';

  // Ensure Chips in summary match design: Sorry Letter, Cute GIFs, Heart Animation
  const playsChips = document.getElementById('playsChips');
  if (playsChips && !playsChips.querySelector('.chip-letter')) {
    playsChips.innerHTML = `
      <span class="order-chip chip-letter"><span class="chip-emoji">💌</span> Sorry Letter</span>
      <span class="order-chip chip-gifs"><span class="chip-emoji">💖</span> Cute GIFs</span>
      <span class="order-chip chip-heart"><span class="chip-emoji">💗</span> Heart Animation</span>
    `;
  }

  // Floating Audio Toggle Button managed by bgm.js

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
