/** @type {import('@lingui/conf').LinguiConfig} */
export default {
  locales: ["pt", "en"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}/messages",
      include: ["source"],
    },
  ],
  format: "po",
};
