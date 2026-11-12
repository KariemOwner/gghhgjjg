/**
 * OmniCalc Pro - Programmer & Base-N Bitwise Engine
 * Supports 64-bit (QWORD), 32-bit (DWORD), 16-bit (WORD), 8-bit (BYTE)
 * Realtime Hex, Dec, Oct, Bin conversion, Bit shifts, Bitwise logic, 64-bit Bitboard.
 */

class ProgrammerEngine {
  constructor() {
    this.bitSize = 64; // 64, 32, 16, 8
    this.currentBase = 'DEC'; // 'HEX', 'DEC', 'OCT', 'BIN'
    this.isSigned = true;
    this.value = 0n; // BigInt
  }

  setBitSize(bits) {
    this.bitSize = parseInt(bits, 10);
    this.value = this.mask(this.value);
  }

  mask(val) {
    const maskMap = {
      64: 0xFFFFFFFFFFFFFFFFn,
      32: 0xFFFFFFFFn,
      16: 0xFFFFn,
      8: 0xFFn
    };
    return val & maskMap[this.bitSize];
  }

  toSigned(val) {
    const v = this.mask(val);
    const signBit = 1n << BigInt(this.bitSize - 1);
    if (v & signBit) {
      const maxVal = 1n << BigInt(this.bitSize);
      return v - maxVal;
    }
    return v;
  }

  setValue(val, base = 10) {
    try {
      if (typeof val === 'bigint') {
        this.value = this.mask(val);
      } else if (typeof val === 'number') {
        this.value = this.mask(BigInt(Math.trunc(val)));
      } else {
        const cleanStr = String(val).trim().replace(/\s+/g, '');
        if (!cleanStr) {
          this.value = 0n;
          return;
        }
        if (base === 16) this.value = this.mask(BigInt('0x' + cleanStr));
        else if (base === 8) this.value = this.mask(BigInt('0o' + cleanStr));
        else if (base === 2) this.value = this.mask(BigInt('0b' + cleanStr));
        else this.value = this.mask(BigInt(cleanStr));
      }
    } catch {
      // Ignore parse errors on partial typing
    }
  }

  getHex() {
    const hex = this.mask(this.value).toString(16).toUpperCase();
    // Group in 4 characters
    return hex.padStart(Math.ceil(this.bitSize / 4), '0').match(/.{1,4}/g)?.join(' ') || hex;
  }

  getDec() {
    return this.isSigned ? this.toSigned(this.value).toString(10) : this.mask(this.value).toString(10);
  }

  getOct() {
    return this.mask(this.value).toString(8);
  }

  getBin() {
    const bin = this.mask(this.value).toString(2).padStart(this.bitSize, '0');
    // Group in nibbles (4 bits)
    return bin.match(/.{1,4}/g)?.join(' ') || bin;
  }

  getBitArray() {
    const bin = this.mask(this.value).toString(2).padStart(64, '0');
    return bin.split('').map(b => b === '1');
  }

  toggleBit(bitIndex) {
    if (bitIndex >= 0 && bitIndex < 64) {
      const bitMask = 1n << BigInt(bitIndex);
      this.value = this.mask(this.value ^ bitMask);
    }
  }

  // Bitwise Operations
  and(otherVal) {
    this.value = this.mask(this.value & this.mask(BigInt(otherVal)));
    return this.value;
  }

  or(otherVal) {
    this.value = this.mask(this.value | this.mask(BigInt(otherVal)));
    return this.value;
  }

  xor(otherVal) {
    this.value = this.mask(this.value ^ this.mask(BigInt(otherVal)));
    return this.value;
  }

  not() {
    this.value = this.mask(~this.value);
    return this.value;
  }

  nand(otherVal) {
    this.value = this.mask(~(this.value & this.mask(BigInt(otherVal))));
    return this.value;
  }

  nor(otherVal) {
    this.value = this.mask(~(this.value | this.mask(BigInt(otherVal))));
    return this.value;
  }

  xnor(otherVal) {
    this.value = this.mask(~(this.value ^ this.mask(BigInt(otherVal))));
    return this.value;
  }

  lsh(shiftAmount = 1n) {
    this.value = this.mask(this.value << BigInt(shiftAmount));
    return this.value;
  }

  rsh(shiftAmount = 1n) {
    this.value = this.mask(this.value >> BigInt(shiftAmount));
    return this.value;
  }

  rol(shiftAmount = 1n) {
    const shift = BigInt(shiftAmount) % BigInt(this.bitSize);
    const v = this.mask(this.value);
    const rotated = (v << shift) | (v >> (BigInt(this.bitSize) - shift));
    this.value = this.mask(rotated);
    return this.value;
  }

  ror(shiftAmount = 1n) {
    const shift = BigInt(shiftAmount) % BigInt(this.bitSize);
    const v = this.mask(this.value);
    const rotated = (v >> shift) | (v << (BigInt(this.bitSize) - shift));
    this.value = this.mask(rotated);
    return this.value;
  }

  byteSwap() {
    let v = this.mask(this.value);
    let swapped = 0n;
    const bytes = this.bitSize / 8;
    for (let i = 0; i < bytes; i++) {
      const byte = (v >> BigInt(i * 8)) & 0xFFn;
      swapped |= (byte << BigInt((bytes - 1 - i) * 8));
    }
    this.value = this.mask(swapped);
    return this.value;
  }
}

window.ProgrammerEngine = ProgrammerEngine;
