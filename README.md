# RECETA — TC Garments

بوابة تسجيل دخول + لوحة عرض الريسيبيز.
الواجهات بتتكلم مع Google Apps Script مباشرة (بدون أي Proxy).

---

## الملفات

| الملف | الوظيفة |
|---|---|
| `index.html` | صفحة الدخول (اسم + كود) |
| `index2.html` | لوحة الريسيبيز، الإرسال، عارض البيانات |
| `core.js` | نظام اللغتين (عربي/English) + حفظ البيانات |
| `Code.gs` | كود Google Apps Script (يتم نسخه في `script.google.com`) |
| `sw.js` | Service Worker (يعمل أوفلاين + يخزّن الأصول) |
| `manifest.json` | إعدادات تثبيت التطبيق على الموبايل |
| `offline.html` | صفحة "مفيش اتصال" |

---

## اللغتين: عربي + English

الملف `core.js` فيه قاموس **119 مفتاح** لكل لغة (`ar` و `en`) — متطابق 100% في العدد.

- زر اللغة 🌐 في `index.html` (فوق يمين) وفي هيدر `index2.html` + نسخة في بوابة الحماية.
- **أول مرة** بيختار حسب لغة المتصفح (`ar` أو `en`)، بعد كده بيفتكر اختيارك.
- بيقلب اتجاه الصفحة كامل: `dir="rtl"` ↔ `dir="ltr"` و `lang` كمان.

### إضافة نص جديد

1. افتح `core.js` واقسم `DICT.ar` و `DICT.en`.
2. ضيف نفس المفتاح في الاتنين.
3. في الـ HTML استخدم: `data-i18n` (نص)، `data-i18n-ph` (placeholder)، `data-i18n-title`، `data-i18n-aria`.
4. في الـ JS استخدم: `I18n.t('my.key')` أو `I18n.t('my.key', { n: 5 })`.

> لو ضفت مفتاح في لغة ونسيت التانية، الـ `I18n.t` بيرجع للترجمة العربية أو للمفتاح نفسه — من غير ما يكسر.

---

## حفظ البيانات (كل حاجة بتتفتكر)

| بيتحفظ | اين |
|---|---|
| اللغة المختارة | `tc:lang` |
| اسم الدخول + الكود | `localStorage` (بس لو فعّلت **تذكّرني**) |
| آخر مجلدRecipe فتحته | `tc:p:lastPath` |
| نص البحث | `tc:search` |
| التبويب النشط | `tc:p:tab` (+ hash في URL) |
| **تفضيلات المشاهد**: الزوم / Fit / الدوران / اتجاه النص | `tc:p:pvZoom` `pvMode` `pvRot` `pvDir` |
| اسم في فورم الإرسال | `tc:p:sendName` |
| آخر جدول قاعدة بيانات + فلاتر الأعمدة | `tc:p:dbTable` + `tc:p:dbFilters:<table>` |

**"تذكّرني"** — لو شيل التحديد، الاسم بيتحفظ بس **والكود لأ** (بيطلب منك كل مرة). أأمن.

الكتابة بتتم عبر `Store` اللي بيرجع تلقائياً للذاكرة لو `localStorage` محجوب (وضع التصفح الخاص).

---

## سبب المشكلة القديمة (عملية غير معروفة)

كان الكود بيبني الرابط كده:

```js
const API_URL = "https://corsproxy.io/?" + encodeURIComponent("https://script.google.com/.../exec");
fetch(`${API_URL}?action=register&name=...`)     // ❌ الـ parameters بره
```

يعني الرابط النهائي:

```
https://corsproxy.io/?https%3A%2F%2Fscript.google.com%2F...%2Fexec?action=register&name=Ahmed&code=123
```

الـ proxy بياخد الكويري بتاعه هو وبيعامل `?action=` كأنه براميتر بتاع الكود
المشفّر نفسه، فالمتغيّر `action` اللي يوصل للسيرفر بيبقى غلط أو فاضي →
السكربت يرد **"❌ عملية غير معروفة."**

وخدمة `corsproxy.io` كمان بقت مش متاحة دلوقتي (ترجّع `401/403`).

**الحل:** Google Apps Script بيرجّع الهيدر ده تلقائياً:

```
Access-Control-Allow-Origin: *
```

فالصفحة تقدر تنادي الرابط **مباشرة** بدون أي Proxy:

```js
const API_BASE = "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec";
fetch(`${API_BASE}?action=register&name=...&code=...`);   // ✅
```

