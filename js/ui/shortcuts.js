/**
 * OmniCalc Pro - Keyboard & Numpad Shortcut Binding
 * Listens for hardware keyboard events and routes them to active modules.
 */

class ShortcutHandler {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in a real input field
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      // Global shortcut: F1 or ? for Help Modal
      if ((e.key === '?' || e.key === 'F1') && !isInput) {
        e.preventDefault();
        this.app.toggleHelpModal();
        return;
      }

      // Escape to close modals or Clear Calculator
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-backdrop.open');
        if (openModal) {
          openModal.classList.remove('open');
          return;
        }
        if (!isInput) {
          this.app.clearAll();
          return;
        }
      }

      if (isInput) return;

      // Handle standard and scientific calculator inputs
      if (['standard', 'scientific'].includes(this.app.currentTab)) {
        // Handle numpad and regular number keys
        if ((e.key >= '0' && e.key <= '9') || e.key === '.' || 
            (e.key >= 'Numpad0' && e.key <= 'Numpad9') || e.key === 'NumpadDecimal' || e.key === 'Decimal') {
          e.preventDefault();
          const digit = e.key.replace('Numpad', '');
          this.app.inputDigit(digit);
        } else if (['+', '-', '*', '/', '^', '%', '(', ')', 
                     'NumpadAdd', 'NumpadSubtract', 'NumpadMultiply', 'NumpadDivide',
                     'NumpadEnter'].includes(e.key)) {
          e.preventDefault();
          let op = e.key;
          // Map numpad keys to standard operators
          const numpadMap = {
            'NumpadAdd': '+',
            'NumpadSubtract': '-',
            'NumpadMultiply': '*',
            'NumpadDivide': '/',
            'NumpadEnter': '='
          };
          if (numpadMap[op]) op = numpadMap[op];
          if (op === '=' || op === 'Enter') {
            this.app.calculate();
          } else {
            this.app.inputOperator(op);
          }
        } else if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault();
          this.app.calculate();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          this.app.backspace();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          this.app.clearAll();
        }
      }
    });
  }
}

window.ShortcutHandler = ShortcutHandler;
