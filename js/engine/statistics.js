/**
 * OmniCalc Pro - Statistics & Probability Engine
 * 1-Var Descriptive Stats, Linear Regression (Pearson r, R^2), Normal Distribution & Z-Score.
 */

class StatisticsEngine {
  /**
   * Parse numerical list from text
   */
  static parseData(text) {
    if (!text) return [];
    return text
      .trim()
      .split(/[\s,;]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n));
  }

  /**
   * 1-Variable Descriptive Statistics
   */
  static analyze1D(data) {
    if (!data || data.length === 0) throw new Error("Dataset is empty");

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Median & Quartiles
    const median = this.getPercentile(sorted, 50);
    const q1 = this.getPercentile(sorted, 25);
    const q3 = this.getPercentile(sorted, 75);
    const iqr = q3 - q1;

    // Min, Max, Range
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Variance & Standard Deviation
    const sumSqDiff = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const popVar = sumSqDiff / n;
    const popStd = Math.sqrt(popVar);
    const sampleVar = n > 1 ? sumSqDiff / (n - 1) : 0;
    const sampleStd = Math.sqrt(sampleVar);

    // Mode
    const freqMap = {};
    let maxFreq = 0;
    sorted.forEach(val => {
      freqMap[val] = (freqMap[val] || 0) + 1;
      if (freqMap[val] > maxFreq) maxFreq = freqMap[val];
    });

    const modes = Object.keys(freqMap)
      .filter(k => freqMap[k] === maxFreq && maxFreq > 1)
      .map(Number);

    return {
      count: n,
      sum,
      mean,
      median,
      modes: modes.length > 0 ? modes : 'No Mode',
      min,
      max,
      range,
      q1,
      q3,
      iqr,
      popVar,
      popStd,
      sampleVar,
      sampleStd
    };
  }

  static getPercentile(sorted, p) {
    if (sorted.length === 0) return 0;
    if (p <= 0) return sorted[0];
    if (p >= 100) return sorted[sorted.length - 1];

    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * 2-Variable Linear Regression: y = mx + c
   * @param {Array<{x: number, y: number}>} points 
   */
  static linearRegression(points) {
    const n = points.length;
    if (n < 2) throw new Error("At least 2 coordinate points required for regression");

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let pt of points) {
      sumX += pt.x;
      sumY += pt.y;
      sumXY += pt.x * pt.y;
      sumX2 += pt.x * pt.x;
      sumY2 += pt.y * pt.y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominator = n * sumX2 - sumX * sumX;
    if (Math.abs(denominator) < 1e-12) {
      throw new Error("Vertical line detected (undefined slope)");
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Pearson correlation r
    const rNumerator = n * sumXY - sumX * sumY;
    const rDenominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = rDenominator !== 0 ? rNumerator / rDenominator : 0;
    const r2 = r * r;

    return {
      n,
      slope,
      intercept,
      equation: `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+ ' + intercept.toFixed(4) : '- ' + Math.abs(intercept).toFixed(4)}`,
      r,
      r2
    };
  }

  /**
   * Normal Distribution CDF approximation using Error Function
   */
  static normalCDF(z) {
    return 0.5 * (1 + this.erf(z / Math.SQRT2));
  }

  // Abramowitz and Stegun approximation for erf(x)
  static erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Compute Z-score probabilities
   */
  static calcZScore(x, mean, stdDev) {
    if (stdDev <= 0) throw new Error("Standard deviation must be > 0");
    const z = (x - mean) / stdDev;
    const pLess = this.normalCDF(z);
    const pGreater = 1 - pLess;

    return {
      z,
      pLess, // P(X < x)
      pGreater // P(X > x)
    };
  }
}

window.StatisticsEngine = StatisticsEngine;
