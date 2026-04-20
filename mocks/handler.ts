import { rest } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

const resolve = (req: Parameters<Parameters<typeof rest.post>[1]>[0]) => {
  const bodyString = req.body as string;
  const body = JSON.parse(bodyString);
  // algoliasearch v5: query lives directly on the request; v4 put it inside a URL-encoded `params` string
  const request = body.requests[0];
  const query: string | undefined =
    request.query ??
    (typeof request.params === "string"
      ? (new URLSearchParams(request.params).get("query") ?? undefined)
      : undefined);
  return query;
};

export const handlers = [
  rest.post("https://*.algolia.net/1/indexes/*/queries", (req, res, ctx) => {
    const query = resolve(req);
    if (query === "m") return res(ctx.status(200), ctx.json(queryWordsM));
    if (query === "ms") return res(ctx.status(200), ctx.json(queryWordsMs));
    if (query === "msw") return res(ctx.status(200), ctx.json(queryWordsMsw));
  }),
  rest.post("https://*.algolianet.com/1/indexes/*/queries", (req, res, ctx) => {
    const query = resolve(req);
    if (query === "m") return res(ctx.status(200), ctx.json(queryWordsM));
    if (query === "ms") return res(ctx.status(200), ctx.json(queryWordsMs));
    if (query === "msw") return res(ctx.status(200), ctx.json(queryWordsMsw));
  }),
];
