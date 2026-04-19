import { http, HttpResponse } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

export const handlers = [
  http.post(
    "https://*.algolia.net/1/indexes/*/queries",
    async ({ request }) => {
      const body = (await request.json()) as {
        requests: { params: string }[];
      };
      const params = [
        ...new URLSearchParams(body.requests[0].params).entries(),
      ].reduce((obj, e) => ({ ...obj, [e[0]]: e[1] }), {} as { query: string });

      if (params.query === "m") {
        return HttpResponse.json(queryWordsM);
      }
      if (params.query === "ms") {
        return HttpResponse.json(queryWordsMs);
      }
      if (params.query === "msw") {
        return HttpResponse.json(queryWordsMsw);
      }
    },
  ),
];
