import { describe, expect, it } from "vitest";

import { resolveQuery } from "../mocks/handler";

const createRequest = (request: { query?: string; params?: unknown }) =>
  new Request("https://example.test/1/indexes/test/queries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [request] }),
  });

describe("resolveQuery", () => {
  it("v5形式のqueryを返す", async () => {
    await expect(resolveQuery(createRequest({ query: "m" }))).resolves.toBe(
      "m",
    );
  });

  it("v4形式のparamsからqueryを返す", async () => {
    await expect(
      resolveQuery(createRequest({ params: "query=ms" })),
    ).resolves.toBe("ms");
  });

  it("queryとparamsがない場合はundefinedを返す", async () => {
    await expect(resolveQuery(createRequest({}))).resolves.toBeUndefined();
  });

  it("queryとparamsの両方がある場合はqueryを優先する", async () => {
    await expect(
      resolveQuery(createRequest({ query: "msw", params: "query=ms" })),
    ).resolves.toBe("msw");
  });

  it("paramsが文字列でない場合はundefinedを返す", async () => {
    await expect(
      resolveQuery(createRequest({ params: { query: "ms" } })),
    ).resolves.toBeUndefined();
  });
});
