/* ==========================================================================
   core.js — نظام اللغتين (عربي / English) + حفظ البيانات
   ========================================================================== */

/* ------------------------------ Store ------------------------------ */
const Store = (function(){
  const NS = 'tc:';
  let mem = {};                      // احتياطي لو localStorage محجوب
  let ls = null;
  try{
    const k = '__t';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    ls = localStorage;
  } catch(e){ ls = null; }

  function read(key){
    try{
      const raw = ls ? ls.getItem(NS + key) : mem[key];
      if (raw == null) return undefined;
      return JSON.parse(raw);
    } catch(e){ return undefined; }
  }

  function write(key, val){
    const raw = JSON.stringify(val);
    try{
      if (ls) ls.setItem(NS + key, raw);
      else mem[key] = raw;
    } catch(e){
      mem[key] = raw;                 // quota exceeded → نكمل في الذاكرة
    }
  }

  function del(key){
    try{ if (ls) ls.removeItem(NS + key); }catch(e){}
    delete mem[key];
  }

  return {
    get: read,
    set: write,
    del,
    /** حفظ مؤجل — للمكتبيات/الفلاتر اللي بتتغيّر كتير */
    debounce(key, val, ms = 400){
      clearTimeout(this._t?.[key]);
      this._t = this._t || {};
      this._t[key] = setTimeout(() => write(key, val), ms);
    }
  };
})();

