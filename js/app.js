/**
 * OmniCalc Pro - Main Application Controller & Orchestrator
 * Connects all calculation engines, UI components, themes, audio, and shortcuts.
 */

class OmniApp {
  constructor() {
    this.currentTab = 'standard';
    this.expression = '';
    this.memoryValue = 0;
    this.isResultShown = false;

    // Initialize engines
    this.parser = new MathParser();
    this.programmer = new ProgrammerEngine();
    this.converter = new UnitConverterEngine();
    this.shortcuts = new ShortcutHandler(this);

    // Stopwatch State
    this.stopwatchTimer = null;
    this.stopwatchStartTime = 0;
    this.stopwatchElapsedTime = 0;
    this.stopwatchLaps = [];

    // Countdown Timer State
    this.countdownTimer = null;
    this.countdownRemaining = 0;
  }

  init() {
    this.initTheme();
    this.initTabs();
    this.initScientificModals();
    this.initProgrammerView();
    this.initGrapherView();
    this.initFinancialView();
    this.initMatrixView();
    this.initStatisticsView();
    this.initSolverView();
    this.initConverterView();
    this.initDateTimeView();
    this.initHistory();
    this.updateDisplay();

    // Default angle mode
    this.setAngleMode('DEG');
  }

  // ===================== THEME & AUDIO =====================

  initTheme() {
    const savedTheme = localStorage.getItem('omnicalc_theme') || 'dark';
    this.setTheme(savedTheme);

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = savedTheme;
      themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
    }

