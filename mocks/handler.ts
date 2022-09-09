import { rest } from "msw";

import queryWordsM from "./json/search-response-m.json";
import queryWordsMs from "./json/search-response-ms.json";
import queryWordsMsw from "./json/search-response-msw.json";

export const handlers = [
  rest.post("https://*.algolia.net/1/indexes/*/queries", (req, res, ctx) => {

    const bodyString = req.body as string;

    const body = JSON.parse(bodyString);
    const params = [
      ...new URLSearchParams(body.requests[0].params).entries(),
    ].reduce((obj, e) => ({ ...obj, [e[0]]: e[1] }), {} as { query: string });


    if (params.query === 'm') {
      return res(ctx.status(200), ctx.json(queryWordsM))
    }
    if (params.query === 'ms') {
      return res(ctx.status(200), ctx.json(queryWordsMs))
    }
    if (params.query === 'msw') {
      return res(ctx.status(200), ctx.json(queryWordsMsw))
    }
  }),
];
