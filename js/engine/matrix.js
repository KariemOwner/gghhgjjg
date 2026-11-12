/**
 * OmniCalc Pro - Matrix & Vector Linear Algebra Engine
 * Matrix Operations (Det, Inv, Transpose, Rank, Mult, Trace) & 3D Vectors.
 */

class MatrixEngine {
  /**
   * Add two matrices
   */
  static add(A, B) {
    const rows = A.length;
    const cols = A[0].length;
    if (rows !== B.length || cols !== B[0].length) {
      throw new Error("Matrix dimensions must match for addition");
    }
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
  }

  /**
   * Subtract two matrices
   */
  static subtract(A, B) {
    const rows = A.length;
    const cols = A[0].length;
    if (rows !== B.length || cols !== B[0].length) {
      throw new Error("Matrix dimensions must match for subtraction");
    }
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
  }

  /**
   * Scalar multiplication
   */
  static scalarMultiply(A, k) {
    return A.map(row => row.map(val => val * k));
  }

  /**
   * Matrix multiplication
   */
  static multiply(A, B) {
    const rA = A.length;
    const cA = A[0].length;
    const rB = B.length;
    const cB = B[0].length;

    if (cA !== rB) {
      throw new Error(`Cannot multiply: Columns of A (${cA}) != Rows of B (${rB})`);
    }

    const result = Array.from({ length: rA }, () => Array(cB).fill(0));

    for (let i = 0; i < rA; i++) {
      for (let j = 0; j < cB; j++) {
        let sum = 0;
        for (let k = 0; k < cA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  /**
   * Matrix Transpose
   */
  static transpose(A) {
    return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
  }

  /**
   * Matrix Trace
   */
  static trace(A) {
    if (A.length !== A[0].length) throw new Error("Matrix must be square for trace");
    return A.reduce((sum, row, i) => sum + row[i], 0);
  }

  /**
   * Determinant of square matrix (Recursive cofactor expansion / LU)
   */
  static determinant(A) {
    const n = A.length;
    if (n !== A[0].length) throw new Error("Matrix must be square for determinant");

    if (n === 1) return A[0][0];
    if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

    // Gaussian Elimination with Partial Pivoting for speed & numerical stability
    const M = A.map(row => [...row]);
    let det = 1;
    let sign = 1;

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
          maxRow = k;
        }
      }

      if (Math.abs(M[maxRow][i]) < 1e-12) return 0; // Singular

      if (maxRow !== i) {
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        sign *= -1;
      }

      det *= M[i][i];

      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j < n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    const res = det * sign;
    return Math.abs(res) < 1e-12 ? 0 : Number(res.toFixed(10));
  }

  /**
   * Inverse of square matrix using Gauss-Jordan Elimination
   */
  static inverse(A) {
    const n = A.length;
    if (n !== A[0].length) throw new Error("Matrix must be square for inverse");

    // Augment with identity matrix
    const aug = A.map((row, i) => {
      const identityRow = Array(n).fill(0);
      identityRow[i] = 1;
      return [...row, ...identityRow];
    });

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }

      if (Math.abs(aug[maxRow][i]) < 1e-12) {
        throw new Error("Matrix is singular (Non-invertible)");
      }

      if (maxRow !== i) {
        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
      }

      const pivot = aug[i][i];
      for (let j = 0; j < 2 * n; j++) {
        aug[i][j] /= pivot;
      }

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }

    // Extract right side (inverse)
    return aug.map(row => row.slice(n).map(val => Math.abs(val) < 1e-12 ? 0 : Number(val.toFixed(8))));
  }

  /**
   * Matrix Rank
   */
  static rank(A) {
    const R = A.map(row => [...row]);
    const rows = R.length;
    const cols = R[0].length;
    let rank = cols;

    for (let row = 0; row < rank; row++) {
      if (row < rows && R[row][row]) {
        for (let col = 0; col < rows; col++) {
          if (col !== row) {
            const mult = R[col][row] / R[row][row];
            for (let i = 0; i < rank; i++) {
              R[col][i] -= mult * R[row][i];
            }
          }
        }
      } else {
        let reduce = true;
        for (let i = row + 1; i < rows; i++) {
          if (R[i][row]) {
            [R[row], R[i]] = [R[i], R[row]];
            reduce = false;
            break;
          }
        }
        if (reduce) {
          rank--;
          for (let i = 0; i < rows; i++) {
            R[i][row] = R[i][rank];
          }
        }
        row--;
      }
    }
    return rank;
  }

  // ===================== VECTOR OPERATIONS =====================

  static vectorDot(u, v) {
    if (u.length !== v.length) throw new Error("Vectors must have same dimension");
    return u.reduce((sum, val, i) => sum + val * v[i], 0);
  }

  static vectorCross(u, v) {
    if (u.length !== 3 || v.length !== 3) {
      throw new Error("Cross product is only defined for 3D vectors");
    }
    return [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ];
  }

  static vectorMagnitude(u) {
    return Math.sqrt(u.reduce((sum, val) => sum + val * val, 0));
  }

  static vectorNormalize(u) {
    const mag = this.vectorMagnitude(u);
    if (mag === 0) throw new Error("Zero vector cannot be normalized");
    return u.map(val => val / mag);
  }

  static vectorAngle(u, v) {
    const dot = this.vectorDot(u, v);
    const magU = this.vectorMagnitude(u);
    const magV = this.vectorMagnitude(v);
    if (magU === 0 || magV === 0) throw new Error("Zero vector angle is undefined");
    const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
    const rad = Math.acos(cosTheta);
    return {
      radians: rad,
      degrees: (rad * 180) / Math.PI
    };
  }
}

window.MatrixEngine = MatrixEngine;
