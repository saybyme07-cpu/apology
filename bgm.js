/**
 * SayByMe Universal Background Music & Speaker Control
 * Plays "The Open Sky" throughout the entire experience:
 * All Entry creation steps (index, step2, step3, step4, step5)
 * and Recipient experience (preview, letter, forgive, patch-heart).
 */
(function() {
  const AUDIO_SRC = 'assets/The-Open-Sky-chosic.com_.mp3';
  const STORAGE_MUTED_KEY = 'saybyme_audio_muted';
  const STORAGE_TIME_KEY = 'saybyme_audio_time';

  // SVG Icons
  const PLAYING_ICON = `
    <svg class="audio-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fdf2f4"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`;

  const MUTED_ICON = `
    <svg class="audio-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fdf2f4"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>`;

  function injectStyles() {
    if (document.getElementById('saybyme-bgm-styles')) return;
    const style = document.createElement('style');
    style.id = 'saybyme-bgm-styles';
    style.textContent = `
      .audio-btn, .floating-audio-btn {
        position: fixed !important;
        bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
        right: calc(18px + env(safe-area-inset-right, 0px)) !important;
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.94) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        border: 1.5px solid rgba(240, 68, 111, 0.3) !important;
        box-shadow: 0 4px 16px rgba(216, 27, 79, 0.18) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 999999 !important;
        padding: 0 !important;
        outline: none !important;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s, box-shadow 0.2s !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      .audio-btn:hover, .floating-audio-btn:hover {
        transform: scale(1.08) !important;
        background: #ffffff !important;
        box-shadow: 0 6px 20px rgba(216, 27, 79, 0.25) !important;
      }
      .audio-btn:active, .floating-audio-btn:active {
        transform: scale(0.92) !important;
      }
      .audio-btn svg, .floating-audio-btn svg {
        pointer-events: none !important;
        display: block !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function initBgm() {
    injectStyles();

    // 1. Get or create <audio id="bgmAudio">
    let audio = document.getElementById('bgmAudio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'bgmAudio';
      (document.body || document.documentElement).appendChild(audio);
    }
    audio.loop = true;
    audio.preload = 'auto';

    // Ensure audio src is The Open Sky
    const currentSrc = audio.getAttribute('src') || audio.src;
    if (!currentSrc || !currentSrc.includes('The-Open-Sky') && !currentSrc.includes('the-open-sky')) {
      audio.src = AUDIO_SRC;
    }

    // Restore saved playback time so music continues seamlessly
    const savedTime = parseFloat(sessionStorage.getItem(STORAGE_TIME_KEY));
    if (!isNaN(savedTime) && savedTime > 0) {
      try {
        audio.currentTime = savedTime;
      } catch (e) {}
    }

    // Persist current playback time
    const persistTime = () => {
      if (audio && !audio.paused && !isNaN(audio.currentTime)) {
        sessionStorage.setItem(STORAGE_TIME_KEY, audio.currentTime.toString());
      }
    };
    audio.addEventListener('timeupdate', persistTime);
    window.addEventListener('beforeunload', persistTime);
    window.addEventListener('pagehide', persistTime);

    // 2. Get or create floating audio button
    let btn = document.getElementById('audioBtn') || document.getElementById('audioToggleBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'audio-btn';
      btn.id = 'audioBtn';
      (document.body || document.documentElement).appendChild(btn);
    }

    function updateBtnUI(isPlaying) {
      if (!btn) return;
      btn.innerHTML = isPlaying ? PLAYING_ICON : MUTED_ICON;
      const label = isPlaying ? 'Mute background music' : 'Play background music';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }

    const isUserMuted = () => sessionStorage.getItem(STORAGE_MUTED_KEY) === 'true';

    function tryPlay() {
      if (isUserMuted()) {
        updateBtnUI(false);
        return;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updateBtnUI(true);
        }).catch(() => {
          // Autoplay policy: will start on first user interaction
          updateBtnUI(false);
        });
      }
    }

    // Initial attempt
    tryPlay();

    // Autoplay fallback: start on very first user interaction
    const triggerOnFirstGesture = () => {
      if (!isUserMuted() && audio.paused) {
        audio.play().then(() => {
          updateBtnUI(true);
        }).catch(() => {});
      }
    };
    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
      window.addEventListener(evt, triggerOnFirstGesture, { capture: true, once: true });
    });

    // Handle button click toggle
    btn.onclick = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!audio.paused) {
        audio.pause();
        sessionStorage.setItem(STORAGE_MUTED_KEY, 'true');
        updateBtnUI(false);
      } else {
        sessionStorage.setItem(STORAGE_MUTED_KEY, 'false');
        audio.play().then(() => {
          updateBtnUI(true);
        }).catch(() => {});
      }
    };

    audio.addEventListener('play', () => updateBtnUI(true));
    audio.addEventListener('pause', () => updateBtnUI(false));

    window.saybymeBgm = {
      audio: audio,
      btn: btn,
      play: () => {
        sessionStorage.setItem(STORAGE_MUTED_KEY, 'false');
        return audio.play();
      },
      pause: () => {
        sessionStorage.setItem(STORAGE_MUTED_KEY, 'true');
        audio.pause();
      },
      toggle: () => btn.click(),
      isPlaying: () => !audio.paused
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBgm);
  } else {
    initBgm();
  }
})();
