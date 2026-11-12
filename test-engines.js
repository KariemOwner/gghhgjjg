// Automated Engine Verification Suite
const fs = require('fs');

// Mock window and browser environment
global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Load modules
require('./js/engine/math-parser.js');
require('./js/engine/programmer.js');
require('./js/engine/matrix.js');
require('./js/engine/statistics.js');
require('./js/engine/solver.js');
require('./js/engine/financial.js');
require('./js/engine/converter.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Test MathParser
console.log("\n--- Testing MathParser ---");
const parser = new window.MathParser();
assert(parser.evaluate("3 + 5 * 2") === 13, "Precedence: 3 + 5 * 2 = 13");
assert(parser.evaluate("(3 + 5) * 2") === 16, "Parentheses: (3 + 5) * 2 = 16");
assert(Math.abs(parser.evaluate("sin(30)") - 0.5) < 1e-9, "Degree sin(30) = 0.5");
parser.setAngleMode('RAD');
assert(Math.abs(parser.evaluate("sin(pi / 2)") - 1) < 1e-9, "Radian sin(pi/2) = 1");
parser.setAngleMode('DEG');
assert(parser.evaluate("fact(5)") === 120, "Factorial: 5! = 120");
assert(parser.evaluate("nCr(5, 2)") === 10, "Combinations: 5 nCr 2 = 10");

// 2. Test ProgrammerEngine
console.log("\n--- Testing ProgrammerEngine ---");
const prog = new window.ProgrammerEngine();
prog.setValue(255);
assert(prog.getHex().replace(/\s+/g, '').endsWith('FF'), "Decimal 255 to Hex is FF");
assert(prog.getBin().replace(/\s+/g, '').endsWith('11111111'), "Decimal 255 to Bin is 11111111");
prog.setValue(0x0F);
prog.not();
prog.setBitSize(8);
assert(prog.mask(prog.value) === 0xF0n, "8-bit NOT 0x0F = 0xF0");

// 3. Test MatrixEngine
console.log("\n--- Testing MatrixEngine ---");
const A = [
  [1, 2],
  [3, 4]
];
const detA = window.MatrixEngine.determinant(A);
assert(detA === -2, "Determinant 2x2: (1*4 - 2*3) = -2");

const invA = window.MatrixEngine.inverse(A);
assert(Math.abs(invA[0][0] - (-2)) < 1e-6 && Math.abs(invA[0][1] - 1) < 1e-6, "Matrix Inverse computation");

// 4. Test StatisticsEngine
console.log("\n--- Testing StatisticsEngine ---");
const data = [10, 20, 30, 40, 50];
const stats = window.StatisticsEngine.analyze1D(data);
assert(stats.mean === 30, "Mean = 30");
assert(stats.median === 30, "Median = 30");
assert(stats.min === 10 && stats.max === 50, "Min/Max calculation");

// 5. Test EquationSolver
console.log("\n--- Testing EquationSolver ---");
const quad = window.EquationSolver.solveQuadratic(1, -5, 6);
assert(quad.roots.includes(3) && quad.roots.includes(2), "Quadratic roots for x^2 - 5x + 6 = 0 are 2, 3");

const spldv = window.EquationSolver.solveLinear2x2(2, 3, 8, 1, -1, -1);
assert(Math.abs(spldv.x - 1) < 1e-6 && Math.abs(spldv.y - 2) < 1e-6, "SPLDV 2x + 3y = 8 and x - y = -1 gives x=1, y=2");

// 6. Test UnitConverterEngine
console.log("\n--- Testing UnitConverterEngine ---");
const conv = new window.UnitConverterEngine();
assert(conv.convert(1, 'length', 'km', 'm') === 1000, "1 km = 1000 m");
assert(conv.convert(100, 'temperature', 'C', 'F') === 212, "100 °C = 212 °F");

// 7. Test FinancialEngine
console.log("\n--- Testing FinancialEngine ---");
const emi = Math.abs(window.FinancialEngine.calcPMT(12, 12, 1000000));
assert(emi > 0 && Math.round(emi) === 88849, "Loan EMI calculation accuracy");

console.log(`\n===============================`);
console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`===============================\n`);
