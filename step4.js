// SayByMe – Step 4: Choose Patch-up Animation & Style Controller
document.addEventListener('DOMContentLoaded', () => {
  const animCards = [...document.querySelectorAll('.anim-card')];
  const stickerBtns = [...document.querySelectorAll('.sticker-btn')];
  const form = document.getElementById('styleForm');

  let activeAnim = 'kittens';
  let activeSticker = '💖 100% Sincere';

  // Restore saved choice if any
  const savedAnim = sessionStorage.getItem('saybyme_patchup_theme');
  if (savedAnim) {
    activeAnim = savedAnim;
    animCards.forEach(c => {
      const isMatch = c.dataset.anim === savedAnim;
      c.classList.toggle('selected', isMatch);
      const radio = c.querySelector('input[type="radio"]');
      if (radio) radio.checked = isMatch;
    });
  }

  const savedSticker = sessionStorage.getItem('saybyme_patchup_sticker');
  if (savedSticker) {
    activeSticker = savedSticker;
    stickerBtns.forEach(btn => {
      const btnText = btn.dataset.sticker;
      btn.classList.toggle('active', btnText === savedSticker || btn.textContent.includes(savedSticker));
    });
  }

  // Animation card selection
  animCards.forEach(card => {
    card.addEventListener('click', () => {
      animCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      activeAnim = card.dataset.anim;
    });
  });

  // Sticker button selection
  stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stickerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSticker = btn.dataset.sticker || btn.textContent.trim();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sessionStorage.setItem('saybyme_patchup_theme', activeAnim);
    sessionStorage.setItem('saybyme_patchup_sticker', activeSticker);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Saving to Convex…</span>';
    }

    const recipient = sessionStorage.getItem('saybyme_user_name') || 'b';
    const sender = sessionStorage.getItem('saybyme_sender_name') || 'a';
    const whatHappened = sessionStorage.getItem('saybyme_apology_reason') || 'I am sorry for what happened';
    const message = sessionStorage.getItem('saybyme_apology_message') || 'I apologize from the bottom of my heart';

    try {
      if (typeof saveApologyToConvex === 'function') {
        const res = await saveApologyToConvex({
          senderName: sender,
          recipientName: recipient,
          whatHappened: whatHappened,
          message: message,
          theme: activeAnim,
          sticker: activeSticker
        });
        if (res && res.slug) {
          window.location.href = `step5.html?slug=${res.slug}`;
          return;
        }
      }
    } catch(err) {
      console.warn("Convex save fallback:", err);
    }
    window.location.href = 'step5.html';
  });
});