/* ============================ Translation =========================== */
const DICT = {
  ar: {
    /* ---------- مشترك ---------- */
    'lang.name'            : 'العربية',
    'lang.switch'          : 'English',
    'brand'                : 'TC Garments',
    'copy.rights'          : 'جميع الحقوق محفوظة',
    'support.whatsapp'     : 'الدعم الفني (واتساب)',
    'dev.name'             : 'Ahmed Elkady — Kadysoft Ltd.',

    /* ---------- صفحة الدخول ---------- */
    'login.title'          : 'تسجيل الدخول',
    'login.sub'            : 'أدخل بياناتك للمتابعة إلى لوحة الريسيبيز',
    'login.name'           : 'الاسم الكامل',
    'login.name.ph'        : 'مثال: أحمد محمد',
    'login.code'           : 'الكود الخاص',
    'login.code.ph'        : 'أدخل الكود',
    'login.remember'       : 'تذكّرني على هذا الجهاز',
    'login.submit'         : 'دخول',
    'login.checking'       : 'جارٍ التحقق...',
    'login.capslock'       : 'Caps Lock شغّال',
    'login.show'           : 'إظهار الكود',
    'login.hide'           : 'إخفاء الكود',

    'login.err.nameShort'  : 'الاسم قصير جداً',
    'login.err.nameReq'    : 'اكتب اسمك الأول',
    'login.err.codeReq'    : 'أدخل الكود الخاص',
    'login.err.connecting' : 'جارٍ الاتصال بالسيرفر...',
    'login.err.restore'    : 'جارٍ التحقق من جلستك السابقة...',
    'login.err.timeout'    : 'انتهت المهلة — تحقق من الإنترنت',
    'login.err.net'        : 'فشل الاتصال بالسيرفر',
    'login.err.badJson'    : 'رد غير صالح من السيرفر',
    'login.err.unknown'    : 'حدث خطأ غير متوقع',
    'login.err.status'     : 'تعذر تحديد الحالة — حاول تاني',
    'login.err.tryManual'  : 'اضغط دخول وتعبّي البيانات يدوي.',
    'login.err.rate'       : 'محاولات كثيرة — استنى شوية وجرّب تاني.',
    'login.err.fields'     : 'البيانات ناقصة — املأ الاسم والكود.',
    'login.err.action'     : 'خطأ في الاتصال بالسيرفر — جرّب كود النشر من جديد.',
    'login.err.server'     : 'خطأ في السيرفر — حاول تاني بعد قليل.',
    'diag.ok'             : 'الاتصال بالسيرفر شغال',
    'diag.fail'           : '⚠️ مش قادرين نوصل للسيرفر. شوف الرابط تحت — غالباً محتاج إعادة Deploy في Apps Script.',
    'login.trying'         : 'جارٍ الاتصال بالسيرفر… ({n} ثانية)',
    'login.ok.approved'    : 'تمت الموافقة — جارٍ التحويل...',
    'login.err.rejected'   : 'تم رفض الطلب من الإدارة',
    'login.wait.pending'   : 'طلبك قيد المراجعة — في انتظار موافقة RECETA',
    'login.wait.polling'   : '⏳ في انتظار موافقة RECETA — الصفحة هتفتح لوحدها (تبقى {n} ثانية)',
    'login.http'           : 'خطأ في السيرفر',

    /* ---------- اللوحة ---------- */
    'app.recipes'          : 'الريسيبيز',
    'app.send'             : 'إرسال تعديل',
    'app.db'               : 'عارض البيانات',
    'app.refresh'          : 'تحديث',
    'app.logout'           : 'تسجيل الخروج',
    'app.brand.sub'        : 'TC Garments',
    'app.search.ph'        : 'دوّر على ريسبي…',
    'app.back'             : 'رجوع',
    'app.retry'            : 'إعادة المحاولة',
    'app.copied'           : 'تم النسخ',

    'list.netErr'          : 'مفيش اتصال بالإنترنت.',
    'list.rateLimit'       : 'تم تجاوز الحد المسموح لطلبات GitHub. استنى شوية وحاول تاني.',
    'list.noFolder'        : 'المجلد ده مش موجود.',
    'list.serverErr'       : 'خطأ من السيرفر ({code}).',
    'list.badResp'         : 'رد غير متوقع.',
    'list.empty'           : 'المجلد فاضي.',
    'list.noResults'       : 'مفيش نتائج للبحث ده.',

    /* ---------- الإرسال ---------- */
    'send.title'           : 'إرسال ريسبي جديد',
    'send.name'            : 'الاسم',
    'send.name.ph'         : 'اسمك بالكامل',
    'send.file'            : 'الصورة / الملف',
    'send.btn'             : 'أرسل الريسيبي',
    'send.uploading'       : 'جارٍ الرفع...',
    'send.registering'     : 'جارٍ تسجيل الطلب...',
    'send.done'            : 'تم الإرسال بنجاح!',
    'send.err.fields'      : 'املأ كل الحقول',
    'send.err.size'        : 'الحجم أكبر من 8 ميجا',
    'send.err.failed'      : 'فشل الإرسال',
    'send.err.network'     : 'خطأ في الإرسال',

    /* ---------- عارض البيانات ---------- */
    'db.title'             : 'عارض البيانات',
    'db.table'             : 'الجدول',
    'db.pick'              : 'اختر جدول…',
    'db.loading'           : 'جارٍ تحميل قاعدة البيانات...',
    'db.err'               : 'مش قادرين نحمل قاعدة البيانات ({err})',
    'db.noTables'          : 'مفيش جداول في القاعدة.',
    'db.hidden'            : 'هذا الجدول مخفي لأسباب أمنية.',
    'db.errTable'          : 'خطأ في قراءة الجدول.',
    'db.empty'             : 'الجدول فاضي.',
    'db.noMatch'           : 'لا توجد بيانات مطابقة للفلتر',
    'db.filter.ph'         : 'فلتر…',

    /* ---------- الحماية ---------- */
    'gate.title'           : 'تحتاج تسجيل دخول',
    'gate.default'         : 'الصفحة دي محمية. من فضلك سجّل دخول الأول.',
    'gate.goto'            : 'روح لصفحة الدخول',
    'gate.noSession'       : 'مفيش جلسة محفوظة على الجهاز ده.',
    'gate.insecure'        : 'مش مسموح فتح الصفحة كده. افتحها من الموقع الرسمي.',
    'gate.noAccount'       : 'الحساب ده مش موجود في النظام.',
    'gate.pending'         : 'حسابك لسه في انتظار موافقة RECETA.',
    'gate.offline'         : 'مش قادرين نتأكد من جلستك دلوقتي. تأكد من الإنترنت وحاول تاني.',

    /* ---------- كود التفعيل ---------- */
    'key.chip.none'        : 'بدون كود',
    'key.chip.set'         : 'الكود محفوظ',
    'key.chip.tip'         : 'كود التفعيل محفوظ لهذه الجلسة — اضغط لتغييره أو مسحه',
    'key.chip.tipNone'     : 'مفيش كود تفعيل — اضغط لإدخاله',
    'key.enter.title'      : 'إدخال كود التفعيل',
    'key.change.title'     : 'تغيير كود التفعيل',
    'key.enter.msg'        : 'الكود بيُطلب مرة واحدة لكل جلسة، وبيفتّح الريسيبيز المشفّرة.<br>لو مش معاك الكود تواصل على واتساب.',
    'key.change.msg'       : 'اكتب الكود الجديد. الكود الحالي هيمسح فوراً.',
    'key.label'            : 'كود التفعيل',
    'key.ph'               : 'XXXXXXX-XXXXXXX-…',
    'key.fmt'              : 'الشكل: <b>7 أجزاء</b> مفصولة بـ <b>-</b>',
    'key.save'             : 'حفظ وبدء',
    'key.update'           : 'تغيير',
    'key.later'            : 'لاحقاً',
    'key.cancel'           : 'إلغاء',
    'key.err.empty'        : 'اكتب الكود الأول',
    'key.err.shape'        : 'الشكل غلط — لازم يكون 7 أجزاء مفصولة بـ -',
    'key.tooMany'          : 'محاولات كتير',
    'key.locked'           : 'تم قفل الإدخال مؤقتاً بعد محاولات فاشلة.<br>استنى <b>{n}</b> ثانية وجرّب تاني.',
    'key.savedToast'       : 'الكود محفوظ لهذه الجلسة',
    'key.needKey'          : 'لازم كود التفعيل عشان تفتح الريسيبيز',
    'key.updated'          : 'تم تحديث الكود',
    'key.cleared'          : 'تم مسح الكود',
    'key.title'            : 'كود التفعيل',
    'key.savedMsg'         : 'الكود محفوظ للجلسة دي بس (بيمسح لو قفلت التاب).<br><span style="font-family:monospace;font-size:.95em;color:var(--primary)">{masked}</span>',
    'key.menu.change'      : 'تغيير الكود',
    'key.menu.clear'       : 'مسح الكود',
    'key.wrong.title'      : 'كود التفعيل غير صحيح',
    'key.wrong.msg'        : 'الكود اللي اتكتبت مش بيفتح الملف ده.<br>تم مسحه من الجهاز — لازم تدخله تاني.<br><br>{lock}<b>قفل مؤقت {n} ثانية</b> بعد {t} محاولات فاشلة.<br><b>لو مش معاك الكود الصح، تواصل على واتساب.</b>',
    'key.err.title'        : 'تعذر عرض الريسيبي',
    'key.err.msg'          : 'حصل خطأ أثناء التحميل. تأكد من الإنترنت وجرب تاني.',

    /* ---------- عام ---------- */
    'common.ok'            : 'تماماً',
    'common.confirm'       : 'تأكيد',
    'common.logout.title'  : 'تسجيل الخروج؟',
    'common.logout.msg'    : 'هيتم مسح بيانات الدخول وكود التفعيل من الجهاز ده.<br>لازم تسجّل دخول تاني.',
    'common.logout.btn'    : 'خروج',
    'key.clear.title'      : 'مسح كود التفعيل؟',
    'key.clear.msg'        : 'الكود هيمسح من الجهاز ده، وهيتطلب منك تدخله تاني المرة الجاية.<br><b>متنساش الكود.</b>',
    'key.clear.btn'        : 'مسح'
  },

  en: {
    /* ---------- shared ---------- */
    'lang.name'            : 'English',
    'lang.switch'          : 'العربية',
    'brand'                : 'TC Garments',
    'copy.rights'          : 'All rights reserved',
    'support.whatsapp'     : 'Support (WhatsApp)',
    'dev.name'             : 'Ahmed Elkady — Kadysoft Ltd.',

    /* ---------- login ---------- */
    'login.title'          : 'Sign in',
    'login.sub'            : 'Enter your details to reach the recipes board',
    'login.name'           : 'Full name',
    'login.name.ph'        : 'e.g. Ahmed Mohamed',
    'login.code'           : 'Your access code',
    'login.code.ph'        : 'Enter your code',
    'login.remember'       : 'Remember me on this device',
    'login.submit'         : 'Sign in',
    'login.checking'       : 'Checking…',
    'login.capslock'       : 'Caps Lock is on',
    'login.show'           : 'Show code',
    'login.hide'           : 'Hide code',

    'login.err.nameShort'  : 'Name is too short',
    'login.err.nameReq'    : 'Please enter your name',
    'login.err.codeReq'    : 'Please enter your code',
    'login.err.connecting' : 'Connecting to server…',
    'login.err.restore'    : 'Checking your previous session…',
    'login.err.timeout'    : 'Request timed out — check your connection',
    'login.err.net'        : 'Could not reach the server',
    'login.err.badJson'    : 'Invalid response from server',
    'login.err.unknown'    : 'Something went wrong',
    'login.err.status'     : 'Could not read status — try again',
    'login.err.tryManual'  : 'Press sign in and fill in the details manually.',
    'login.err.rate'       : 'Too many attempts — wait a moment and try again.',
    'login.err.fields'     : 'Missing details — fill in both name and code.',
    'login.err.action'     : 'Server connection error — check the deployment URL.',
    'login.err.server'     : 'Server error — please try again shortly.',
    'diag.ok'             : 'Connected to server',
    'diag.fail'           : '⚠️ Cannot reach the server. Check the URL below — it probably needs a fresh Deploy in Apps Script.',
    'login.trying'         : 'Connecting to server… ({n}s)',
    'login.ok.approved'    : 'Approved! Redirecting…',
    'login.err.rejected'   : 'Your request was rejected',
    'login.wait.pending'   : 'Your request is under review — waiting for RECETA',
    'login.wait.polling'   : '⏳ Waiting for RECETA approval — this page will open automatically ({n}s left)',
    'login.http'           : 'Server error',

    /* ---------- board ---------- */
    'app.recipes'          : 'Recipes',
    'app.send'             : 'Send update',
    'app.db'               : 'Data viewer',
    'app.refresh'          : 'Refresh',
    'app.logout'           : 'Sign out',
    'app.brand.sub'        : 'TC Garments',
    'app.search.ph'        : 'Search recipes…',
    'app.back'             : 'Back',
    'app.retry'            : 'Try again',
    'app.copied'           : 'Copied',

    'list.netErr'          : 'No internet connection.',
    'list.rateLimit'       : 'GitHub API limit reached. Wait a bit and try again.',
    'list.noFolder'        : 'This folder does not exist.',
    'list.serverErr'       : 'Server error ({code}).',
    'list.badResp'         : 'Unexpected response.',
    'list.empty'           : 'This folder is empty.',
    'list.noResults'       : 'No results for this search.',

    /* ---------- send ---------- */
    'send.title'           : 'Send a new recipe',
    'send.name'            : 'Name',
    'send.name.ph'         : 'Your full name',
    'send.file'            : 'Image / file',
    'send.btn'             : 'Send recipe',
    'send.uploading'       : 'Uploading…',
    'send.registering'     : 'Registering request…',
    'send.done'            : 'Sent successfully!',
    'send.err.fields'      : 'Please fill all fields',
    'send.err.size'        : 'File is larger than 8 MB',
    'send.err.failed'      : 'Send failed',
    'send.err.network'     : 'Send error',

    /* ---------- db ---------- */
    'db.title'             : 'Data viewer',
    'db.table'             : 'Table',
    'db.pick'              : 'Choose a table…',
    'db.loading'           : 'Loading database…',
    'db.err'               : 'Could not load the database ({err})',
    'db.noTables'          : 'No tables found.',
    'db.hidden'            : 'This table is hidden for security reasons.',
    'db.errTable'          : 'Could not read the table.',
    'db.empty'             : 'The table is empty.',
    'db.noMatch'           : 'No rows match the filters',
    'db.filter.ph'         : 'Filter…',

    /* ---------- gate ---------- */
    'gate.title'           : 'Sign in required',
    'gate.default'         : 'This page is protected. Please sign in first.',
    'gate.goto'            : 'Go to sign in',
    'gate.noSession'       : 'No saved session on this device.',
    'gate.insecure'        : 'Cannot open this page directly. Use the official site.',
    'gate.noAccount'       : 'This account does not exist.',
    'gate.pending'         : 'Your account is still awaiting RECETA approval.',
    'gate.offline'         : 'We could not verify your session. Check your connection.',

    /* ---------- activation key ---------- */
    'key.chip.none'        : 'No key',
    'key.chip.set'         : 'Key saved',
    'key.chip.tip'         : 'Activation key saved for this session — click to change or clear it',
    'key.chip.tipNone'     : 'No activation key — click to enter it',
    'key.enter.title'      : 'Enter activation key',
    'key.change.title'     : 'Change activation key',
    'key.enter.msg'        : 'You are asked once per session to unlock the encrypted recipes.<br>If you do not have the key, contact us on WhatsApp.',
    'key.change.msg'       : 'Enter the new key. The current one is cleared immediately.',
    'key.label'            : 'Activation key',
    'key.ph'               : 'XXXXXXX-XXXXXXX-…',
    'key.fmt'              : 'Format: <b>7 groups</b> separated by <b>-</b>',
    'key.save'             : 'Save & start',
    'key.update'           : 'Change',
    'key.later'            : 'Later',
    'key.cancel'           : 'Cancel',
    'key.err.empty'        : 'Enter the key first',
    'key.err.shape'        : 'Wrong format — must be 7 groups separated by -',
    'key.tooMany'          : 'Too many attempts',
    'key.locked'           : 'Input is temporarily locked after failed attempts.<br>Wait <b>{n}</b> seconds and try again.',
    'key.savedToast'       : 'Key saved for this session',
    'key.needKey'          : 'An activation key is required to open recipes',
    'key.updated'          : 'Key updated',
    'key.cleared'          : 'Key cleared',
    'key.title'            : 'Activation key',
    'key.savedMsg'         : 'The key is stored for this session only (cleared when you close the tab).<br><span style="font-family:monospace;font-size:.95em;color:var(--primary)">{masked}</span>',
    'key.menu.change'      : 'Change key',
    'key.menu.clear'       : 'Clear key',
    'key.wrong.title'      : 'Invalid activation key',
    'key.wrong.msg'        : 'That key did not unlock this file.<br>It has been cleared from this device — you must enter it again.<br><br>{lock}<b>Locked for {n}s</b> after {t} failed attempts.<br><b>If you do not have the correct key, contact us on WhatsApp.</b>',
    'key.err.title'        : 'Could not display recipe',
    'key.err.msg'          : 'An error occurred while loading. Check your connection and try again.',

    /* ---------- common ---------- */
    'common.ok'            : 'OK',
    'common.confirm'       : 'Confirm',
    'common.logout.title'  : 'Sign out?',
    'common.logout.msg'    : 'Your sign-in data and activation key will be cleared from this device.<br>You will need to sign in again.',
    'common.logout.btn'    : 'Sign out',
    'key.clear.title'      : 'Clear activation key?',
    'key.clear.msg'        : 'The key will be removed from this device and you will be asked again next time.<br><b>Make sure you remember it.</b>',
    'key.clear.btn'        : 'Clear'
  }
};

