// ============================================================
// i18n.js — 多语言支持
// 扩展新语言：在 i18n/ 目录下新增 xx.json，然后在 LANGS 中注册
// ============================================================

const I18n = (() => {
  const LANGS = {
    zh: { url: './i18n/zh.json', label: '中' },
    en: { url: './i18n/en.json', label: 'EN' },
    kr: { url: './i18n/kr.json', label: '한' },
  };

  // 语言顺序列表，切换时按此顺序轮换
  const LANG_KEYS = Object.keys(LANGS);

  let _strings = {};
  let _lang = CONFIG.defaultLang;

  async function load(lang) {
    if (!LANGS[lang]) lang = CONFIG.defaultLang;
    _lang = lang;
    const res = await fetch(LANGS[lang].url);
    _strings = await res.json();
    localStorage.setItem(CONFIG.storage.lang, lang);
    _applyToDOM();
  }

  // 获取翻译字符串，支持点路径如 "form.submit"
  function t(key) {
    const parts = key.split('.');
    let val = _strings;
    for (const p of parts) val = val?.[p];
    return val ?? key;
  }

  // 自动将带 data-i18n 属性的元素替换文案
  function _applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, t(key));
      else el.textContent = t(key);
    });
  }

  // 返回下一个语言 key（顺序轮换）
  function nextLang() {
    const idx = LANG_KEYS.indexOf(_lang);
    return LANG_KEYS[(idx + 1) % LANG_KEYS.length];
  }

  // 返回指定语言的按钮显示文字（默认显示下一个语言，提示用户点了会切换到哪里）
  function labelOf(lang) {
    return LANGS[lang]?.label ?? lang.toUpperCase();
  }

  function currentLang() { return _lang; }

  return { load, t, currentLang, nextLang, labelOf };
})();