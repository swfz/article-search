import { HttpResponse, http } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

export const handlers = [
  http.post(
    "https://*.algolia.net/1/indexes/*/queries",
    async ({ request, params }) => {
      const body = await request.json();

      const isRecords = (
        obj: any,
      ): obj is { requests: { indexName: string; params: string }[] } => {
        return (
          Array.isArray(obj.requests) &&
          obj.requests.every((r: any) => r.indexName && r.params)
        );
      };

      if (!isRecords(body)) {
        return new HttpResponse(JSON.stringify({}));
      }
      const entries = [
        ...new URLSearchParams(body.requests[0].params).entries(),
      ];

      const queryParams = entries.reduce(
        (obj, e) => ({ ...obj, [e[0]]: e[1] }),
        {} as { query: string },
      );

      if (queryParams.query === "m") {
        return new HttpResponse(JSON.stringify(queryWordsM));
      }
      if (queryParams.query === "ms") {
        return new HttpResponse(JSON.stringify(queryWordsMs));
      }
      if (queryParams.query === "msw") {
        return new HttpResponse(JSON.stringify(queryWordsMsw));
      }
    },
  ),
];
