import { rest } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

export const handlers = [
  rest.post(/\/1\/indexes\/.*\/(queries|query)$/, (req, res, ctx) => {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const firstRequest = body.requests ? body.requests[0] : body;
    
    let query: string | undefined;
    if (typeof firstRequest.params === 'string') {
      const params = [
        ...new URLSearchParams(firstRequest.params).entries(),
      ].reduce((obj, e) => ({ ...obj, [e[0]]: e[1] }), {} as { query: string });
      query = params.query;
    } else if (typeof firstRequest.params === 'object' && firstRequest.params !== null && 'query' in firstRequest.params) {
      query = firstRequest.params.query;
    } else if (firstRequest.query !== undefined) {
      query = firstRequest.query;
    }

    if (query === "m") {
      return res(ctx.status(200), ctx.json(queryWordsM));
    }
    if (query === "ms") {
      return res(ctx.status(200), ctx.json(queryWordsMs));
    }
    if (query === "msw") {
      return res(ctx.status(200), ctx.json(queryWordsMsw));
    }
    
    return res(ctx.status(200), ctx.json({ results: [] }));
  }),
];
