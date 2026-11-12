/**
 * OmniCalc Pro - Advanced Mathematical Parser & Evaluator Engine
 * Features: Shunting-yard AST generation, implicit multiplication,
 * prefix/postfix operators, custom functions, angle modes, physical constants.
 */

class MathParser {
  constructor() {
    this.angleMode = 'DEG'; // 'DEG', 'RAD', 'GRAD'
    this.constants = {
      pi: Math.PI,
      PI: Math.PI,
      π: Math.PI,
      e: Math.E,
      E: Math.E,
      phi: 1.618033988749895, // Golden Ratio
      c: 299792458, // Speed of Light (m/s)
      G: 6.67430e-11, // Gravitational Constant (m^3 kg^-1 s^-2)
      h: 6.62607015e-34, // Planck Constant (J s)
      k: 1.380649e-23, // Boltzmann Constant (J/K)
      Na: 6.02214076e23, // Avogadro Constant (mol^-1)
      me: 9.1093837015e-31, // Electron mass (kg)
      eps0: 8.8541878128e-12, // Vacuum permittivity
      mu0: 1.25663706212e-6 // Vacuum permeability
    };

    this.functions = {
      sin: (x) => Math.sin(this.toRadians(x)),
      cos: (x) => Math.cos(this.toRadians(x)),
      tan: (x) => {
        const rad = this.toRadians(x);
        const cos = Math.cos(rad);
        if (Math.abs(cos) < 1e-15) throw new Error("Undefined (Tan asymptot)");
        return Math.tan(rad);
      },
      asin: (x) => {
        if (x < -1 || x > 1) throw new Error("Domain Error: asin [-1, 1]");
        return this.fromRadians(Math.asin(x));
      },
      acos: (x) => {
        if (x < -1 || x > 1) throw new Error("Domain Error: acos [-1, 1]");
        return this.fromRadians(Math.acos(x));
      },
      atan: (x) => this.fromRadians(Math.atan(x)),
      sinh: (x) => Math.sinh(x),
      cosh: (x) => Math.cosh(x),
      tanh: (x) => Math.tanh(x),
      asinh: (x) => Math.asinh(x),
      acosh: (x) => {
        if (x < 1) throw new Error("Domain Error: acosh [1, ∞)");
        return Math.acosh(x);
      },
      atanh: (x) => {
        if (x <= -1 || x >= 1) throw new Error("Domain Error: atanh (-1, 1)");
        return Math.atanh(x);
      },
      ln: (x) => {
        if (x <= 0) throw new Error("Domain Error: ln (0, ∞)");
        return Math.log(x);
      },
      log: (x) => {
        if (x <= 0) throw new Error("Domain Error: log (0, ∞)");
        return Math.log10(x);
      },
      log2: (x) => {
        if (x <= 0) throw new Error("Domain Error: log2 (0, ∞)");
        return Math.log2(x);
      },
      sqrt: (x) => {
        if (x < 0) throw new Error("Domain Error: sqrt non-negatif");
        return Math.sqrt(x);
      },
      cbrt: (x) => Math.cbrt(x),
      abs: (x) => Math.abs(x),
      exp: (x) => Math.exp(x),
      floor: (x) => Math.floor(x),
      ceil: (x) => Math.ceil(x),
      round: (x) => Math.round(x),
      fact: (x) => this.factorial(x),
      gamma: (x) => this.gamma(x),
      ncr: (n, r) => this.nCr(n, r),
      npr: (n, r) => this.nPr(n, r),
      rand: () => Math.random()
    };
  }

  setAngleMode(mode) {
    if (['DEG', 'RAD', 'GRAD'].includes(mode)) {
      this.angleMode = mode;
    }
  }

  toRadians(angle) {
    if (this.angleMode === 'DEG') return (angle * Math.PI) / 180;
    if (this.angleMode === 'GRAD') return (angle * Math.PI) / 200;
    return angle; // RAD
  }

