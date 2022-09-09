import "../styles/globals.css";
import type { AppProps } from "next/app";

if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  console.log('enable');

  require('../mocks')
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
