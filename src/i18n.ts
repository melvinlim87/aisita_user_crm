import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Example translation files
import en from "./locales/en.json";
import ch from "./locales/ch.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ch: { translation: ch },
    },
    lng: localStorage.getItem("lang") || "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
