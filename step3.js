// SayByMe – Step 3: Your Apology Message Multi-Select Interactive Controller
document.addEventListener('DOMContentLoaded', () => {
  const text  = document.getElementById('msgText');
  const count = document.getElementById('count');
  const box   = document.getElementById('box');
  const msg   = document.getElementById('msg');
  const cards = [...document.querySelectorAll('.s')];
  const form  = document.getElementById('form');

  let selectedMessages = [];

  const updateCount = () => {
    const len = text.value.length;
    count.textContent = `${len}/500`;
  };

  const clearError = () => {
    box.classList.remove('error');
    msg.textContent = '';
  };

  function rebuildTextMessage() {
    if (selectedMessages.length > 0) {
      text.value = selectedMessages.join(' ');
    } else {
      text.value = '';
    }
    updateCount();
    clearError();
  }

  // Restore saved message if present
  const savedMsg = sessionStorage.getItem('saybyme_apology_message');
  if (savedMsg && text) {
    text.value = savedMsg;
    updateCount();
    cards.forEach(c => {
      const p = c.querySelector('p');
      const useBtn = c.querySelector('.use');
      if (p) {
        const pText = p.textContent.trim();
        if (savedMsg.includes(pText)) {
          c.classList.add('chosen');
          if (useBtn) useBtn.textContent = 'Added ✓';
          selectedMessages.push(pText);
        }
      }
    });
  }

  // Multi-select toggle on card or "Use" button click
  cards.forEach(card => {
    const useBtn = card.querySelector('.use');
    const p = card.querySelector('p');
    if (!p) return;
    const pText = p.textContent.trim();

    const toggleCard = () => {
      const isChosen = card.classList.contains('chosen');
      if (isChosen) {
        // Deselect
        card.classList.remove('chosen');
        if (useBtn) useBtn.textContent = 'Use';
        selectedMessages = selectedMessages.filter(m => m !== pText);
        rebuildTextMessage();
      } else {
        // Multi-select: Add
        card.classList.add('chosen');
        if (useBtn) useBtn.textContent = 'Added ✓';
        if (!selectedMessages.includes(pText)) {
          selectedMessages.push(pText);
        }
        rebuildTextMessage();
      }
      text.focus();
    };

    if (useBtn) {
      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard();
      });
    }
    card.addEventListener('click', toggleCard);
  });

  // Keep cards in sync when user types or edits the textarea directly
  text.addEventListener('input', () => {
    updateCount();
    clearError();

    const currentVal = text.value;
    selectedMessages = [];
    cards.forEach(c => {
      const p = c.querySelector('p');
      const useBtn = c.querySelector('.use');
      if (p) {
        const pText = p.textContent.trim();
        if (currentVal.includes(pText)) {
          c.classList.add('chosen');
          if (useBtn) useBtn.textContent = 'Added ✓';
          selectedMessages.push(pText);
        } else {
          c.classList.remove('chosen');
          if (useBtn) useBtn.textContent = 'Use';
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = text.value.trim();
    if (!value) {
      box.classList.add('error');
      msg.textContent = 'Pick one or more suggestions, or write your own message to continue.';
      text.focus();
      return;
    }

    sessionStorage.setItem('saybyme_apology_message', value);
    console.log('Saved multi-select message:', value);
    window.location.href = 'step4.html';
  });
});
