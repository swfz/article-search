import "../styles/globals.css";
import type { AppProps } from "next/app";
import { logger } from "../lib/logger";

if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  logger.info("msw enabled");
  require("../mocks");
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
