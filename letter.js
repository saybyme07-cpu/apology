// SayByMe – 100% Static Box with Smooth Typewriter Controller
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || sessionStorage.getItem('saybyme_apology_slug') || sessionStorage.getItem('saybyme_proposal_slug');

  // 1. Data Defaults from Session / Fallback
  let recipient = sessionStorage.getItem('saybyme_user_name') || 'b';
  let sender = sessionStorage.getItem('saybyme_sender_name') || 'a';
  let whatHappened = sessionStorage.getItem('saybyme_apology_reason') || 'I ignored their messages.';
  let apologyMessage = sessionStorage.getItem('saybyme_apology_message') || "I'm sorry for my behavior. It won't happen again. You're important to me. I'm sorry for the misunderstanding. I never wanted to upset you. Let's move forward together.";
  
  const specialMessage1 = "I never want a silly mistake or a moment of anger to make you question how special you are to me.";
  const specialMessage2 = "Sending you the biggest virtual hug, a little heart and the most genuine sorry I can give";
  const specialMessage3 = "Hope someday this becomes just a little bump in our beautiful story, not the end of it.";

  // Populate names across all stages
  document.querySelectorAll('.recipient-name').forEach(el => el.textContent = recipient);
  document.querySelectorAll('.sender-name').forEach(el => el.textContent = sender);

  // Background Convex fetch (updates smoothly if live record exists)
  if (slug && typeof getApologyFromConvex === 'function') {
    getApologyFromConvex(slug).then(data => {
      if (data) {
        if (data.recipientName) {
          recipient = data.recipientName;
          document.querySelectorAll('.recipient-name').forEach(el => el.textContent = recipient);
        }
        if (data.senderName) {
          sender = data.senderName;
          document.querySelectorAll('.sender-name').forEach(el => el.textContent = sender);
        }
        if (data.whatHappened) whatHappened = data.whatHappened;
        if (data.message) apologyMessage = data.message;
      }
    }).catch(e => console.warn('Convex background sync:', e));
  }

  // 2. Play gentle opening chime
  function playPaperChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
      });
    } catch(e) {}
  }

  const bgm = document.getElementById('bgmAudio');
  if (bgm) {
    if (sessionStorage.getItem('saybyme_audio_muted') !== 'true') {
      bgm.play().then(() => { isAudioPlaying = true; }).catch(() => {});
      const playOnGesture = () => {
        if (sessionStorage.getItem('saybyme_audio_muted') !== 'true' && bgm.paused) {
          bgm.play().then(() => { isAudioPlaying = true; }).catch(() => {});
        }
      };
      window.addEventListener('click', playOnGesture, { capture: true, once: true });
      window.addEventListener('touchstart', playOnGesture, { capture: true, once: true });
    }
  }

  // Helper to make the message box 100% STATIC so it never resizes, expands, or bounces while typing
  function lockStaticBox(blockEl, textEl, fullText) {
    if (!blockEl || !textEl) return;
    textEl.textContent = fullText;
    const h = blockEl.offsetHeight;
    if (h > 0) {
      blockEl.style.height = h + 'px';
      blockEl.style.minHeight = h + 'px';
    }
    textEl.textContent = '';
  }

  const typingSpeed = 20;

  // STAGE ELEMENTS
  // Stage 1
  const stage1 = document.getElementById('stageWhatHappened');
  const block1 = document.querySelector('.what-happened-block');
  const typed1 = document.getElementById('typedWhatHappened');
  const cursor1 = document.getElementById('cursor1');
  const sheet1 = document.getElementById('sheet1');
  const btnNextToApology = document.getElementById('btnNextToApology');

  // Stage 2
  const stage2 = document.getElementById('stageApology');
  const rollDownStage2 = document.getElementById('rollDownStage2');
  const block2 = document.querySelector('.apology-block');
  const typed2 = document.getElementById('typedApologyMessage');
  const cursor2 = document.getElementById('cursor2');
  const sheet2 = document.getElementById('sheet2');
  const btnNextFromApology = document.getElementById('btnNextFromApology');

  // Stage 3 (Special Message 1 - Sorry Bear GIF)
  const stage3 = document.getElementById('stageSpecial');
  const rollDownStage3 = document.getElementById('rollDownStage3');
  const block3 = document.querySelector('.special-block');
  const typed3 = document.getElementById('typedSpecialMessage');
  const cursor3 = document.getElementById('cursor3');
  const sheet3 = document.getElementById('sheet3');
  const btnNextToHug = document.getElementById('btnNextToHug');

  // Stage 4 (Special Message 2 - Bear Hug GIF)
  const stage4 = document.getElementById('stageHug');
  const rollDownStage4 = document.getElementById('rollDownStage4');
  const block4 = document.querySelector('.hug-block');
  const typed4 = document.getElementById('typedHugMessage');
  const cursor4 = document.getElementById('cursor4');
  const sheet4 = document.getElementById('sheet4');
  const btnNextToStory = document.getElementById('btnNextToStory');

  // Stage 5 (Special Message 3 - Story Couple GIF)
  const stage5 = document.getElementById('stageStory');
  const rollDownStage5 = document.getElementById('rollDownStage5');
  const block5 = document.querySelector('.story-block');
  const typed5 = document.getElementById('typedStoryMessage');
  const cursor5 = document.getElementById('cursor5');
  const sheet5 = document.getElementById('sheet5');
  const btnNextToForgive = document.getElementById('btnNextToForgive');

  // Stage 1 Typing
  let isTyping1 = false, timer1 = null;
  function finishStage1Immediately() {
    clearTimeout(timer1); isTyping1 = false;
    if (typed1) typed1.textContent = whatHappened;
    if (cursor1) cursor1.classList.add('done');
  }
  function typeWhatHappened(idx) {
    if (!isTyping1) return;
    if (idx < whatHappened.length) {
      typed1.textContent += whatHappened.charAt(idx);
      timer1 = setTimeout(() => typeWhatHappened(idx + 1), typingSpeed);
    } else {
      if (cursor1) cursor1.classList.add('done');
      isTyping1 = false;
    }
  }
  if (sheet1) sheet1.addEventListener('click', finishStage1Immediately);

  // Stage 2 Typing
  let isTyping2 = false, timer2 = null;
  function finishStage2Immediately() {
    clearTimeout(timer2); isTyping2 = false;
    if (typed2) typed2.textContent = apologyMessage;
    if (cursor2) cursor2.classList.add('done');
  }
  function typeApology(idx) {
    if (!isTyping2) return;
    if (idx < apologyMessage.length) {
      typed2.textContent += apologyMessage.charAt(idx);
      timer2 = setTimeout(() => typeApology(idx + 1), typingSpeed);
    } else {
      if (cursor2) cursor2.classList.add('done');
      isTyping2 = false;
    }
  }
  if (sheet2) sheet2.addEventListener('click', finishStage2Immediately);

  // Stage 3 Typing
  let isTyping3 = false, timer3 = null;
  function finishStage3Immediately() {
    clearTimeout(timer3); isTyping3 = false;
    if (typed3) typed3.textContent = specialMessage1;
    if (cursor3) cursor3.classList.add('done');
  }
  function typeSpecial1(idx) {
    if (!isTyping3) return;
    if (idx < specialMessage1.length) {
      typed3.textContent += specialMessage1.charAt(idx);
      timer3 = setTimeout(() => typeSpecial1(idx + 1), typingSpeed);
    } else {
      if (cursor3) cursor3.classList.add('done');
      isTyping3 = false;
    }
  }
  if (sheet3) sheet3.addEventListener('click', finishStage3Immediately);

  // Stage 4 Typing
  let isTyping4 = false, timer4 = null;
  function finishStage4Immediately() {
    clearTimeout(timer4); isTyping4 = false;
    if (typed4) typed4.textContent = specialMessage2;
    if (cursor4) cursor4.classList.add('done');
  }
  function typeSpecial2(idx) {
    if (!isTyping4) return;
    if (idx < specialMessage2.length) {
      typed4.textContent += specialMessage2.charAt(idx);
      timer4 = setTimeout(() => typeSpecial2(idx + 1), typingSpeed);
    } else {
      if (cursor4) cursor4.classList.add('done');
      isTyping4 = false;
    }
  }
  if (sheet4) sheet4.addEventListener('click', finishStage4Immediately);

  // Stage 5 Typing
  let isTyping5 = false, timer5 = null;
  function finishStage5Immediately() {
    clearTimeout(timer5); isTyping5 = false;
    if (typed5) typed5.textContent = specialMessage3;
    if (cursor5) cursor5.classList.add('done');
  }
  function typeSpecial3(idx) {
    if (!isTyping5) return;
    if (idx < specialMessage3.length) {
      typed5.textContent += specialMessage3.charAt(idx);
      timer5 = setTimeout(() => typeSpecial3(idx + 1), typingSpeed);
    } else {
      if (cursor5) cursor5.classList.add('done');
      isTyping5 = false;
    }
  }
  if (sheet5) sheet5.addEventListener('click', finishStage5Immediately);

  // -------------------------------------------------------------
  // TRANSITIONS
  // -------------------------------------------------------------

  // Transition: Stage 1 -> Stage 2
  if (btnNextToApology) {
    btnNextToApology.addEventListener('click', () => {
      stage1.style.opacity = '0';
      stage1.style.transform = 'translateY(-12px)';

      setTimeout(() => {
        stage1.style.display = 'none';
        stage2.style.display = 'flex';
        stage2.style.opacity = '0';
        stage2.style.transform = 'translateY(12px)';

        lockStaticBox(block2, typed2, apologyMessage);
        if (cursor2) cursor2.classList.remove('done');

        requestAnimationFrame(() => {
          stage2.style.opacity = '1';
          stage2.style.transform = 'translateY(0)';
          
          if (rollDownStage2) rollDownStage2.classList.add('is-rolling');
          playPaperChime();

          setTimeout(() => {
            isTyping2 = true;
            typeApology(0);
          }, 1700);
        });
      }, 250);
    });
  }

  // Transition: Stage 2 -> Stage 3 (Sorry Bear GIF)
  if (btnNextFromApology) {
    btnNextFromApology.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();

      stage2.style.opacity = '0';
      stage2.style.transform = 'translateY(-12px)';

      setTimeout(() => {
        stage2.style.display = 'none';
        stage3.style.display = 'flex';
        stage3.style.opacity = '0';
        stage3.style.transform = 'translateY(12px)';

        lockStaticBox(block3, typed3, specialMessage1);
        if (cursor3) cursor3.classList.remove('done');

        requestAnimationFrame(() => {
          stage3.style.opacity = '1';
          stage3.style.transform = 'translateY(0)';
          
          if (rollDownStage3) rollDownStage3.classList.add('is-rolling');
          playPaperChime();

          setTimeout(() => {
            isTyping3 = true;
            typeSpecial1(0);
          }, 1700);
        });
      }, 250);
    });
  }

  // Transition: Stage 3 -> Stage 4 (Bear Hug GIF)
  if (btnNextToHug) {
    btnNextToHug.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();

      stage3.style.opacity = '0';
      stage3.style.transform = 'translateY(-12px)';

      setTimeout(() => {
        stage3.style.display = 'none';
        stage4.style.display = 'flex';
        stage4.style.opacity = '0';
        stage4.style.transform = 'translateY(12px)';

        lockStaticBox(block4, typed4, specialMessage2);
        if (cursor4) cursor4.classList.remove('done');

        requestAnimationFrame(() => {
          stage4.style.opacity = '1';
          stage4.style.transform = 'translateY(0)';
          
          if (rollDownStage4) rollDownStage4.classList.add('is-rolling');
          playPaperChime();

          setTimeout(() => {
            isTyping4 = true;
            typeSpecial2(0);
          }, 1700);
        });
      }, 250);
    });
  }

  // Transition: Stage 4 -> Stage 5 (Story Couple GIF)
  if (btnNextToStory) {
    btnNextToStory.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();

      stage4.style.opacity = '0';
      stage4.style.transform = 'translateY(-12px)';

      setTimeout(() => {
        stage4.style.display = 'none';
        stage5.style.display = 'flex';
        stage5.style.opacity = '0';
        stage5.style.transform = 'translateY(12px)';

        lockStaticBox(block5, typed5, specialMessage3);
        if (cursor5) cursor5.classList.remove('done');

        requestAnimationFrame(() => {
          stage5.style.opacity = '1';
          stage5.style.transform = 'translateY(0)';
          
          if (rollDownStage5) rollDownStage5.classList.add('is-rolling');
          playPaperChime();

          setTimeout(() => {
            isTyping5 = true;
            typeSpecial3(0);
          }, 1700);
        });
      }, 250);
    });
  }

  // Transition: Stage 5 -> forgive.html (Patch the Heart Page)
  if (btnNextToForgive) {
    btnNextToForgive.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();

      stage5.style.opacity = '0';
      stage5.style.transform = 'translateY(-12px)';

      setTimeout(() => {
        const t = Date.now();
        const targetUrl = slug ? `forgive.html?slug=${encodeURIComponent(slug)}&t=${t}` : `forgive.html?t=${t}`;
        window.location.href = targetUrl;
      }, 200);
    });
  }

  // Audio Control Toggle Button
  const audioBtn = document.getElementById('audioBtn');
  let isAudioPlaying = false;
  if (audioBtn && bgm) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAudioPlaying) {
        bgm.pause();
        isAudioPlaying = false;
        sessionStorage.setItem('saybyme_audio_muted', 'true');
        audioBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        `;
      } else {
        sessionStorage.setItem('saybyme_audio_muted', 'false');
        bgm.play().then(() => {
          isAudioPlaying = true;
          audioBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d12957" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
        }).catch(() => {});
      }
    });
  }

  // Direct page parameter check: ?page=5 or ?page=4 or ?page=3 allows testing directly!
  const targetPage = urlParams.get('page') || urlParams.get('stage');
  if (targetPage === '5' || targetPage === 'story') {
    stage1.style.display = 'none';
    stage2.style.display = 'none';
    stage3.style.display = 'none';
    stage4.style.display = 'none';
    stage5.style.display = 'flex';
    stage5.style.opacity = '1';
    stage5.style.transform = 'none';
    if (rollDownStage5) rollDownStage5.classList.add('is-rolling');
    lockStaticBox(block5, typed5, specialMessage3);
    setTimeout(() => {
      isTyping5 = true;
      typeSpecial3(0);
    }, 500);
  } else if (targetPage === '4' || targetPage === 'hug') {
    stage1.style.display = 'none';
    stage2.style.display = 'none';
    stage3.style.display = 'none';
    stage5.style.display = 'none';
    stage4.style.display = 'flex';
    stage4.style.opacity = '1';
    stage4.style.transform = 'none';
    if (rollDownStage4) rollDownStage4.classList.add('is-rolling');
    lockStaticBox(block4, typed4, specialMessage2);
    setTimeout(() => {
      isTyping4 = true;
      typeSpecial2(0);
    }, 500);
  } else if (targetPage === '3' || targetPage === 'special') {
    stage1.style.display = 'none';
    stage2.style.display = 'none';
    stage4.style.display = 'none';
    stage5.style.display = 'none';
    stage3.style.display = 'flex';
    stage3.style.opacity = '1';
    stage3.style.transform = 'none';
    if (rollDownStage3) rollDownStage3.classList.add('is-rolling');
    lockStaticBox(block3, typed3, specialMessage1);
    setTimeout(() => {
      isTyping3 = true;
      typeSpecial1(0);
    }, 500);
  } else if (targetPage === '2' || targetPage === 'apology') {
    stage1.style.display = 'none';
    stage3.style.display = 'none';
    stage4.style.display = 'none';
    stage5.style.display = 'none';
    stage2.style.display = 'flex';
    stage2.style.opacity = '1';
    stage2.style.transform = 'none';
    if (rollDownStage2) rollDownStage2.classList.add('is-rolling');
    lockStaticBox(block2, typed2, apologyMessage);
    setTimeout(() => {
      isTyping2 = true;
      typeApology(0);
    }, 500);
  } else {
    // Normal start on Stage 1
    lockStaticBox(block1, typed1, whatHappened);
    playPaperChime();
    if (cursor1) cursor1.classList.remove('done');
    setTimeout(() => {
      isTyping1 = true;
      typeWhatHappened(0);
    }, 1700);
  }
});
