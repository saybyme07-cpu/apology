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

  // =========================================================================
  // RAZORPAY LIVE PAYMENT & PRIVATE LINK UNLOCK (₹99)
  // =========================================================================
  const RAZORPAY_LIVE_KEY = 'rzp_live_U40IbdT5uMc3ZW';
  const PAYMENT_AMOUNT_INR = 99;
  const PAYMENT_AMOUNT_PAISE = 9900; // 99 INR in paise

  const btnContinueFinal = document.getElementById('btnContinueFinal');
  const btnUnlockText = document.getElementById('btnUnlockText');
  const unlockPromptView = document.getElementById('unlockPromptView');
  const unlockSuccessView = document.getElementById('unlockSuccessView');
  const unlockedRecipientName = document.getElementById('unlockedRecipientName');
  const unlockedUrlInput = document.getElementById('unlockedUrlInput');
  const btnCopyInline = document.getElementById('btnCopyInline');
  const copyInlineText = document.getElementById('copyInlineText');
  const btnOpenLivePreview = document.getElementById('btnOpenLivePreview');
  const btnShareWhatsAppInline = document.getElementById('btnShareWhatsAppInline');

  // Modal elements
  const linkModalOverlay = document.getElementById('linkModalOverlay');
  const linkModalClose = document.getElementById('linkModalClose');
  const modalRecipientDisplay = document.getElementById('modalRecipientDisplay');
  const modalUrlInput = document.getElementById('modalUrlInput');
  const modalCopyBtn = document.getElementById('modalCopyBtn');
  const modalCopyText = document.getElementById('modalCopyText');
  const modalOpenPreviewBtn = document.getElementById('modalOpenPreviewBtn');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  function copyTextToClipboard(text, btnElement, labelElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (labelElement) {
        const orig = labelElement.textContent;
        labelElement.textContent = '✓ Copied!';
        setTimeout(() => { labelElement.textContent = orig; }, 2200);
      }
    }).catch(() => {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
        if (labelElement) {
          const orig = labelElement.textContent;
          labelElement.textContent = '✓ Copied!';
          setTimeout(() => { labelElement.textContent = orig; }, 2200);
        }
      } catch (e) {}
      document.body.removeChild(tempInput);
    });
  }

  // Dynamically load Razorpay SDK if not already loaded
  function loadRazorpaySDK() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  // Generate and reveal private preview link after successful payment
  async function generateAndRevealPrivateLink(paymentDetails = {}, autoOpenModal = true) {
    if (btnUnlockText) btnUnlockText.textContent = 'Generating Private Link... ✨';

    let finalSlug = slug;
    if (!finalSlug && typeof saveApologyToConvex === 'function') {
      try {
        const saved = await saveApologyToConvex({
          senderName: sender,
          recipientName: recipient,
          whatHappened: whatHappened,
          message: message,
          theme: theme,
          sticker: sticker
        });
        if (saved && saved.slug) {
          finalSlug = saved.slug;
          sessionStorage.setItem('saybyme_apology_slug', finalSlug);
        }
      } catch (err) {
        console.warn("Could not save to Convex:", err);
      }
    }

    // If slug is still missing (offline or Convex unavailable), create robust unique slug
    if (!finalSlug) {
      finalSlug = 'apology_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('saybyme_apology_slug', finalSlug);
    }

    // Generate Proper Absolute Web Application Preview Link
    const previewUrlObj = new URL('preview.html', window.location.href);
    previewUrlObj.searchParams.set('slug', finalSlug);
    if (sender) previewUrlObj.searchParams.set('from', sender);
    if (recipient) previewUrlObj.searchParams.set('for', recipient);
    if (whatHappened) previewUrlObj.searchParams.set('why', whatHappened);
    if (message) previewUrlObj.searchParams.set('msg', message);
    if (theme) previewUrlObj.searchParams.set('theme', theme);
    if (sticker) previewUrlObj.searchParams.set('sticker', sticker);

    const shareUrl = previewUrlObj.href;

    // Update Iframe with live link
    if (phoneIframe) {
      phoneIframe.src = shareUrl;
    }

    // Populate Inline Unlocked Result Box
    if (unlockedRecipientName) unlockedRecipientName.textContent = recipient;
    if (unlockedUrlInput) unlockedUrlInput.value = shareUrl;
    if (btnOpenLivePreview) btnOpenLivePreview.href = shareUrl;
    if (btnShareWhatsAppInline) {
      btnShareWhatsAppInline.href = `https://api.whatsapp.com/send?text=${encodeURIComponent('I made something special for you ♡\n' + shareUrl)}`;
    }

    if (unlockPromptView) unlockPromptView.style.display = 'none';
    if (unlockSuccessView) unlockSuccessView.style.display = 'block';

    // Populate and Display Celebratory Modal Popup
    if (modalRecipientDisplay) modalRecipientDisplay.textContent = recipient;
    if (modalUrlInput) modalUrlInput.value = shareUrl;
    if (modalOpenPreviewBtn) modalOpenPreviewBtn.href = shareUrl;
    if (modalWhatsAppBtn) {
      modalWhatsAppBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent('I made something special for you ♡\n' + shareUrl)}`;
    }

    if (autoOpenModal && linkModalOverlay) {
      linkModalOverlay.style.display = 'flex';
    }

    // Auto-copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (copyInlineText) copyInlineText.textContent = '✓ Copied!';
      if (modalCopyText) modalCopyText.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => {
        if (copyInlineText) copyInlineText.textContent = 'Copy';
        if (modalCopyText) modalCopyText.textContent = 'Copy Link';
      }, 2500);
    } catch (err) {}
  }

  // Razorpay Checkout Trigger
  if (btnContinueFinal) {
    btnContinueFinal.addEventListener('click', async () => {
      btnContinueFinal.disabled = true;
      if (btnUnlockText) btnUnlockText.textContent = 'Opening Payment... 🔒';
      btnContinueFinal.style.opacity = '0.9';

      // 1. Try creating an Order via backend Serverless API
      let orderId = null;
      try {
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: PAYMENT_AMOUNT_PAISE })
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData && orderData.orderId) {
            orderId = orderData.orderId;
            console.log('Razorpay Order created:', orderId);
          }
        }
      } catch (err) {
        console.warn('Backend order creation unavailable (local or offline), using direct client checkout:', err);
      }

      // 2. Ensure Razorpay SDK is available
      const sdkReady = await loadRazorpaySDK();
      if (!sdkReady || typeof window.Razorpay !== 'function') {
        alert('Payment gateway could not be loaded. Please check your internet connection.');
        btnContinueFinal.disabled = false;
        if (btnUnlockText) btnUnlockText.textContent = 'Pay ₹99 & Unlock Link';
        btnContinueFinal.style.opacity = '1';
        return;
      }

      // 3. Configure Razorpay Options (Live Key & ₹99)
      const options = {
        key: RAZORPAY_LIVE_KEY,
        amount: PAYMENT_AMOUNT_PAISE,
        currency: 'INR',
        name: 'SayByMe',
        description: 'Unlock Private Apology Link (₹99)',
        image: 'images/mascot-bear-transparent.png',
        handler: async function (response) {
          console.log('Payment successful! Payment ID:', response.razorpay_payment_id);
          sessionStorage.setItem('saybyme_payment_status', 'completed');
          if (response.razorpay_payment_id) {
            sessionStorage.setItem('saybyme_payment_id', response.razorpay_payment_id);
          }
          await generateAndRevealPrivateLink(response, true);
        },
        prefill: {
          name: sender || '',
          email: '',
          contact: ''
        },
        notes: {
          sender_name: sender,
          recipient_name: recipient,
          purpose: 'SayByMe Apology Private Link'
        },
        theme: {
          color: '#d81b4f'
        },
        modal: {
          ondismiss: function () {
            btnContinueFinal.disabled = false;
            if (btnUnlockText) btnUnlockText.textContent = 'Pay ₹99 & Unlock Link';
            btnContinueFinal.style.opacity = '1';
          }
        }
      };

      if (orderId) {
        options.order_id = orderId;
      }

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failResp) {
          console.error('Razorpay payment failed:', failResp);
          const desc = (failResp && failResp.error && failResp.error.description) || 'Payment cancelled or unsuccessful.';
          alert('Payment Failed: ' + desc);
          btnContinueFinal.disabled = false;
          if (btnUnlockText) btnUnlockText.textContent = 'Pay ₹99 & Unlock Link';
          btnContinueFinal.style.opacity = '1';
        });
        rzp.open();
      } catch (err) {
        console.error('Failed to open Razorpay modal:', err);
        alert('Could not open payment dialog. Please try again.');
        btnContinueFinal.disabled = false;
        if (btnUnlockText) btnUnlockText.textContent = 'Pay ₹99 & Unlock Link';
        btnContinueFinal.style.opacity = '1';
      }
    });
  }

  // If already paid in this session, keep the link unlocked
  if (sessionStorage.getItem('saybyme_payment_status') === 'completed') {
    generateAndRevealPrivateLink({ razorpay_payment_id: sessionStorage.getItem('saybyme_payment_id') }, false);
  }

  // Inline Copy Button
  if (btnCopyInline && unlockedUrlInput) {
    btnCopyInline.addEventListener('click', () => {
      copyTextToClipboard(unlockedUrlInput.value, btnCopyInline, copyInlineText);
    });
  }

  // Modal Copy Button
  if (modalCopyBtn && modalUrlInput) {
    modalCopyBtn.addEventListener('click', () => {
      copyTextToClipboard(modalUrlInput.value, modalCopyBtn, modalCopyText);
    });
  }

  // Close Modal
  if (linkModalClose && linkModalOverlay) {
    linkModalClose.addEventListener('click', () => {
      linkModalOverlay.style.display = 'none';
    });
  }

  if (linkModalOverlay) {
    linkModalOverlay.addEventListener('click', (e) => {
      if (e.target === linkModalOverlay) {
        linkModalOverlay.style.display = 'none';
      }
    });
  }
});