    const soundSelect = document.getElementById('soundSelect');
    if (soundSelect) {
      soundSelect.value = window.AudioEngine.soundMode;
      soundSelect.addEventListener('change', (e) => window.AudioEngine.setSoundMode(e.target.value));
    }
  }

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('omnicalc_theme', theme);
  }

  // ===================== NAVIGATION & TABS =====================

  initTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update sidebar buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Tab specific initializations
    if (tabName === 'graphing' && window.Grapher) {
      setTimeout(() => window.Grapher.resize(), 50);
    }
    if (tabName === 'programmer') {
      this.updateProgrammerDisplay();
    }
  }

  // ===================== STANDARD / SCIENTIFIC CALCULATOR =====================

  inputDigit(d) {
    window.AudioEngine.playClick('default');
    if (this.isResultShown) {
      this.expression = '';
      this.isResultShown = false;
    }
    this.expression += d;
    this.updateDisplay();
  }

  inputOperator(op) {
    window.AudioEngine.playClick('default');
    this.isResultShown = false;
    if (this.expression === '' && ['*', '/', '^', '%'].includes(op)) return;
    this.expression += op;
    this.updateDisplay();
  }

  inputFunction(fnName) {
    window.AudioEngine.playClick('default');
    if (this.isResultShown) this.isResultShown = false;
    this.expression += `${fnName}(`;
    this.updateDisplay();
  }

  inputConstant(constName) {
    window.AudioEngine.playClick('default');
    if (this.isResultShown) {
      this.expression = '';
      this.isResultShown = false;
    }
    this.expression += constName;
    this.updateDisplay();
  }

  backspace() {
    window.AudioEngine.playClick('default');
    if (this.isResultShown) {
      this.expression = '';
      this.isResultShown = false;
    } else {
      this.expression = this.expression.slice(0, -1);
    }
    this.updateDisplay();
  }

  clearAll() {
    window.AudioEngine.playClick('default');
    this.expression = '';
    this.isResultShown = false;

    // Reset all history lines above display
    document.querySelectorAll('.display-history-line').forEach(el => {
      el.textContent = '';
    });

    // Reset all sub-previews
    document.querySelectorAll('.display-sub-preview').forEach(el => {
      el.textContent = '';
    });

    this.updateDisplay();
  }

  toggleSign() {
    window.AudioEngine.playClick('default');
    if (!this.expression) return;
    if (this.expression.startsWith('-')) {
      this.expression = this.expression.slice(1);
    } else {
      this.expression = '-' + this.expression;
    }
    this.updateDisplay();
  }

  calculate() {
    if (!this.expression || this.expression.trim() === '') return;

    try {
      const result = this.parser.evaluate(this.expression);
      window.AudioEngine.playClick('action');

      // Add to history
      window.HistoryManager.add(this.expression, result, this.currentTab.toUpperCase());

      // Update history line across displays
      document.querySelectorAll('.display-history-line').forEach(el => {
        el.textContent = this.expression + ' =';
      });

      this.expression = String(result);
      this.isResultShown = true;
      this.updateDisplay();
    } catch (err) {
      window.AudioEngine.playError();
      document.querySelectorAll('.display-sub-preview').forEach(el => {
        el.textContent = 'Error: ' + err.message;
      });
    }
  }

  updateDisplay() {
    const val = this.expression || '0';
    document.querySelectorAll('.display-active-line').forEach(el => {
      el.value = val;
    });

    const previewText = (!this.isResultShown && this.expression) ? this.parser.safePreview(this.expression) : '';
    document.querySelectorAll('.display-sub-preview').forEach(el => {
      el.textContent = previewText;
    });
  }

  setAngleMode(mode) {
    this.parser.setAngleMode(mode);
    document.querySelectorAll('.angle-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === mode);
    });
  }

  // Memory Registers
  memoryClear() {
    window.AudioEngine.playClick('default');
    this.memoryValue = 0;
    this.updateMemoryIndicator();
  }

  memoryRecall() {
    window.AudioEngine.playClick('default');
    this.inputDigit(this.memoryValue);
  }

  memoryAdd() {
    window.AudioEngine.playClick('default');
    try {
      const current = this.parser.evaluate(this.expression || '0');
      this.memoryValue += current;
      this.updateMemoryIndicator();
    } catch {}
  }

  memorySubtract() {
    window.AudioEngine.playClick('default');
    try {
      const current = this.parser.evaluate(this.expression || '0');
      this.memoryValue -= current;
      this.updateMemoryIndicator();
    } catch {}
  }

  memoryStore() {
    window.AudioEngine.playClick('default');
    try {
      this.memoryValue = this.parser.evaluate(this.expression || '0');
      this.updateMemoryIndicator();
    } catch {}
  }

  updateMemoryIndicator() {
    const memEl = document.getElementById('memIndicator');
    const memElSci = document.getElementById('memIndicatorSci');
    if (memEl) {
      memEl.classList.toggle('mem-active', this.memoryValue !== 0);
    }
    if (memElSci) {
      memElSci.classList.toggle('mem-active', this.memoryValue !== 0);
    }
  }

  useHistoryItem(val) {
    this.expression = val;
    this.isResultShown = false;
    this.updateDisplay();
    this.toggleHistoryDrawer(false);
  }

  // ===================== PROGRAMMER MODE =====================

  initProgrammerView() {
    // Base selector clicks
    const baseRows = document.querySelectorAll('.base-row');
    baseRows.forEach(row => {
      row.addEventListener('click', () => {
        const base = row.dataset.base;
        this.setProgrammerBase(base);
      });
    });

    // Word size clicks
    const wordPills = document.querySelectorAll('.word-pill');
    wordPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const bits = pill.dataset.bits;
        this.programmer.setBitSize(bits);
        wordPills.forEach(p => p.classList.toggle('active', p === pill));
        this.updateProgrammerDisplay();
      });
    });

    this.renderBitboard();
  }

  setProgrammerBase(base) {
    this.programmer.currentBase = base;
    document.querySelectorAll('.base-row').forEach(row => {
      row.classList.toggle('active', row.dataset.base === base);
    });
    this.updateProgrammerKeypadState();
  }

  updateProgrammerKeypadState() {
    const base = this.programmer.currentBase;
    // Enable/disable hex keys A-F, digits 2-9 based on base
    document.querySelectorAll('.prog-key').forEach(btn => {
      const char = btn.dataset.val;
      if (!char) return;
      let enabled = true;
      if (base === 'BIN') enabled = ['0', '1'].includes(char);
      else if (base === 'OCT') enabled = ['0', '1', '2', '3', '4', '5', '6', '7'].includes(char);
      else if (base === 'DEC') enabled = char >= '0' && char <= '9';
      else if (base === 'HEX') enabled = (char >= '0' && char <= '9') || (char >= 'A' && char <= 'F');

      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.25';
    });
  }

  inputProgChar(char) {
    window.AudioEngine.playClick('default');
    let base = 10;
    if (this.programmer.currentBase === 'HEX') base = 16;
    else if (this.programmer.currentBase === 'OCT') base = 8;
    else if (this.programmer.currentBase === 'BIN') base = 2;

    let currentStr = '';
    if (base === 16) currentStr = this.programmer.getHex().replace(/\s+/g, '');
    else if (base === 8) currentStr = this.programmer.getOct();
    else if (base === 2) currentStr = this.programmer.getBin().replace(/\s+/g, '');
    else currentStr = this.programmer.getDec();

    if (currentStr === '0') currentStr = '';
    currentStr += char;

    this.programmer.setValue(currentStr, base);
    this.updateProgrammerDisplay();
  }

  progBackspace() {
    window.AudioEngine.playClick('default');
    let base = 10;
    if (this.programmer.currentBase === 'HEX') base = 16;
    else if (this.programmer.currentBase === 'OCT') base = 8;
    else if (this.programmer.currentBase === 'BIN') base = 2;

    let currentStr = '';
    if (base === 16) currentStr = this.programmer.getHex().replace(/\s+/g, '');
    else if (base === 8) currentStr = this.programmer.getOct();
    else if (base === 2) currentStr = this.programmer.getBin().replace(/\s+/g, '');
    else currentStr = this.programmer.getDec();

    currentStr = currentStr.slice(0, -1);
    this.programmer.setValue(currentStr || '0', base);
    this.updateProgrammerDisplay();
  }

  progClear() {
    window.AudioEngine.playClick('default');
    this.programmer.setValue(0);
    this.updateProgrammerDisplay();
  }

  progBitwise(op) {
    window.AudioEngine.playClick('action');
    if (op === 'NOT') this.programmer.not();
    else if (op === 'LSH') this.programmer.lsh(1n);
    else if (op === 'RSH') this.programmer.rsh(1n);
    else if (op === 'RoL') this.programmer.rol(1n);
    else if (op === 'RoR') this.programmer.ror(1n);
    else if (op === 'SWAP') this.programmer.byteSwap();
    this.updateProgrammerDisplay();
  }

  renderBitboard() {
    const grid = document.getElementById('bitboardGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Show only the bits relevant to current word size
    const bitsToShow = this.programmer.bitSize;
    const startBit = bitsToShow - 1;
    
    // Update header
    const header = document.querySelector('.bitboard-header');
    if (header) {
      if (bitsToShow === 64) {
        header.innerHTML = '<span>Bit 63</span><span>Bit 32</span><span>Bit 31</span><span>Bit 0</span>';
      } else if (bitsToShow === 32) {
        header.innerHTML = '<span>Bit 31</span><span>Bit 16</span><span>Bit 15</span><span>Bit 0</span>';
      } else if (bitsToShow === 16) {
        header.innerHTML = '<span>Bit 15</span><span>Bit 8</span><span>Bit 7</span><span>Bit 0</span>';
      } else {
        header.innerHTML = '<span>Bit 7</span><span>Bit 0</span>';
      }
    }

    for (let i = startBit; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'bit-cell';
      cell.dataset.bit = i;
      cell.textContent = '0';
      cell.title = `Bit ${i}`;
      cell.addEventListener('click', () => {
        window.AudioEngine.playClick('default');
        this.programmer.toggleBit(i);
        this.updateProgrammerDisplay();
      });
      grid.appendChild(cell);
    }
    
    // Update grid columns based on word size
    grid.style.gridTemplateColumns = `repeat(${bitsToShow}, 1fr)`;
  }

  updateProgrammerDisplay() {
    const hexEl = document.getElementById('progValHex');
    const decEl = document.getElementById('progValDec');
    const octEl = document.getElementById('progValOct');
    const binEl = document.getElementById('progValBin');

    if (hexEl) hexEl.textContent = this.programmer.getHex();
    if (decEl) decEl.textContent = this.programmer.getDec();
    if (octEl) octEl.textContent = this.programmer.getOct();
    if (binEl) binEl.textContent = this.programmer.getBin();

    // Update bitboard cells
    const bitArray = this.programmer.getBitArray();
    const cells = document.querySelectorAll('.bit-cell');
    const bitSize = this.programmer.bitSize;
    const startIndex = 64 - bitSize;
    
    cells.forEach((cell, index) => {
      const bitIndex = 63 - index;
      if (bitIndex < bitSize) {
        const isOne = bitArray[index];
        cell.textContent = isOne ? '1' : '0';
        cell.classList.toggle('bit-1', isOne);
        cell.style.opacity = '1';
        cell.style.pointerEvents = 'auto';
      } else {
        cell.textContent = '0';
        cell.classList.remove('bit-1');
        cell.style.opacity = '0.2';
        cell.style.pointerEvents = 'none';
      }
    });
  }

  // ===================== GRAPHER VIEW =====================

  initGrapherView() {
    window.Grapher = new GrapherEngine('graphCanvas', this.parser);

    const f1Input = document.getElementById('graphF1Input');
    if (f1Input) {
      f1Input.addEventListener('input', (e) => {
        window.Grapher.functions[0].expr = e.target.value;
        window.Grapher.draw();
      });
    }

    const f2Input = document.getElementById('graphF2Input');
    const f2Toggle = document.getElementById('graphF2Toggle');
    if (f2Input && f2Toggle) {
      f2Input.addEventListener('input', (e) => {
        window.Grapher.functions[1].expr = e.target.value;
        window.Grapher.draw();
      });
      f2Toggle.addEventListener('change', (e) => {
        window.Grapher.functions[1].enabled = e.target.checked;
        window.Grapher.draw();
      });
    }
  }

  // ===================== FINANCIAL VIEW =====================

  initFinancialView() {
    // Amortization Form
    const calcLoanBtn = document.getElementById('calcLoanBtn');
    if (calcLoanBtn) {
      calcLoanBtn.addEventListener('click', () => this.calculateLoan());
    }

    // Compound Interest Form
    const calcCompoundBtn = document.getElementById('calcCompoundBtn');
    if (calcCompoundBtn) {
      calcCompoundBtn.addEventListener('click', () => this.calculateCompound());
    }

    // Tip & Tax Form
    const calcTipBtn = document.getElementById('calcTipBtn');
    if (calcTipBtn) {
      calcTipBtn.addEventListener('click', () => this.calculateTip());
    }
  }

  calculateLoan() {
    window.AudioEngine.playClick('action');
    const principal = parseFloat(document.getElementById('loanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('loanRate').value) || 0;
    const years = parseFloat(document.getElementById('loanYears').value) || 0;

    if (principal <= 0 || rate <= 0 || years <= 0) return alert("Mohon isi semua data pinjaman dengan benar!");

    const res = FinancialEngine.calcLoanAmortization(principal, rate, years);
    document.getElementById('loanMonthlyPay').textContent = res.monthlyPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    document.getElementById('loanTotalPay').textContent = res.totalPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    document.getElementById('loanTotalInterest').textContent = res.totalInterest.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

    // Populate schedule table (first 12 months preview)
    const tbody = document.getElementById('amortizationTableBody');
    if (tbody) {
      tbody.innerHTML = res.schedule.slice(0, 24).map(s => `
        <tr>
          <td>Bulan ${s.month}</td>
          <td>${s.principal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
          <td>${s.interest.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
          <td>${s.remainingBalance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
        </tr>
      `).join('');
    }
  }

  calculateCompound() {
    window.AudioEngine.playClick('action');
    const p = parseFloat(document.getElementById('compoundInitial').value) || 0;
    const m = parseFloat(document.getElementById('compoundMonthly').value) || 0;
    const r = parseFloat(document.getElementById('compoundRate').value) || 0;
    const y = parseFloat(document.getElementById('compoundYears').value) || 0;

    const res = FinancialEngine.calcCompoundInterest(p, m, r, y);
    document.getElementById('compoundTotalBalance').textContent = res.finalBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    document.getElementById('compoundTotalPrincipal').textContent = res.totalPrincipal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    document.getElementById('compoundTotalInterest').textContent = res.totalInterest.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  }

  calculateTip() {
    window.AudioEngine.playClick('action');
    const bill = parseFloat(document.getElementById('tipBill').value) || 0;
    const tipPct = parseFloat(document.getElementById('tipPercent').value) || 0;
    const people = parseInt(document.getElementById('tipPeople').value, 10) || 1;

    const res = FinancialEngine.calcTip(bill, tipPct, people);
    document.getElementById('tipTotalBill').textContent = res.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    document.getElementById('tipPerPerson').textContent = res.perPerson.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  }

  // ===================== MATRIX VIEW =====================

  initMatrixView() {
    this.matrixDimA = { rows: 2, cols: 2 };
    this.matrixDimB = { rows: 2, cols: 2 };
    this.renderMatrixGrids();

    const dimASelect = document.getElementById('matrixDimA');
    if (dimASelect) {
      dimASelect.addEventListener('change', (e) => {
        const [r, c] = e.target.value.split('x').map(Number);
        this.matrixDimA = { rows: r, cols: c };
        this.renderMatrixGrids();
      });
    }

    const dimBSelect = document.getElementById('matrixDimB');
    if (dimBSelect) {
      dimBSelect.addEventListener('change', (e) => {
        const [r, c] = e.target.value.split('x').map(Number);
        this.matrixDimB = { rows: r, cols: c };
        this.renderMatrixGrids();
      });
    }
  }

  renderMatrixGrids() {
    const gridA = document.getElementById('matrixGridA');
    if (gridA) {
      gridA.style.gridTemplateColumns = `repeat(${this.matrixDimA.cols}, 1fr)`;
      gridA.innerHTML = '';
      for (let i = 0; i < this.matrixDimA.rows; i++) {
        for (let j = 0; j < this.matrixDimA.cols; j++) {
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'matrix-cell';
          input.value = i === j ? '1' : '0';
          input.dataset.row = i;
          input.dataset.col = j;
          gridA.appendChild(input);
        }
      }
    }

    const gridB = document.getElementById('matrixGridB');
    if (gridB) {
      gridB.style.gridTemplateColumns = `repeat(${this.matrixDimB.cols}, 1fr)`;
      gridB.innerHTML = '';
      for (let i = 0; i < this.matrixDimB.rows; i++) {
        for (let j = 0; j < this.matrixDimB.cols; j++) {
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'matrix-cell';
          input.value = '0';
          input.dataset.row = i;
          input.dataset.col = j;
          gridB.appendChild(input);
        }
      }
    }
  }

  getMatrixValues(containerId, dim) {
    const grid = document.getElementById(containerId);
    const inputs = grid.querySelectorAll('.matrix-cell');
    const matrix = Array.from({ length: dim.rows }, () => Array(dim.cols).fill(0));
    inputs.forEach(input => {
      const r = parseInt(input.dataset.row, 10);
      const c = parseInt(input.dataset.col, 10);
      matrix[r][c] = parseFloat(input.value) || 0;
    });
    return matrix;
  }

  calcMatrix(op) {
    window.AudioEngine.playClick('action');
    const resultBox = document.getElementById('matrixResultBox');
    try {
      const A = this.getMatrixValues('matrixGridA', this.matrixDimA);
      let output = '';

      if (op === 'detA') {
        if (this.matrixDimA.rows !== this.matrixDimA.cols) throw new Error("Determinant requires square matrix");
        const det = MatrixEngine.determinant(A);
        output = `Determinant det(A) = ${det}`;
      } else if (op === 'invA') {
        if (this.matrixDimA.rows !== this.matrixDimA.cols) throw new Error("Inverse requires square matrix");
        const inv = MatrixEngine.inverse(A);
        output = `Invers A⁻¹:\n` + inv.map(r => r.map(n => n.toFixed(4).padStart(8)).join('  ')).join('\n');
      } else if (op === 'transA') {
        const tr = MatrixEngine.transpose(A);
        output = `Transpose Aᵀ:\n` + tr.map(r => r.join('\t')).join('\n');
      } else if (op === 'rankA') {
        const rank = MatrixEngine.rank(A);
        output = `Rank(A) = ${rank}`;
      } else if (op === 'add') {
        const B = this.getMatrixValues('matrixGridB', this.matrixDimB);
        if (this.matrixDimA.rows !== this.matrixDimB.rows || this.matrixDimA.cols !== this.matrixDimB.cols) {
          throw new Error("Matrix dimensions must match for addition");
        }
        const res = MatrixEngine.add(A, B);
        output = `A + B =\n` + res.map(r => r.join('\t')).join('\n');
      } else if (op === 'sub') {
        const B = this.getMatrixValues('matrixGridB', this.matrixDimB);
        if (this.matrixDimA.rows !== this.matrixDimB.rows || this.matrixDimA.cols !== this.matrixDimB.cols) {
          throw new Error("Matrix dimensions must match for subtraction");
        }
        const res = MatrixEngine.subtract(A, B);
        output = `A - B =\n` + res.map(r => r.join('\t')).join('\n');
      } else if (op === 'mult') {
        const B = this.getMatrixValues('matrixGridB', this.matrixDimB);
        if (this.matrixDimA.cols !== this.matrixDimB.rows) {
          throw new Error(`Cannot multiply: Columns of A (${this.matrixDimA.cols}) != Rows of B (${this.matrixDimB.rows})`);
        }
        const res = MatrixEngine.multiply(A, B);
        output = `A × B =\n` + res.map(r => r.join('\t')).join('\n');
      }

      resultBox.innerHTML = `<pre style="font-family: 'Fira Code', monospace; line-height: 1.5;">${output}</pre>`;
    } catch (err) {
      window.AudioEngine.playError();
      resultBox.innerHTML = `<span style="color: var(--accent-rose);">Error: ${err.message}</span>`;
    }
  }

  // ===================== STATISTICS VIEW =====================

  initStatisticsView() {
    const analyzeBtn = document.getElementById('statAnalyzeBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.analyzeStatistics());
    }
  }

  analyzeStatistics() {
    window.AudioEngine.playClick('action');
    const rawText = document.getElementById('statDataInput').value;
    const resBox = document.getElementById('statResultsGrid');

    try {
      const data = StatisticsEngine.parseData(rawText);
      const s = StatisticsEngine.analyze1D(data);

      resBox.innerHTML = `
        <div class="matrix-card">
          <h4 style="color: var(--accent-cyan); font-size: 0.9rem;">Ukuran Pemusatan Data</h4>
          <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;"><span>Jumlah Data (N):</span> <b>${s.count}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Mean (Rata-rata):</span> <b>${s.mean.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Median:</span> <b>${s.median.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Modus:</span> <b>${Array.isArray(s.modes) ? s.modes.join(', ') : s.modes}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Total (Sum Σx):</span> <b>${s.sum.toFixed(4)}</b></div>
        </div>
        <div class="matrix-card">
          <h4 style="color: var(--accent-purple); font-size: 0.9rem;">Ukuran Penyebaran Data</h4>
          <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;"><span>Deviasi Standar Sampel (s):</span> <b>${s.sampleStd.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Varians Sampel (s²):</span> <b>${s.sampleVar.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Deviasi Standar Pop (σ):</span> <b>${s.popStd.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Varians Pop (σ²):</span> <b>${s.popVar.toFixed(4)}</b></div>
        </div>
        <div class="matrix-card">
          <h4 style="color: var(--accent-amber); font-size: 0.9rem;">Rentang & Kuartil</h4>
          <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;"><span>Min / Max:</span> <b>${s.min} / ${s.max}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Jangkauan (Range):</span> <b>${s.range}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Kuartil Bawah (Q₁):</span> <b>${s.q1.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Kuartil Atas (Q₃):</span> <b>${s.q3.toFixed(4)}</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Jangkauan Interkuartil (IQR):</span> <b>${s.iqr.toFixed(4)}</b></div>
        </div>
      `;
    } catch (err) {
      window.AudioEngine.playError();
      resBox.innerHTML = `<span style="color: var(--accent-rose);">Error: ${err.message}</span>`;
    }
  }

  // ===================== EQUATION SOLVER VIEW =====================

  initSolverView() {
    const solveQuadBtn = document.getElementById('solveQuadBtn');
    if (solveQuadBtn) {
      solveQuadBtn.addEventListener('click', () => this.solveQuadratic());
    }

    const solveLinearBtn = document.getElementById('solveLinear2x2Btn');
    if (solveLinearBtn) {
      solveLinearBtn.addEventListener('click', () => this.solveLinear2x2());
    }
  }

  solveQuadratic() {
    window.AudioEngine.playClick('action');
    const a = parseFloat(document.getElementById('quadA').value) || 0;
    const b = parseFloat(document.getElementById('quadB').value) || 0;
    const c = parseFloat(document.getElementById('quadC').value) || 0;
    const resBox = document.getElementById('quadResultBox');

    try {
      const res = EquationSolver.solveQuadratic(a, b, c);
      resBox.innerHTML = `
        <div style="font-family: 'Fira Code', monospace; font-size: 0.95rem; line-height: 1.6;">
          <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem;">Hasil Akar: ${res.roots.join(' dan ')}</div>
          ${res.steps.map(s => `<div>${s}</div>`).join('')}
        </div>
      `;
    } catch (err) {
      window.AudioEngine.playError();
      resBox.innerHTML = `<span style="color: var(--accent-rose);">Error: ${err.message}</span>`;
    }
  }

  solveLinear2x2() {
    window.AudioEngine.playClick('action');
    const a1 = parseFloat(document.getElementById('spldvA1').value) || 0;
    const b1 = parseFloat(document.getElementById('spldvB1').value) || 0;
    const c1 = parseFloat(document.getElementById('spldvC1').value) || 0;
    const a2 = parseFloat(document.getElementById('spldvA2').value) || 0;
    const b2 = parseFloat(document.getElementById('spldvB2').value) || 0;
    const c2 = parseFloat(document.getElementById('spldvC2').value) || 0;
    const resBox = document.getElementById('spldvResultBox');

    try {
      const res = EquationSolver.solveLinear2x2(a1, b1, c1, a2, b2, c2);
      resBox.innerHTML = `
        <div style="font-family: 'Fira Code', monospace; font-size: 0.95rem; line-height: 1.6;">
          ${res.status === 'unique' ? `<div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem;">Solusi: x = ${res.x.toFixed(6)}, y = ${res.y.toFixed(6)}</div>` : ''}
          ${res.steps.map(s => `<div>${s}</div>`).join('')}
        </div>
      `;
    } catch (err) {
      window.AudioEngine.playError();
      resBox.innerHTML = `<span style="color: var(--accent-rose);">Error: ${err.message}</span>`;
    }
  }

  // ===================== UNIT CONVERTER VIEW =====================

  initConverterView() {
    const catSelect = document.getElementById('converterCatSelect');
    const fromUnitSelect = document.getElementById('convFromUnit');
    const toUnitSelect = document.getElementById('convToUnit');
    const fromValInput = document.getElementById('convFromVal');
    const toValInput = document.getElementById('convToVal');

    if (!catSelect) return;

    // Populate Categories
    catSelect.innerHTML = Object.keys(this.converter.categories).map(k => `
      <option value="${k}">${this.converter.categories[k].name}</option>
    `).join('');

    const populateUnits = () => {
      const cat = this.converter.categories[catSelect.value];
      const unitKeys = Object.keys(cat.units);

      fromUnitSelect.innerHTML = unitKeys.map(k => `<option value="${k}">${cat.units[k].name}</option>`).join('');
      toUnitSelect.innerHTML = unitKeys.map(k => `<option value="${k}">${cat.units[k].name}</option>`).join('');

      if (unitKeys.length > 1) toUnitSelect.selectedIndex = 1;
      doConvert();
    };

    const doConvert = () => {
      const val = parseFloat(fromValInput.value) || 0;
      const res = this.converter.convert(val, catSelect.value, fromUnitSelect.value, toUnitSelect.value);
      toValInput.value = res;
    };

    catSelect.addEventListener('change', populateUnits);
    fromUnitSelect.addEventListener('change', doConvert);
    toUnitSelect.addEventListener('change', doConvert);
    fromValInput.addEventListener('input', doConvert);

    populateUnits();
  }

  // ===================== DATE & TIME / STOPWATCH =====================

  initDateTimeView() {
    // Date diff calculation
    const calcDateBtn = document.getElementById('calcDateDiffBtn');
    if (calcDateBtn) {
      calcDateBtn.addEventListener('click', () => {
        window.AudioEngine.playClick('action');
        const d1 = new Date(document.getElementById('dateStart').value);
        const d2 = new Date(document.getElementById('dateEnd').value);

        if (isNaN(d1) || isNaN(d2)) return alert("Mohon pilih kedua tanggal!");

        const diffMs = Math.abs(d2 - d1);
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(totalDays / 7);
        const remDays = totalDays % 7;

        document.getElementById('dateDiffResult').innerHTML = `
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-cyan);">${totalDays} Hari Total</div>
          <div style="color: var(--text-muted); font-size: 0.9rem;">Setara dengan ${weeks} Minggu + ${remDays} Hari (atau ${(totalDays * 24).toLocaleString()} Jam)</div>
        `;
      });
    }

    // Stopwatch Controls
    const swStart = document.getElementById('swStartBtn');
    const swLap = document.getElementById('swLapBtn');
    const swReset = document.getElementById('swResetBtn');

    if (swStart && swLap && swReset) {
      swStart.addEventListener('click', () => {
        window.AudioEngine.playClick('default');
        if (!this.stopwatchTimer) {
          this.stopwatchStartTime = performance.now() - this.stopwatchElapsedTime;
          this.stopwatchTimer = setInterval(() => {
            this.stopwatchElapsedTime = performance.now() - this.stopwatchStartTime;
            this.updateStopwatchDisplay();
          }, 10);
          swStart.textContent = 'Pause';
          swStart.classList.add('btn-danger');
        } else {
          clearInterval(this.stopwatchTimer);
          this.stopwatchTimer = null;
          swStart.textContent = 'Start';
          swStart.classList.remove('btn-danger');
        }
      });

      swLap.addEventListener('click', () => {
        window.AudioEngine.playClick('default');
        if (this.stopwatchElapsedTime > 0) {
          this.stopwatchLaps.unshift(this.formatTime(this.stopwatchElapsedTime));
          this.renderStopwatchLaps();
        }
      });

      swReset.addEventListener('click', () => {
        window.AudioEngine.playClick('default');
        clearInterval(this.stopwatchTimer);
        this.stopwatchTimer = null;
        this.stopwatchElapsedTime = 0;
        this.stopwatchLaps = [];
        swStart.textContent = 'Start';
        swStart.classList.remove('btn-danger');
        this.updateStopwatchDisplay();
        this.renderStopwatchLaps();
      });
    }
  }

  formatTime(ms) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  }

  updateStopwatchDisplay() {
    const el = document.getElementById('stopwatchDisplay');
    if (el) el.textContent = this.formatTime(this.stopwatchElapsedTime);
  }

  renderStopwatchLaps() {
    const lapsEl = document.getElementById('stopwatchLapsList');
    if (lapsEl) {
      lapsEl.innerHTML = this.stopwatchLaps.map((lap, i) => `
        <div style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Lap ${this.stopwatchLaps.length - i}</span>
          <b style="font-family: 'Fira Code', monospace; color: var(--accent-blue);">${lap}</b>
        </div>
      `).join('');
    }
  }

  // ===================== HISTORY & MODALS =====================

  initHistory() {
    window.HistoryManager.render();
    const toggleBtn = document.getElementById('historyToggleBtn');
    const closeBtn = document.getElementById('closeHistoryBtn');

    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleHistoryDrawer(true));
    if (closeBtn) closeBtn.addEventListener('click', () => this.toggleHistoryDrawer(false));
  }

  toggleHistoryDrawer(open) {
    const drawer = document.getElementById('historyDrawer');
    if (drawer) drawer.classList.toggle('open', open);
  }

  initScientificModals() {
    // Constants Modal
    const constModalBtn = document.getElementById('openConstantsBtn');
    if (constModalBtn) {
      constModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('constantsModal');
        if (modal) modal.classList.add('open');
      });
    }

    // Help Modal
    const helpBtn = document.getElementById('openHelpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.toggleHelpModal());
    }

    // Close all modals on clicking close or backdrop
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.classList.contains('modal-close')) {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        }
      });
    });
  }

  toggleHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) helpModal.classList.toggle('open');
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.OmniApp = new OmniApp();
  window.OmniApp.init();
});
