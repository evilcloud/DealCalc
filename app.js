// app.js — calculator logic
// CONFIG is fetched from config.json at boot

const $ = id => document.getElementById(id);

// ── Utility ──────────────────────────────────────────────────────────────────

const SEP = '\u202F';

function addSeps(str) {
  const clean = str.replace(/\D/g, '');
  return clean ? clean.replace(/\B(?=(\d{3})+(?!\d))/g, SEP) : '';
}

function parse(str) {
  return parseFloat(String(str).replace(/[\s\u202F]/g, '')) || 0;
}

function fmt(n) {
  if (isNaN(n) || !isFinite(n)) return '—';
  const neg = n < 0;
  const abs = Math.abs(Math.round(n));
  return (neg ? '-$' : '$') + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, SEP);
}

function setFmt(input, n) {
  const r = Math.round(n);
  input.value = r ? addSeps(r.toString()) : '';
}

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const iPrice       = $('i-price');
const iCommission  = $('i-commission');
const iTaxRate     = $('i-taxrate');
const iOfficialExp = $('i-officialexp');
const iTotalExp    = $('i-totalexp');
var iOtherExp      = $('i-otherexp');
const iCeoRatePct  = $('i-ceoratepct');
const iCeoCalc     = $('i-ceocalc');
const iCeoBonus    = $('i-ceobonus');

const rRemaining   = $('r-remaining');
const rTax         = $('r-tax');
const rCommission  = $('r-commission');
const rCeoBonus    = $('r-ceobonus');
const rPostTax     = $('r-posttax');
const linkBadge    = $('link-badge');
const installHint  = $('install-hint');

// ── State ─────────────────────────────────────────────────────────────────────

let bonusLinked = true;

// ── Dollar input formatting ───────────────────────────────────────────────────

const dollarInputs = [iPrice, iCommission, iOfficialExp, iTotalExp, iCeoBonus];

dollarInputs.forEach(function(inp) {
  inp.addEventListener('focus', function() {
    inp.value = inp.value.replace(/[\u202F\s]/g, '');
  });
  inp.addEventListener('blur', function() {
    var n = parse(inp.value);
    inp.value = n ? addSeps(inp.value.replace(/\D/g, '')) : inp.value;
  });
  inp.addEventListener('input', function() {
    if (inp !== iCeoBonus) calc();
  });
});

// ── Tax buttons ───────────────────────────────────────────────────────────────

document.querySelectorAll('.tax-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tax-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    iTaxRate.value = btn.dataset.val;
    calc();
  });
});

// ── CEO bonus rate ────────────────────────────────────────────────────────────

iCeoRatePct.addEventListener('input', calc);

// ── Commission zero button ────────────────────────────────────────────────────

$('commission-zero').addEventListener('click', function() {
  iCommission.value = '0';
  bonusLinked = true;
  linkBadge.textContent = 'авто';
  linkBadge.classList.remove('manual');
  calc();
});

// ── Bonus paid ────────────────────────────────────────────────────────────────

iCeoBonus.addEventListener('input', function() {
  bonusLinked = false;
  linkBadge.textContent = 'вручную';
  linkBadge.classList.add('manual');
  calc();
});

var lastTap = 0;
iCeoBonus.addEventListener('touchend', function(e) {
  var now = Date.now();
  if (now - lastTap < 350) { relink(); e.preventDefault(); }
  lastTap = now;
});
iCeoBonus.addEventListener('dblclick', relink);

function relink() {
  bonusLinked = true;
  linkBadge.textContent = 'авто';
  linkBadge.classList.remove('manual');
  calc();
}

// ── Core calculation ──────────────────────────────────────────────────────────

function calc() {
  var price       = parse(iPrice.value);
  var commAmt     = parse(iCommission.value);
  var taxRate     = parseFloat(iTaxRate.value)    || 0;
  var officialExp = parse(iOfficialExp.value);
  var totalExp    = parse(iTotalExp.value);
  var otherExp    = parse(iOtherExp.value);
  var ceoRate     = parseFloat(iCeoRatePct.value) || 0;

  var tax          = (price - officialExp) * (taxRate / 100);
  var postTax      = price - tax;
  var ceoBonusCalc = (postTax - commAmt - totalExp - otherExp) * (ceoRate / 100);

  setFmt(iCeoCalc, ceoBonusCalc);
  if (bonusLinked) setFmt(iCeoBonus, ceoBonusCalc);

  var ceoBonusPaid = parse(iCeoBonus.value);
  var remaining    = price - tax - commAmt - otherExp - ceoBonusPaid;

  rRemaining.textContent  = fmt(remaining);
  rRemaining.classList.toggle('negative', remaining < 0);
  rTax.textContent        = fmt(tax);
  rCommission.textContent = fmt(commAmt);
  rCeoBonus.textContent   = fmt(ceoBonusPaid);
  rPostTax.textContent    = fmt(postTax);

  flash(rRemaining);
}

// ── Apply a config object to the calculator ───────────────────────────────────

function applyToCalc(cfg) {
  setFmt(iPrice, cfg.salesPrice);
  setFmt(iCommission, cfg.commission);
  iCeoRatePct.value = cfg.ceoBonusRate;
  setFmt(iOfficialExp, cfg.officialExpenses);
  setFmt(iTotalExp, cfg.totalExpenses);
  setFmt(iOtherExp, cfg.otherExpenses || 0);
  iTaxRate.value = cfg.taxRate;
  document.querySelectorAll('.tax-btn').forEach(function(b) {
    b.classList.toggle('active', Number(b.dataset.val) === cfg.taxRate);
  });
  if (cfg.ceoBonusPaid != null) {
    bonusLinked = false;
    setFmt(iCeoBonus, cfg.ceoBonusPaid);
    linkBadge.textContent = 'вручную';
    linkBadge.classList.add('manual');
  } else {
    bonusLinked = true;
    linkBadge.textContent = 'авто';
    linkBadge.classList.remove('manual');
  }
  calc();
}

// ── Preset buttons — built dynamically from config.json ─────────────────────

function buildPresets(presets) {
  var container = $('presets-container');
  container.innerHTML = '';
  Object.keys(presets).forEach(function(name) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.textContent = name;
    btn.addEventListener('click', function() {
      applyToCalc(presets[name]);
    });
    container.appendChild(btn);
  });
}

function updateInstallHint() {
  if (!installHint) return;
  var isiPhone = /iPhone/i.test(navigator.userAgent || '');
  var standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  installHint.classList.toggle('hidden', !isiPhone || standalone);
}

// ── Boot — fetch config.json then initialise ──────────────────────────────────

// Read config from the inline <script id="inline-config"> block in index.html.
// On a hosted build, fetch() keeps it in sync with config.json.
// Locally (file://) the inline block is used directly.

function loadConfig(callback) {
  fetch('config.json', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(callback)
    .catch(function() {
      // Fallback: read from inline block embedded in index.html
      var el = document.getElementById('inline-config');
      if (el) callback(JSON.parse(el.textContent));
    });
}

window.addEventListener('pageshow', updateInstallHint);
window.addEventListener('orientationchange', updateInstallHint);

loadConfig(function(config) {
  updateInstallHint();
  buildPresets(config.presets);
  applyToCalc(config.defaults);
});
