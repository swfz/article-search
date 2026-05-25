import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: ["public/mockServiceWorker.js"] },
  ...nextConfig.map((entry) => {
    let patched = entry;

    // eslint-plugin-react's "detect" mode calls context.getFilename() which was
    // removed in ESLint 10.  Pin the React version explicitly instead.
    if (patched.settings?.react?.version) {
      patched = {
        ...patched,
        settings: {
          ...patched.settings,
          react: { ...patched.settings.react, version: "19" },
        },
      };
    }

    // eslint-config-next's bundled Babel parser (used for the main "next" entry)
    // returns a scope-manager that lacks the addGlobals() method required by
    // ESLint 10.  Narrow the file pattern so that plain JS/MJS files fall back
    // to ESLint's built-in espree parser instead.
    if (patched.name === "next" && patched.languageOptions?.parser) {
      patched = {
        ...patched,
        files: ["**/*.{jsx,ts,tsx,mts,cts}"],
      };
    }

    return patched;
  }),
];

export default config;
