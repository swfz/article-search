import nextConfig from "eslint-config-next/core-web-vitals";

const config = [{ ignores: ["public/mockServiceWorker.js"] }, ...nextConfig];

export default config;