/* ------------------------------ I18n ------------------------------- */
const I18n = (function(){
  const DEF = 'ar';
  let lang = DEF;

  function detect(){
    const saved = Store.get('lang');
    if (saved === 'ar' || saved === 'en') return saved;
    for (const l of (navigator.languages || [navigator.language || ''])){
      if (!l) continue;
      if (/^en/i.test(l)) return 'en';
      if (/^ar/i.test(l)) return 'ar';
    }
    return DEF;
  }

  /** t('key') أو t('key', {a:1}) */
  function t(key, vars){
    let s = (DICT[lang] && DICT[lang][key]) ?? (DICT[DEF][key]) ?? key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  function dir(){ return lang === 'ar' ? 'rtl' : 'ltr'; }

  /** تحديث كل العناصر اللي عليها data-i18n */
  function apply(root = document){
    root.querySelectorAll('[data-i18n]').forEach(n => {
      n.innerHTML = t(n.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-text]').forEach(n => {
      n.textContent = t(n.dataset.i18nText);
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(n => {
      n.placeholder = t(n.dataset.i18nPh);
    });
    root.querySelectorAll('[data-i18n-title]').forEach(n => {
      n.title = t(n.dataset.i18nTitle);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(n => {
      n.setAttribute('aria-label', t(n.dataset.i18nAria));
    });
  }

  function set(l, persist = true){
    lang = (l === 'en') ? 'en' : 'ar';
    if (persist) Store.set('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir  = dir();
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  return {
    t, dir, apply, set,
    get lang(){ return lang; },
    init(){ set(detect(), false); return lang; }
  };
})();

/* --------------------------- Prefs helper --------------------------- */
const Prefs = {
  get(k, def){ const v = Store.get('p:' + k); return v === undefined ? def : v; },
  set(k, v){ Store.set('p:' + k, v); },
  del(k){ Store.del('p:' + k); }
};

/* --------------------- Language switcher widget --------------------- */
function mountLangSwitch(sel, onChange){
  const btn = document.querySelector(sel);
  if (!btn) return;
  const paint = () => {
    const next = I18n.lang === 'ar' ? 'en' : 'ar';
    btn.innerHTML = `<i class="fas fa-globe"></i><span>${I18n.t('lang.switch')}</span>`;
    btn.title = next === 'en' ? 'Switch to English' : 'التبديل للإنجليزية';
    btn.dataset.next = next;
  };
  btn.addEventListener('click', () => {
    I18n.set(btn.dataset.next, true);
    paint();
    if (onChange) onChange(I18n.lang);
  });
  document.addEventListener('langchange', paint);
  paint();
  return paint;
}

window.Store = Store;
window.I18n = I18n;
window.Prefs = Prefs;
window.mountLangSwitch = mountLangSwitch;