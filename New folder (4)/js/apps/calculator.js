/**
 * CloudsOS — Calculator App
 */
(() => {
  function render() {
    return `
      <div class="calc-body">
        <div class="calc-display">
          <div class="calc-expr" id="calc-expr"></div>
          <div class="calc-result" id="calc-result">0</div>
        </div>
        <div class="calc-grid" id="calc-grid"></div>
      </div>
    `;
  }

  const BUTTONS = [
    { label: 'AC', type: 'clear' }, { label: '+/-', type: 'op' }, { label: '%', type: 'op' }, { label: '÷', type: 'op', value: '/' },
    { label: '7' }, { label: '8' }, { label: '9' }, { label: '×', type: 'op', value: '*' },
    { label: '4' }, { label: '5' }, { label: '6' }, { label: '−', type: 'op', value: '-' },
    { label: '1' }, { label: '2' }, { label: '3' }, { label: '+', type: 'op', value: '+' },
    { label: '0', cls: 'zero' }, { label: '.' }, { label: '=', type: 'equals' },
  ];

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    let expr = '', display = '0', lastResult = null;
    const exprEl   = win.querySelector('#calc-expr');
    const resultEl = win.querySelector('#calc-result');
    const grid     = win.querySelector('#calc-grid');

    function updateDisplay() {
      resultEl.textContent = display;
      exprEl.textContent   = expr;
    }

    function calculate() {
      try {
        const safeExpr = expr.replace(/[^0-9+\-*/.()%]/g, '');
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict";return(${safeExpr})`)();
        lastResult = result;
        display = String(parseFloat(result.toFixed(10)));
        expr    = display;
        updateDisplay();
      } catch(e) {
        display = 'Error'; updateDisplay();
        setTimeout(() => { display = '0'; expr = ''; updateDisplay(); }, 1200);
      }
    }

    BUTTONS.forEach(btn => {
      const el = OSUtils.make('button', { className: `calc-btn ${btn.type || ''}${btn.cls ? ' ' + btn.cls : ''}` });
      el.textContent = btn.label;

      el.addEventListener('click', () => {
        if (btn.type === 'clear') {
          expr = ''; display = '0'; lastResult = null; updateDisplay(); return;
        }
        if (btn.type === 'equals') { calculate(); return; }
        if (btn.label === '+/-') { display = String(-parseFloat(display || '0')); expr = display; updateDisplay(); return; }
        if (btn.label === '%')   { display = String(parseFloat(display || '0') / 100); expr = display; updateDisplay(); return; }

        const val = btn.value || btn.label;
        if (display === 'Error') { expr = ''; display = '0'; }
        if (display === '0' && /[0-9]/.test(val)) { display = val; expr = val; }
        else { display += val; expr += val; }
        updateDisplay();
      });
      grid.appendChild(el);
    });

    // Keyboard support
    win.addEventListener('keydown', e => {
      const map = { Enter:'=', Backspace:'AC', Escape:'AC' };
      const key = map[e.key] || e.key;
      const btn = [...grid.querySelectorAll('.calc-btn')].find(b => b.textContent === key || (key === '/' && b.textContent === '÷') || (key === '*' && b.textContent === '×') || (key === '-' && b.textContent === '−'));
      if (btn) btn.click();
    });
  }

  OSAppRegistry.register({
    id: 'calculator',
    name: 'Calculator',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="url(#cg1)" stroke-width="1.5"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" stroke="url(#cg1)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="cg1" x1="4" y1="3" x2="20" y2="21"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#7c6ff7"/></linearGradient></defs></svg>',
    category: 'utilities',
    color: 'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(124,111,247,0.2))',
    defaultWidth: 320, defaultHeight: 480,
    resizable: false,
    render, onOpen,
  });
})();