  fromRadians(rad) {
    if (this.angleMode === 'DEG') return (rad * 180) / Math.PI;
    if (this.angleMode === 'GRAD') return (rad * 200) / Math.PI;
    return rad; // RAD
  }

  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
      // Use gamma function for non-integers if needed
      if (n < 0 && Number.isInteger(n)) throw new Error("Factorial non-negatif");
      return this.gamma(n + 1);
    }
    if (n > 170) return Infinity; // Overflow standard double
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  // Lanczos approximation for Gamma function
  gamma(z) {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
    z -= 1;
    const g = 7;
    const C = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    let x = C[0];
    for (let i = 1; i < g + 2; i++) x += C[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  nPr(n, r) {
    if (n < r || n < 0 || r < 0) throw new Error("nPr Error: n >= r >= 0");
    return this.factorial(n) / this.factorial(n - r);
  }

  nCr(n, r) {
    if (n < r || n < 0 || r < 0) throw new Error("nCr Error: n >= r >= 0");
    return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
  }

  /**
   * Pre-process expression string
   */
  preprocess(expr) {
    let clean = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\s+/g, '')
      .replace(/(\d+)!/g, 'fact($1)')
      .replace(/(\d+)%/g, '($1/100)');

    // Add implicit multiplication: 2pi -> 2*pi, 3(4) -> 3*(4), (2)(3) -> (2)*(3)
    clean = clean.replace(/(\d)([a-zA-Zπ(])/g, '$1*$2');
    clean = clean.replace(/(\))(\d|[a-zA-Zπ(])/g, '$1*$2');
    clean = clean.replace(/(π)([0-9a-zA-Z(])/g, '$1*$2');

    return clean;
  }

  /**
   * Tokenize arithmetic expression
   */
  tokenize(expr) {
    const tokens = [];
    const pattern = /\d+\.?\d*(?:e[+-]?\d+)?|[a-zA-Z_π][a-zA-Z0-9_]*|==|!=|<=|>=|[+\-*/^%(),<>!]/gi;
    let match;

    while ((match = pattern.exec(expr)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  }

  /**
   * Evaluate mathematical expression string
   * @param {string} expr 
   * @param {object} scope Additional variables like {x: 5}
   */
  evaluate(expr, scope = {}) {
    if (!expr || expr.trim() === '') return 0;
    const cleanExpr = this.preprocess(expr);
    const tokens = this.tokenize(cleanExpr);

    // Operator Precedence & Associativity
    const ops = {
      '+': { prec: 1, assoc: 'L', fn: (a, b) => a + b },
      '-': { prec: 1, assoc: 'L', fn: (a, b) => a - b },
      '*': { prec: 2, assoc: 'L', fn: (a, b) => a * b },
      '/': { prec: 2, assoc: 'L', fn: (a, b) => {
        if (b === 0) throw new Error("Divide by Zero");
        return a / b;
      }},
      '%': { prec: 2, assoc: 'L', fn: (a, b) => a % b },
      'mod': { prec: 2, assoc: 'L', fn: (a, b) => a % b },
      '^': { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
      'u-': { prec: 4, assoc: 'R', fn: (a) => -a },
      'u+': { prec: 4, assoc: 'R', fn: (a) => a }
    };

    const outputQueue = [];
    const opStack = [];
    let prevToken = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Number literal
      if (!isNaN(parseFloat(token)) && isFinite(token)) {
        outputQueue.push({ type: 'num', value: parseFloat(token) });
      }
      // Functions
      else if (this.functions[token.toLowerCase()]) {
        opStack.push({ type: 'fn', name: token.toLowerCase() });
      }
      // Variables & Constants
      else if (token in scope) {
        outputQueue.push({ type: 'num', value: scope[token] });
      } else if (token in this.constants) {
        outputQueue.push({ type: 'num', value: this.constants[token] });
      }
      // Function Argument Separator (comma)
      else if (token === ',') {
        while (opStack.length > 0 && opStack[opStack.length - 1].symbol !== '(') {
          outputQueue.push(opStack.pop());
        }
      }
      // Left Parenthesis
      else if (token === '(') {
        opStack.push({ type: 'paren', symbol: '(' });
      }
      // Right Parenthesis
      else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1].symbol !== '(') {
          outputQueue.push(opStack.pop());
        }
        if (opStack.length === 0) throw new Error("Mismatched Parentheses");
        opStack.pop(); // Pop '('

        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'fn') {
          outputQueue.push(opStack.pop());
        }
      }
      // Operators (+, -, *, /, ^, etc.)
      else if (token in ops) {
        let opKey = token;
        // Check for unary plus / minus
        if (token === '-' || token === '+') {
          if (prevToken === null || prevToken === '(' || prevToken === ',' || prevToken in ops) {
            opKey = token === '-' ? 'u-' : 'u+';
          }
        }

        const op = { ...ops[opKey], type: 'op', symbol: opKey };

        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'op') {
            if ((op.assoc === 'L' && op.prec <= top.prec) || (op.assoc === 'R' && op.prec < top.prec)) {
              outputQueue.push(opStack.pop());
            } else break;
          } else break;
        }
        opStack.push(op);
      }
      else {
        throw new Error(`Unrecognized symbol: ${token}`);
      }

      prevToken = token;
    }

    while (opStack.length > 0) {
      const top = opStack.pop();
      if (top.symbol === '(') throw new Error("Mismatched Parentheses");
      outputQueue.push(top);
    }

    // Evaluate RPN Output Queue
    const evalStack = [];

    for (let item of outputQueue) {
      if (item.type === 'num') {
        evalStack.push(item.value);
      } else if (item.type === 'fn') {
        if (item.name === 'ncr' || item.name === 'npr') {
          if (evalStack.length < 2) throw new Error("Invalid function parameters for nCr/nPr");
          const r = evalStack.pop();
          const n = evalStack.pop();
          evalStack.push(this.functions[item.name](n, r));
        } else {
          if (evalStack.length < 1) throw new Error("Invalid function parameters");
          const arg = evalStack.pop();
          evalStack.push(this.functions[item.name](arg));
        }
      } else if (item.type === 'op') {
        if (item.symbol === 'u-' || item.symbol === 'u+') {
          if (evalStack.length < 1) throw new Error("Invalid syntax");
          const a = evalStack.pop();
          evalStack.push(item.fn(a));
        } else {
          if (evalStack.length < 2) throw new Error("Invalid binary operation");
          const b = evalStack.pop();
          const a = evalStack.pop();
          evalStack.push(item.fn(a, b));
        }
      }
    }

    if (evalStack.length !== 1) throw new Error("Evaluation Syntax Error");
    const result = evalStack[0];

    // Precision rounding for floating point artifact mitigation (e.g., 0.1 + 0.2 = 0.3)
    if (typeof result === 'number' && Number.isFinite(result)) {
      return Math.abs(result) < 1e-14 ? 0 : Number(result.toPrecision(14)) / 1;
    }
    return result;
  }

  /**
   * Safe live preview evaluation without throwing
   */
  safePreview(expr, scope = {}) {
    try {
      if (!expr || expr.trim() === '') return '';
      const res = this.evaluate(expr, scope);
      return isNaN(res) ? '' : '= ' + res;
    } catch {
      return '';
    }
  }
}

window.MathParser = MathParser;
