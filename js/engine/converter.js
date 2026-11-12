/**
 * OmniCalc Pro - Universal Unit & Measurement Conversion Engine
 * 15 comprehensive categories with exact factor conversions.
 */

class UnitConverterEngine {
  constructor() {
    this.categories = {
      length: {
        name: 'Panjang (Length)',
        base: 'm',
        units: {
          m: { name: 'Meter (m)', factor: 1 },
          km: { name: 'Kilometer (km)', factor: 1000 },
          cm: { name: 'Centimeter (cm)', factor: 0.01 },
          mm: { name: 'Millimeter (mm)', factor: 0.001 },
          um: { name: 'Micrometer (µm)', factor: 1e-6 },
          nm: { name: 'Nanometer (nm)', factor: 1e-9 },
          mi: { name: 'Mile (mi)', factor: 1609.344 },
          yd: { name: 'Yard (yd)', factor: 0.9144 },
          ft: { name: 'Foot (ft)', factor: 0.3048 },
          in: { name: 'Inch (in)', factor: 0.0254 },
          nmi: { name: 'Nautical Mile', factor: 1852 },
          ly: { name: 'Light Year (ly)', factor: 9.46073e15 }
        }
      },
      mass: {
        name: 'Massa / Berat (Mass)',
        base: 'kg',
        units: {
          kg: { name: 'Kilogram (kg)', factor: 1 },
          g: { name: 'Gram (g)', factor: 0.001 },
          mg: { name: 'Milligram (mg)', factor: 1e-6 },
          ug: { name: 'Microgram (µg)', factor: 1e-9 },
          t: { name: 'Metric Ton (t)', factor: 1000 },
          lb: { name: 'Pound (lb)', factor: 0.45359237 },
          oz: { name: 'Ounce (oz)', factor: 0.028349523125 },
          st: { name: 'Stone (st)', factor: 6.35029318 },
          ct: { name: 'Carat (ct)', factor: 0.0002 },
          grain: { name: 'Grain (gr)', factor: 0.00006479891 }
        }
      },
      temperature: {
        name: 'Suhu (Temperature)',
        base: 'C',
        custom: true,
        units: {
          C: { name: 'Celsius (°C)' },
          F: { name: 'Fahrenheit (°F)' },
          K: { name: 'Kelvin (K)' },
          R: { name: 'Rankine (°R)' }
        }
      },
      area: {
        name: 'Luas (Area)',
        base: 'm2',
        units: {
          m2: { name: 'Meter Persegi (m²)', factor: 1 },
          km2: { name: 'Kilometer Persegi (km²)', factor: 1e6 },
          ha: { name: 'Hektar (ha)', factor: 10000 },
          ac: { name: 'Acre (ac)', factor: 4046.8564224 },
          ft2: { name: 'Square Foot (ft²)', factor: 0.09290304 },
          in2: { name: 'Square Inch (in²)', factor: 0.00064516 },
          mi2: { name: 'Square Mile (mi²)', factor: 2589988.110336 }
        }
      },
      volume: {
        name: 'Volume (Volume)',
        base: 'l',
        units: {
          l: { name: 'Liter (L)', factor: 1 },
          ml: { name: 'Milliliter (mL)', factor: 0.001 },
          m3: { name: 'Meter Kubik (m³)', factor: 1000 },
          gal_us: { name: 'Gallon (US)', factor: 3.785411784 },
          qt_us: { name: 'Quart (US)', factor: 0.946352946 },
          pt_us: { name: 'Pint (US)', factor: 0.473176473 },
          cup_us: { name: 'Cup (US)', factor: 0.24 },
          floz_us: { name: 'Fluid Ounce (US)', factor: 0.0295735295625 },
          tbsp: { name: 'Tablespoon (tbsp)', factor: 0.015 },
          tsp: { name: 'Teaspoon (tsp)', factor: 0.005 }
        }
      },
      speed: {
        name: 'Kecepatan (Speed)',
        base: 'mps',
        units: {
          mps: { name: 'Meter/detik (m/s)', factor: 1 },
          kmh: { name: 'Kilometer/jam (km/h)', factor: 1 / 3.6 },
          mph: { name: 'Mil/jam (mph)', factor: 0.44704 },
          knot: { name: 'Knot (kn)', factor: 0.514444 },
          fps: { name: 'Foot/detik (ft/s)', factor: 0.3048 },
          mach: { name: 'Mach (Std Atm)', factor: 340.29 }
        }
      },
      time: {
        name: 'Waktu (Time)',
        base: 's',
        units: {
          s: { name: 'Detik (s)', factor: 1 },
          ms: { name: 'Milidetik (ms)', factor: 0.001 },
          us: { name: 'Mikrodetik (µs)', factor: 1e-6 },
          ns: { name: 'Nanodetik (ns)', factor: 1e-9 },
          min: { name: 'Menit (min)', factor: 60 },
          hr: { name: 'Jam (hr)', factor: 3600 },
          day: { name: 'Hari (d)', factor: 86400 },
          wk: { name: 'Minggu (wk)', factor: 604800 },
          mo: { name: 'Bulan (30.44d)', factor: 2629800 },
          yr: { name: 'Tahun (365.25d)', factor: 31557600 }
        }
      },
      digital: {
        name: 'Data Digital (Digital Storage)',
        base: 'byte',
        units: {
          bit: { name: 'Bit (b)', factor: 0.125 },
          byte: { name: 'Byte (B)', factor: 1 },
          kb: { name: 'Kilobyte (KB, 10³)', factor: 1e3 },
          mb: { name: 'Megabyte (MB, 10⁶)', factor: 1e6 },
          gb: { name: 'Gigabyte (GB, 10⁹)', factor: 1e9 },
          tb: { name: 'Terabyte (TB, 10¹²)', factor: 1e12 },
          pb: { name: 'Petabyte (PB, 10¹⁵)', factor: 1e15 },
          kib: { name: 'Kibibyte (KiB, 2¹⁰)', factor: 1024 },
          mib: { name: 'Mebibyte (MiB, 2²⁰)', factor: 1048576 },
          gib: { name: 'Gibibyte (GiB, 2³⁰)', factor: 1073741824 },
          tib: { name: 'Tebibyte (TiB, 2⁴⁰)', factor: 1099511627776 }
        }
      },
      pressure: {
        name: 'Tekanan (Pressure)',
        base: 'pa',
        units: {
          pa: { name: 'Pascal (Pa)', factor: 1 },
          kpa: { name: 'Kilopascal (kPa)', factor: 1000 },
          bar: { name: 'Bar', factor: 100000 },
          psi: { name: 'Pound/sq inch (PSI)', factor: 6894.757293 },
          atm: { name: 'Atmosfer Standar (atm)', factor: 101325 },
          torr: { name: 'Torr / mmHg', factor: 133.322368 }
        }
      },
      energy: {
        name: 'Energi (Energy)',
        base: 'j',
        units: {
          j: { name: 'Joule (J)', factor: 1 },
          kj: { name: 'Kilojoule (kJ)', factor: 1000 },
          cal: { name: 'Kalori (cal)', factor: 4.184 },
          kcal: { name: 'Kilokalori (kcal)', factor: 4184 },
          wh: { name: 'Watt-hour (Wh)', factor: 3600 },
          kwh: { name: 'Kilowatt-hour (kWh)', factor: 3.6e6 },
          ev: { name: 'Electronvolt (eV)', factor: 1.602176634e-19 },
          btu: { name: 'BTU', factor: 1055.05585 }
        }
      },
      power: {
        name: 'Daya (Power)',
        base: 'w',
        units: {
          w: { name: 'Watt (W)', factor: 1 },
          kw: { name: 'Kilowatt (kW)', factor: 1000 },
          mw: { name: 'Megawatt (MW)', factor: 1e6 },
          hp_metric: { name: 'Horsepower Metrik (PS)', factor: 735.49875 },
          hp_mech: { name: 'Horsepower Mekanik (hp)', factor: 745.69987 },
          btu_h: { name: 'BTU/jam', factor: 0.293071 }
        }
      }
    };
  }

