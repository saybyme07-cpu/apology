// SayByMe – Step 2: What happened? Multi-Select Interactive Controller
document.addEventListener('DOMContentLoaded', () => {
  const story = document.getElementById('story');
  const count = document.getElementById('count');
  const box   = document.getElementById('box');
  const msg   = document.getElementById('msg');
  const chips = [...document.querySelectorAll('.chip')];
  const form  = document.getElementById('form');
  const lead  = document.getElementById('leadText');

  // Track list of selected phrases for multi-select
  let selectedPhrases = [];

  // Personalize lead text if user name is known
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get('name') || sessionStorage.getItem('saybyme_user_name');
  if (userName && lead) {
    lead.innerHTML = `Hey <span class="user-name-highlight">${escapeHtml(userName)}</span>, take a moment to tell us what happened. This helps us create a more personal and meaningful apology.`;
  }

  function updateCount() {
    const len = story.value.length;
    count.textContent = `${len}/300`;
    if (len >= 260) {
      count.classList.add('near-limit');
    } else {
      count.classList.remove('near-limit');
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function rebuildStoryText() {
    if (selectedPhrases.length > 0) {
      story.value = selectedPhrases.map(p => p.trim().replace(/\.+$/, '') + '.').join(' ');
    } else {
      story.value = '';
    }
    updateCount();
    box.classList.remove('error');
    msg.textContent = '';
  }

  // Restore saved reason if exists and activate matching chips
  const savedReason = sessionStorage.getItem('saybyme_apology_reason');
  if (savedReason && story) {
    story.value = savedReason;
    updateCount();
    chips.forEach(chip => {
      const phrase = chip.dataset.phrase;
      if (phrase && savedReason.includes(phrase)) {
        chip.setAttribute('aria-pressed', 'true');
        if (!selectedPhrases.includes(phrase)) {
          selectedPhrases.push(phrase);
        }
      }
    });
  }

  // Multi-select chip click handlers
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();

      if (chip.dataset.other) {
        // "Write my own / Other": focus textarea directly
        story.focus();
        return;
      }

      const phrase = chip.dataset.phrase || (chip.querySelector('.chip-text') || chip).textContent.trim();
      const isPressed = chip.getAttribute('aria-pressed') === 'true';

      if (isPressed) {
        // Deselect clicked option
        chip.setAttribute('aria-pressed', 'false');
        selectedPhrases = selectedPhrases.filter(p => p !== phrase);
        rebuildStoryText();
      } else {
        // Multi-select: add option to list
        chip.setAttribute('aria-pressed', 'true');
        if (!selectedPhrases.includes(phrase)) {
          selectedPhrases.push(phrase);
        }
        rebuildStoryText();
      }
    });
  });

  // Keep chips in sync if user manually edits or types in the textarea
  story.addEventListener('input', () => {
    updateCount();
    box.classList.remove('error');
    msg.textContent = '';

    const currentVal = story.value;
    selectedPhrases = [];
    chips.forEach(chip => {
      const phrase = chip.dataset.phrase;
      if (phrase) {
        if (currentVal.includes(phrase)) {
          chip.setAttribute('aria-pressed', 'true');
          selectedPhrases.push(phrase);
        } else {
          chip.setAttribute('aria-pressed', 'false');
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = story.value.trim();
    if (!text) {
      box.classList.add('error');
      msg.textContent = 'Tell us what happened, or pick one or more examples, to continue.';
      story.focus();
      return;
    }

    sessionStorage.setItem('saybyme_apology_reason', text);
    console.log('Saved multi-select reason:', text);
    window.location.href = 'step3.html';
  });
});