> ملاحظة: كل الـ proxies المجانية (corsproxy / allorigins / codetabs) بقت
> موثوقية ضعيفة جداً، فالأفضل عدم الاعتماد عليها أبداً.

---

## خطوات التشغيل

### 1. Google Apps Script

1. افتح <https://script.google.com> وأنشئ مشروع جديد.
2. انسخ كل محتوى **`Code.gs`** والصقه في المحرر.
3. عمر `Deploy ► New deployment` واختار **Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. انسخ الرابط الناتج (`.../exec`) وحطه في:
   - `index.html` → المتغيّر `API_BASE` (السطر 380 تقريباً)
   - `index2.html` → المتغيّر `API_BASE`
5. **مهم:** كل مرة تعدّل فيها `Code.gs` لازم تعمل
   `Deploy ► Manage deployments ► Edit ► New version`، وإلا التعديلات مش هتظهر.

### 2. الـ Google Sheet

- لازم يكون فيه شيت اسمها **`Users`** بعمود على الأقل:
  `الاسم | الكود | الحالة | التاريخ`
- الحالة بتاخد أحد 3 قيم: **`نعم`** / **`لا`** / **`لسه`**
- أول مرة تشتغل، السكربت بينشئ الشيت والهيدرز لوحده.

### 3. النشر على GitHub Pages

1. ارفع كل الملفات على الريبو.
2. في الريبو: `Settings ► Pages ► Source: Deploy from a branch`
3. اختار الفرع `main` والمسار `/ (root)`.
4. الموقع هيفتح على:
   `https://<username>.github.io/<repo>/`

---

## الأوامر اللي اتعملت في التحديث ده

**إصلاح الأخطاء**
- ✅ إصلاح الرابط والسيرفر بيرجع "عملية غير معروفة"
- ✅ إضافة `<meta name="viewport">` (كان ناقص → الموقع كان بايظ على الموبايل)
- ✅ إصلاح مسارات `sw.js` و `manifest.json` و الصور (كلها كانت `/...` مطلقة، وهي مابتشتغلش على GitHub Pages لريبو فرعي)
- ✅ إزالة `console.log` اللي كان بيطبع **الكود السري** في الـ console
- ✅ إضافة بوابة حماية على `index2.html` (كانت تقدر تفتحها مباشرة بدون تسجيل دخول)
- ✅ إصلاح `intent://` — كان بيفتح لينكات فاضية على iOS/PC، دلوقتي بيشتغل على Chrome أندرويد بس ويفتح `window.open` على أي حاجة تانية
- ✅ إصلاح مشكلة "لو الاسم موجود بكود مختلف" (كان بيكرّر صفوف في الشيت)

**التصميم**
- ✅ تصميم جديد بالكامل (Glassmorphism + Gradient animé + Dark/Light)
- ✅ Animation الخلفية بقى Canvas واحد بدل مئات عناصر الـ DOM
- ✅ Loading skeletons + حالات فارغة + حالات خطأ بشكل واضح
- ✅ زر إظهار/إخفاء الكود + تحذير Caps Lock
- ✅ Toast notifications بدل `alert`
- ✅ Search box للبحث في الريسيبيز
- ✅ Shake on error + `prefers-reduced-motion`

**الكود**
- ✅ `Code.gs` اتعاد كتابته بالكامل: `doGet` + `doPost` + `doOptions`
- ✅ Rate limiting + `ScriptLock` منع تكرار الطلبات المتزامنة
- ✅ تطبيع النص العربي (أ/إ/آ → ا، ة → ه، إزالة التشكيل)
- ✅ منع حقن المعادلات في الشيت (`=`, `+`, `-`, `@`)
- ✅ `action: "ping"` للتأكد إن الاتصال شغال
- ✅ رسائل خطأ بأكواد واضحة بدل "خطأ عام"

---

## تشخيص سريع

لو حصل أي مشكلة، افتح ده في المتصفح:

```
https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?action=ping
```

المتوقع:

```json
{"success":true,"message":"✅ الاتصال شغال","server":"TC-AUTH"}
```

| الرد | المعنى |
|---|---|
| `يرجّع JSON` | ✅ كله تمام |
| صفحة Google تطلب صلاحيات | ⚠️ المشروع محتاج Authorization من Accounts |
| `403` | ⚠️ Who has access مش `Anyone` |
| مايفتحش | ⚠️ نسيت تعمل Deploy |

---

## لينكات مفيدة

- الموقع: `https://<username>.github.io/<repo>/`
- الدعم: `https://wa.me/201555266002`