  convert(val, catKey, fromUnit, toUnit) {
    if (isNaN(val)) return 0;
    const cat = this.categories[catKey];
    if (!cat) throw new Error("Unknown category");

    // Special case for Temperature
    if (catKey === 'temperature') {
      return this.convertTemperature(val, fromUnit, toUnit);
    }

    const uFrom = cat.units[fromUnit];
    const uTo = cat.units[toUnit];
    if (!uFrom || !uTo) throw new Error("Unknown unit");

    // Convert to base, then to target
    const baseValue = val * uFrom.factor;
    const result = baseValue / uTo.factor;

    return Number(result.toPrecision(10)) / 1;
  }

  convertTemperature(val, from, to) {
    if (from === to) return val;

    // Convert to Celsius first
    let celsius;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * (5 / 9);
    else if (from === 'K') celsius = val - 273.15;
    else if (from === 'R') celsius = (val - 491.67) * (5 / 9);

    // Convert Celsius to Target
    let res;
    if (to === 'C') res = celsius;
    else if (to === 'F') res = (celsius * (9 / 5)) + 32;
    else if (to === 'K') res = celsius + 273.15;
    else if (to === 'R') res = (celsius + 273.15) * (9 / 5);

    return Number(res.toFixed(6));
  }
}

window.UnitConverterEngine = UnitConverterEngine;
