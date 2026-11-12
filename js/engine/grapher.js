/**
 * OmniCalc Pro - Interactive 2D Function Graphing Engine
 * High-DPI Canvas Rendering, Multi-Function Plotting, Adaptive Grid,
 * Pan/Zoom, Tangent Line Derivatives, Root Finder.
 */

class GrapherEngine {
  constructor(canvasId, mathParser) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.parser = mathParser || new MathParser();

    // Viewport coordinates
    this.xMin = -10;
    this.xMax = 10;
    this.yMin = -7;
    this.yMax = 7;

    // Functions list
    this.functions = [
      { id: 'f1', expr: 'sin(x)', color: '#00f2fe', width: 2.5, enabled: true },
      { id: 'f2', expr: 'x^2 - 4', color: '#ec4899', width: 2.5, enabled: false }
    ];

    // Interaction states
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.cursorPos = null; // { x, y } in graph coordinates
    this.showTangent = true;
    this.showRoots = true;

    this.initEvents();
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.draw();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse drag for pan
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;

        const xSpan = this.xMax - this.xMin;
        const ySpan = this.yMax - this.yMin;

        const xShift = (dx / rect.width) * xSpan;
        const yShift = (dy / rect.height) * ySpan;

        this.xMin -= xShift;
        this.xMax -= xShift;
        this.yMin += yShift;
        this.yMax += yShift;

        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }

      // Cursor position in math units
      this.cursorPos = {
        x: this.toMathX(clientX),
        y: this.toMathY(clientY)
      };

      this.draw();
      this.notifyCoordsUpdate();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.cursorPos = null;
      this.draw();
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const mathX = this.toMathX(mouseX);
      const mathY = this.toMathY(mouseY);

      const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;

      this.xMin = mathX + (this.xMin - mathX) * zoomFactor;
      this.xMax = mathX + (this.xMax - mathX) * zoomFactor;
      this.yMin = mathY + (this.yMin - mathY) * zoomFactor;
      this.yMax = mathY + (this.yMax - mathY) * zoomFactor;

      this.draw();
      this.notifyCoordsUpdate();
    }, { passive: false });
  }

  notifyCoordsUpdate() {
    const coordsEl = document.getElementById('graphCoords');
    if (!coordsEl) return;
    if (!this.cursorPos) {
      coordsEl.textContent = `X: 0.00 | Y: 0.00`;
      return;
    }
    const x = this.cursorPos.x.toFixed(3);
    const y = this.cursorPos.y.toFixed(3);
    let str = `X: ${x} | Y: ${y}`;
    if (this.functions[0] && this.functions[0].enabled) {
      const fVal = this.evalFunc(this.functions[0].expr, this.cursorPos.x);
      if (fVal !== null && !isNaN(fVal) && isFinite(fVal)) {
        str += ` | f(x): ${fVal.toFixed(3)}`;
      }
    }
    coordsEl.textContent = str;
  }

  zoomIn() {
    this.zoom(0.75);
  }

  zoomOut() {
    this.zoom(1.33);
  }

  zoom(factor) {
    const xCenter = (this.xMin + this.xMax) / 2;
    const yCenter = (this.yMin + this.yMax) / 2;
    const xSpan = (this.xMax - this.xMin) * factor;
    const ySpan = (this.yMax - this.yMin) * factor;

    this.xMin = xCenter - xSpan / 2;
    this.xMax = xCenter + xSpan / 2;
    this.yMin = yCenter - ySpan / 2;
    this.yMax = yCenter + ySpan / 2;
    this.draw();
  }

  resetView() {
    this.xMin = -10;
    this.xMax = 10;
    this.yMin = -7;
    this.yMax = 7;
    this.draw();
  }

  // Coordinate Converters
  toScreenX(mathX) {
    const rect = this.canvas.getBoundingClientRect();
    return ((mathX - this.xMin) / (this.xMax - this.xMin)) * rect.width;
  }

  toScreenY(mathY) {
    const rect = this.canvas.getBoundingClientRect();
    return ((this.yMax - mathY) / (this.yMax - this.yMin)) * rect.height;
  }

  toMathX(screenX) {
    const rect = this.canvas.getBoundingClientRect();
    return this.xMin + (screenX / rect.width) * (this.xMax - this.xMin);
  }

  toMathY(screenY) {
    const rect = this.canvas.getBoundingClientRect();
    return this.yMax - (screenY / rect.height) * (this.yMax - this.yMin);
  }

  evalFunc(expr, xVal) {
    try {
      return this.parser.evaluate(expr, { x: xVal });
    } catch {
      return null;
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.ctx.clearRect(0, 0, width, height);

    this.drawGrid(width, height);
    this.drawAxes(width, height);

    // Plot all enabled functions
    for (let fnObj of this.functions) {
      if (fnObj.enabled && fnObj.expr.trim() !== '') {
        this.plotFunction(fnObj, width, height);
      }
    }

    // Cursor tracking line & tangent
    if (this.cursorPos) {
      this.drawCrosshair(width, height);
    }
  }

  drawGrid(width, height) {
    const xSpan = this.xMax - this.xMin;
    const ySpan = this.yMax - this.yMin;

    const xStep = this.calculateGridStep(xSpan);
    const yStep = this.calculateGridStep(ySpan);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '10px Fira Code, monospace';

    // Vertical grid lines
    const startX = Math.floor(this.xMin / xStep) * xStep;
    for (let x = startX; x <= this.xMax; x += xStep) {
      const screenX = this.toScreenX(x);
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, height);
      this.ctx.stroke();

      if (Math.abs(x) > 1e-9) {
        const screenY = Math.min(Math.max(this.toScreenY(0) + 12, 14), height - 6);
        this.ctx.fillText(Number(x.toFixed(4)), screenX + 3, screenY);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(this.yMin / yStep) * yStep;
    for (let y = startY; y <= this.yMax; y += yStep) {
      const screenY = this.toScreenY(y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(width, screenY);
      this.ctx.stroke();

      if (Math.abs(y) > 1e-9) {
        const screenX = Math.min(Math.max(this.toScreenX(0) + 4, 4), width - 35);
        this.ctx.fillText(Number(y.toFixed(4)), screenX, screenY - 3);
      }
    }
  }

  calculateGridStep(span) {
    const roughSteps = 10;
    const rawStep = span / roughSteps;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;

    if (residual < 1.5) return magnitude;
    if (residual < 3.5) return 2 * magnitude;
    if (residual < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }

  drawAxes(width, height) {
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';

    const originX = this.toScreenX(0);
    const originY = this.toScreenY(0);

    // Y Axis
    if (originX >= 0 && originX <= width) {
      this.ctx.beginPath();
      this.ctx.moveTo(originX, 0);
      this.ctx.lineTo(originX, height);
      this.ctx.stroke();
    }

    // X Axis
    if (originY >= 0 && originY <= height) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, originY);
      this.ctx.lineTo(width, originY);
      this.ctx.stroke();
    }
  }

  plotFunction(fnObj, width, height) {
    this.ctx.beginPath();
    this.ctx.lineWidth = fnObj.width;
    this.ctx.strokeStyle = fnObj.color;

    const sampleStep = 1; // 1px sampling
    let isDrawing = false;
    let prevY = null;

    for (let px = 0; px <= width; px += sampleStep) {
      const mathX = this.toMathX(px);
      const mathY = this.evalFunc(fnObj.expr, mathX);

      if (mathY === null || isNaN(mathY) || !isFinite(mathY)) {
        isDrawing = false;
        continue;
      }

      const py = this.toScreenY(mathY);

      // Prevent vertical asymptote spikes (like tan(x))
      if (prevY !== null && Math.abs(py - prevY) > height * 1.5) {
        isDrawing = false;
      }

      if (!isDrawing) {
        this.ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        this.ctx.lineTo(px, py);
      }
      prevY = py;
    }

    this.ctx.stroke();
  }

  drawCrosshair(width, height) {
    const sx = this.toScreenX(this.cursorPos.x);
    const sy = this.toScreenY(this.cursorPos.y);

    this.ctx.setLineDash([4, 4]);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';

    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(sx, 0);
    this.ctx.lineTo(sx, height);
    this.ctx.stroke();

    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(0, sy);
    this.ctx.lineTo(width, sy);
    this.ctx.stroke();

    this.ctx.setLineDash([]);

    // Tangent derivative visualization for primary function
    if (this.showTangent && this.functions[0] && this.functions[0].enabled) {
      const x0 = this.cursorPos.x;
      const h = 1e-5;
      const y0 = this.evalFunc(this.functions[0].expr, x0);
      const y1 = this.evalFunc(this.functions[0].expr, x0 + h);

      if (y0 !== null && y1 !== null && isFinite(y0) && isFinite(y1)) {
        const slope = (y1 - y0) / h;
        const screenX0 = this.toScreenX(x0);
        const screenY0 = this.toScreenY(y0);

        // Point dot
        this.ctx.fillStyle = '#00f2fe';
        this.ctx.beginPath();
        this.ctx.arc(screenX0, screenY0, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Tangent line segment
        const deltaX = (this.xMax - this.xMin) * 0.15;
        const xA = x0 - deltaX;
        const yA = y0 - slope * deltaX;
        const xB = x0 + deltaX;
        const yB = y0 + slope * deltaX;

        this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.toScreenX(xA), this.toScreenY(yA));
        this.ctx.lineTo(this.toScreenX(xB), this.toScreenY(yB));
        this.ctx.stroke();
      }
    }
  }
}

window.GrapherEngine = GrapherEngine;
