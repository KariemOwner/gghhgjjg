/**
 * OmniCalc Pro - Calculation Tape & History Management
 * LocalStorage caching, search, export to CSV, TXT, and LaTeX.
 */

class HistoryManager {
  constructor() {
    this.storageKey = 'omnicalc_history';
    this.history = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history.slice(0, 100))); // keep latest 100
    } catch (e) {
      console.warn("Could not save history to localStorage", e);
    }
  }

  add(expression, result, mode = 'Standard') {
    if (!expression || result === undefined || result === null) return;
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      expression: String(expression),
      result: String(result),
      mode,
      timestamp: new Date().toISOString()
    };
    this.history.unshift(entry);
    this.save();
    this.render();
  }

  clear() {
    this.history = [];
    this.save();
    this.render();
  }

  deleteItem(id) {
    this.history = this.history.filter(item => item.id !== id);
    this.save();
    this.render();
  }

  render() {
    const listEl = document.getElementById('historyList');
    if (!listEl) return;

    if (this.history.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 2rem 0; font-size: 0.9rem;">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 1.75rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
          Belum ada riwayat perhitungan
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.history.map(item => {
      // Escape for JavaScript single-quoted string inside HTML double-quoted attribute
      const jsEscapedResult = item.result.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return `
      <div class="history-item" data-id="${item.id}" onclick="window.OmniApp.useHistoryItem('${jsEscapedResult}')">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">${item.mode}</span>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="hist-expr">${this.escapeHTML(item.expression)} =</div>
        <div class="hist-res">${this.escapeHTML(item.result)}</div>
      </div>
    `;
    }).join('');
  }

  escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  exportCSV() {
    if (this.history.length === 0) return alert("Riwayat kosong!");
    const headers = "Timestamp,Mode,Ekspresi,Hasil\n";
    const rows = this.history.map(h => 
      `"${h.timestamp}","${h.mode}","${h.expression.replace(/"/g, '""')}","${h.result.replace(/"/g, '""')}"`
    ).join("\n");

    this.downloadFile("omnicalc_history.csv", "text/csv", headers + rows);
  }

  exportTXT() {
    if (this.history.length === 0) return alert("Riwayat kosong!");
    const text = this.history.map(h => 
      `[${new Date(h.timestamp).toLocaleString()}] (${h.mode})\n${h.expression} = ${h.result}\n`
    ).join("\n----------------------------------------\n\n");

    this.downloadFile("omnicalc_history.txt", "text/plain", text);
  }

  exportLaTeX() {
    if (this.history.length === 0) return alert("Riwayat kosong!");
    let latex = "% OmniCalc Pro History Export\n\\begin{align*}\n";
    latex += this.history.map(h => {
      const expr = h.expression.replace(/\*/g, ' \\times ').replace(/\//g, ' \\div ');
      return `  ${expr} &= ${h.result} \\\\`;
    }).join("\n");
    latex += "\n\\end{align*}\n";

    this.downloadFile("omnicalc_history.tex", "text/plain", latex);
  }

  downloadFile(filename, mimeType, content) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

window.HistoryManager = new HistoryManager();
