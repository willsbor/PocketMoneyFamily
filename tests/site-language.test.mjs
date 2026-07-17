import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const script = fs.readFileSync(new URL("../assets/site.js", import.meta.url), "utf8");

function runSiteScript({ search = "", storedLanguage = null } = {}) {
  const listeners = new Map();
  const switchButtons = [
    {
      dataset: { langSwitch: "zh" },
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      addEventListener(event, handler) {
        this[`on${event}`] = handler;
      },
    },
    {
      dataset: { langSwitch: "en" },
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      addEventListener(event, handler) {
        this[`on${event}`] = handler;
      },
    },
  ];
  const storage = new Map();
  if (storedLanguage !== null) {
    storage.set("pocketmoneyfamily-language", storedLanguage);
  }
  const context = {
    URLSearchParams,
    window: {
      location: { search },
      localStorage: {
        getItem(key) {
          return storage.get(key) ?? null;
        },
        setItem(key, value) {
          storage.set(key, value);
        },
      },
    },
    document: {
      documentElement: {
        dataset: {},
        lang: "",
      },
      addEventListener(event, handler) {
        listeners.set(event, handler);
      },
      querySelectorAll(selector) {
        if (selector === "[data-lang-switch]") {
          return switchButtons;
        }
        return [];
      },
    },
  };

  vm.runInNewContext(script, context);
  listeners.get("DOMContentLoaded")();

  return {
    documentElement: context.document.documentElement,
    switchButtons,
    storedLanguage: storage.get("pocketmoneyfamily-language"),
  };
}

test("query string language takes priority over stored language", () => {
  const result = runSiteScript({ search: "?lang=en", storedLanguage: "zh" });

  assert.equal(result.documentElement.dataset.lang, "en");
  assert.equal(result.documentElement.lang, "en");
  assert.equal(result.storedLanguage, "en");
  assert.equal(result.switchButtons[1].attributes["aria-pressed"], "true");
});

test("stored language is used when query string is absent", () => {
  const result = runSiteScript({ storedLanguage: "en" });

  assert.equal(result.documentElement.dataset.lang, "en");
  assert.equal(result.documentElement.lang, "en");
});

test("unsupported query string falls back to stored language", () => {
  const result = runSiteScript({ search: "?lang=ja", storedLanguage: "en" });

  assert.equal(result.documentElement.dataset.lang, "en");
  assert.equal(result.documentElement.lang, "en");
});
