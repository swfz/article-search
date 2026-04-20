import { http, HttpResponse } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

// algoliasearch v5: query lives directly on the request; v4 put it inside a URL-encoded `params` string
const resolveQuery = async (request: Request): Promise<string | undefined> => {
  const body = (await request.json()) as {
    requests: { query?: string; params?: string }[];
  };
  const req = body.requests[0];
  return (
    req.query ??
    (typeof req.params === "string"
      ? (new URLSearchParams(req.params).get("query") ?? undefined)
      : undefined)
  );
};

const handler = async ({ request }: { request: Request }) => {
  const query = await resolveQuery(request);
  if (query === "m") return HttpResponse.json(queryWordsM);
  if (query === "ms") return HttpResponse.json(queryWordsMs);
  if (query === "msw") return HttpResponse.json(queryWordsMsw);
};

export const handlers = [
  http.post("https://*.algolia.net/1/indexes/*/queries", handler),
  http.post("https://*.algolianet.com/1/indexes/*/queries", handler),
];
