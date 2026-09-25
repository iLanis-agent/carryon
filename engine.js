/* CarryOn engine - carry-on baggage rules checker. Pure logic, no DOM. */
(function (root) {
  'use strict';

  // Published cabin-bag limits (cm, kg). maxKg null = airline states no weight limit.
  const AIRLINES = [
    { id: 'ryanair',    name: 'Ryanair',          maxL: 55, maxW: 40, maxH: 20, maxKg: 10 },
    { id: 'easyjet',    name: 'easyJet',          maxL: 56, maxW: 45, maxH: 25, maxKg: 15 },
    { id: 'wizz',       name: 'Wizz Air',         maxL: 55, maxW: 40, maxH: 23, maxKg: 10 },
    { id: 'vueling',    name: 'Vueling',          maxL: 55, maxW: 40, maxH: 20, maxKg: 10 },
    { id: 'lufthansa',  name: 'Lufthansa',        maxL: 55, maxW: 40, maxH: 23, maxKg: 8 },
    { id: 'ba',         name: 'British Airways',  maxL: 56, maxW: 45, maxH: 25, maxKg: 23 },
    { id: 'airfrance',  name: 'Air France',       maxL: 55, maxW: 35, maxH: 25, maxKg: 12 },
    { id: 'klm',        name: 'KLM',              maxL: 55, maxW: 35, maxH: 25, maxKg: 12 },
    { id: 'turkish',    name: 'Turkish Airlines', maxL: 55, maxW: 40, maxH: 23, maxKg: 8 },
    { id: 'emirates',   name: 'Emirates',         maxL: 55, maxW: 38, maxH: 20, maxKg: 7 },
    { id: 'qatar',      name: 'Qatar Airways',    maxL: 50, maxW: 37, maxH: 25, maxKg: 7 },
    { id: 'united',     name: 'United',           maxL: 56, maxW: 35, maxH: 22, maxKg: null },
    { id: 'delta',      name: 'Delta',            maxL: 56, maxW: 35, maxH: 23, maxKg: null },
    { id: 'american',   name: 'American',         maxL: 56, maxW: 36, maxH: 23, maxKg: null },
    { id: 'southwest',  name: 'Southwest',        maxL: 61, maxW: 41, maxH: 28, maxKg: null },
    { id: 'elal',       name: 'El Al',            maxL: 56, maxW: 45, maxH: 25, maxKg: 8 }
  ];

  function num(v, name) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || isNaN(n)) throw new Error(name + ' must be a number');
    return n;
  }

  function sort3(a, b, c) { return [a, b, c].sort(function (x, y) { return y - x; }); }

  function parseBag(bag) {
    if (!bag || typeof bag !== 'object') throw new Error('bag required');
    const l = num(bag.l, 'length'), w = num(bag.w, 'width'), h = num(bag.h, 'height');
    const kg = bag.kg === undefined || bag.kg === null || bag.kg === '' ? null : num(bag.kg, 'weight');
    for (const [v, n] of [[l, 'length'], [w, 'width'], [h, 'height']]) {
      if (v <= 0 || v > 120) throw new Error(n + ' must be in (0, 120] cm');
    }
    if (kg !== null && (kg <= 0 || kg > 60)) throw new Error('weight must be in (0, 60] kg');
    return { dims: sort3(l, w, h), kg: kg };
  }

  function airlineById(id) {
    const a = AIRLINES.find(function (x) { return x.id === id; });
    if (!a) throw new Error('unknown airline: ' + id);
    return a;
  }

  function check(bag, airlineId) {
    const b = parseBag(bag);
    const a = airlineById(airlineId);
    const limits = sort3(a.maxL, a.maxW, a.maxH);
    const margins = [limits[0] - b.dims[0], limits[1] - b.dims[1], limits[2] - b.dims[2]];
    const fitsSize = margins.every(function (m) { return m >= 0; });
    const overKg = a.maxKg !== null && b.kg !== null ? +(b.kg - a.maxKg).toFixed(2) : null;
    const fitsWeight = a.maxKg === null || b.kg === null || b.kg <= a.maxKg;
    return {
      airline: a.id, name: a.name,
      fits: fitsSize && fitsWeight,
      fitsSize: fitsSize, fitsWeight: fitsWeight,
      minMargin: Math.min.apply(null, margins),
      margins: margins,
      overKg: overKg,
      weightLimitKnown: a.maxKg !== null
    };
  }

  function scan(bag) {
    const b = parseBag(bag); // validates once up front
    const results = AIRLINES.map(function (a) { return check(bag, a.id); });
    const passing = results.filter(function (r) { return r.fits; });
    const failing = results.filter(function (r) { return !r.fits; });
    let strictest = null;
    for (const r of passing) {
      if (!strictest || r.minMargin < strictest.minMargin) strictest = r;
    }
    return {
      results: results,
      fitsCount: passing.length,
      total: results.length,
      fitsAll: failing.length === 0,
      strictestPass: strictest,
      failingNames: failing.map(function (r) { return r.name; })
    };
  }

  const api = { AIRLINES: AIRLINES, check: check, scan: scan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CarryOnEngine = api;
})(typeof self !== 'undefined' ? self : this);
