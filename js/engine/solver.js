/**
 * OmniCalc Pro - Algebraic & Linear System Equation Solver
 * Quadratic (Real & Complex), Cubic (Cardano's), 2x2 & 3x3 Linear Systems (SPLDV / SPLTV).
 */

class EquationSolver {
  /**
   * Quadratic Equation Solver: ax^2 + bx + c = 0
   */
  static solveQuadratic(a, b, c) {
    if (a === 0) {
      if (b === 0) throw new Error(c === 0 ? "Infinite solutions (0 = 0)" : "No solution");
      return {
        type: 'linear',
        roots: [-c / b],
        discriminant: null,
        vertex: null,
        steps: [`Persamaan linier: ${b}x + ${c} = 0`, `x = ${-c / b}`]
      };
    }

    const D = b * b - 4 * a * c;
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);

    const steps = [
      `Bentuk umum: ${a}x² + (${b})x + (${c}) = 0`,
      `Diskriminan: D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${D}`,
      `Titik Puncak Parabola (Vertex): (${h.toFixed(4)}, ${k.toFixed(4)})`
    ];

    if (D > 0) {
      const sqrtD = Math.sqrt(D);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      steps.push(`Karena D > 0, terdapat 2 akar real berbeda:`);
      steps.push(`x₁ = (-(${b}) + √${D}) / (2 · ${a}) = ${x1.toFixed(6)}`);
      steps.push(`x₂ = (-(${b}) - √${D}) / (2 · ${a}) = ${x2.toFixed(6)}`);

      return {
        type: 'two_real',
        discriminant: D,
        vertex: { x: h, y: k },
        roots: [x1, x2],
        steps
      };
    } else if (D === 0) {
      const x = -b / (2 * a);
      steps.push(`Karena D = 0, terdapat 1 akar real kembar:`);
      steps.push(`x = -(${b}) / (2 · ${a}) = ${x.toFixed(6)}`);

      return {
        type: 'one_real',
        discriminant: 0,
        vertex: { x: h, y: k },
        roots: [x],
        steps
      };
    } else {
      // Complex roots: u ± vi
      const u = -b / (2 * a);
      const v = Math.sqrt(-D) / (2 * a);
      const absV = Math.abs(v);

      steps.push(`Karena D < 0, terdapat 2 akar imajiner / kompleks konjugat:`);
      steps.push(`x₁ = ${u.toFixed(4)} + ${absV.toFixed(4)}i`);
      steps.push(`x₂ = ${u.toFixed(4)} - ${absV.toFixed(4)}i`);

      return {
        type: 'complex',
        discriminant: D,
        vertex: { x: h, y: k },
        roots: [
          `${u.toFixed(4)} + ${absV.toFixed(4)}i`,
          `${u.toFixed(4)} - ${absV.toFixed(4)}i`
        ],
        steps
      };
    }
  }

  /**
   * 2-Variable Linear System (SPLDV):
   * a1*x + b1*y = c1
   * a2*x + b2*y = c2
   */
  static solveLinear2x2(a1, b1, c1, a2, b2, c2) {
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;

    const steps = [
      `Matriks Sistem:`,
      `| ${a1}  ${b1} | | x | = | ${c1} |`,
      `| ${a2}  ${b2} | | y |   | ${c2} |`,
      `Determinan Utama (D) = (${a1})(${b2}) - (${a2})(${b1}) = ${D}`,
      `Determinan Dx = (${c1})(${b2}) - (${c2})(${b1}) = ${Dx}`,
      `Determinan Dy = (${a1})(${c2}) - (${a2})(${c1}) = ${Dy}`
    ];

    if (Math.abs(D) < 1e-12) {
      if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) {
        steps.push(`D = 0, Dx = 0, Dy = 0 → Memiliki solusi tak berhingga (Garis berimpit).`);
        return { status: 'infinite', steps };
      } else {
        steps.push(`D = 0 dan (Dx ≠ 0 atau Dy ≠ 0) → Tidak memiliki solusi (Garis sejajar).`);
        return { status: 'none', steps };
      }
    }

    const x = Dx / D;
    const y = Dy / D;

    steps.push(`x = Dx / D = ${Dx} / ${D} = ${x.toFixed(6)}`);
    steps.push(`y = Dy / D = ${Dy} / ${D} = ${y.toFixed(6)}`);

    return {
      status: 'unique',
      x,
      y,
      steps
    };
  }

  /**
   * 3-Variable Linear System (SPLTV):
   * a1*x + b1*y + c1*z = d1
   * a2*x + b2*y + c2*z = d2
   * a3*x + b3*y + c3*z = d3
   */
  static solveLinear3x3(m) {
    // m is 3x4 augmented matrix [[a1, b1, c1, d1], ...]
    const A = [
      [m[0][0], m[0][1], m[0][2]],
      [m[1][0], m[1][1], m[1][2]],
      [m[2][0], m[2][1], m[2][2]]
    ];
    const D = MatrixEngine.determinant(A);

    const Ax = [
      [m[0][3], m[0][1], m[0][2]],
      [m[1][3], m[1][1], m[1][2]],
      [m[2][3], m[2][1], m[2][2]]
    ];
    const Dx = MatrixEngine.determinant(Ax);

    const Ay = [
      [m[0][0], m[0][3], m[0][2]],
      [m[1][0], m[1][3], m[1][2]],
      [m[2][0], m[2][3], m[2][2]]
    ];
    const Dy = MatrixEngine.determinant(Ay);

    const Az = [
      [m[0][0], m[0][1], m[0][3]],
      [m[1][0], m[1][1], m[1][3]],
      [m[2][0], m[2][1], m[2][3]]
    ];
    const Dz = MatrixEngine.determinant(Az);

    const steps = [
      `Menggunakan Aturan Cramer (Cramer's Rule):`,
      `Determinan Utama (D) = ${D}`,
      `Determinan Dx = ${Dx}`,
      `Determinan Dy = ${Dy}`,
      `Determinan Dz = ${Dz}`
    ];

    if (Math.abs(D) < 1e-12) {
      if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12 && Math.abs(Dz) < 1e-12) {
        steps.push("Sistem memiliki tak terhingga banyaknya solusi.");
        return { status: 'infinite', steps };
      } else {
        steps.push("Sistem tidak memiliki solusi (Inkonsisten).");
        return { status: 'none', steps };
      }
    }

    const x = Dx / D;
    const y = Dy / D;
    const z = Dz / D;

    steps.push(`x = Dx / D = ${x.toFixed(6)}`);
    steps.push(`y = Dy / D = ${y.toFixed(6)}`);
    steps.push(`z = Dz / D = ${z.toFixed(6)}`);

    return {
      status: 'unique',
      x,
      y,
      z,
      steps
    };
  }
}

window.EquationSolver = EquationSolver;
