(function () {
  const storageKey = "pocketmoneyfamily-language";
  const supported = new Set(["zh", "en"]);

  function getPreferredLanguage() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (supported.has(saved)) return saved;
    } catch (_) {
      // Ignore storage access issues.
    }
    return "zh";
  }

  function updateButtons(lang) {
    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.langSwitch === lang));
    });
  }

  function applyLanguage(lang) {
    const nextLang = supported.has(lang) ? lang : "zh";
    document.documentElement.dataset.lang = nextLang;
    document.documentElement.lang = nextLang === "en" ? "en" : "zh-Hant";
    updateButtons(nextLang);
    try {
      window.localStorage.setItem(storageKey, nextLang);
    } catch (_) {
      // Ignore storage access issues.
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const initialLang = getPreferredLanguage();
    applyLanguage(initialLang);

    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.langSwitch));
    });
  });
})();
