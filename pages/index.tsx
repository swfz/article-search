import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

import {
  SearchResponses,
  SearchQuery,
} from "algoliasearch/lite";
import { liteClient } from "algoliasearch/lite";
import { default as React, useRef } from "react";
import {
  InstantSearch,
  SearchBox,
  Index,
  Highlight,
  Snippet,
  PoweredBy,
  InfiniteHits,
} from "react-instantsearch";
import type { UseSearchBoxProps } from "react-instantsearch";

import type { Hit, SearchClient } from "instantsearch.js";

type PageHitProps = {
  hit: Hit;
};

const PageHit = ({ hit }: PageHitProps) => {
  const handleCopy = (format: "raw" | "md") => {
    return () => {
      const text = format === "md" ? `[${hit.title}](${hit.url})` : hit.url;
      navigator.clipboard.writeText(text).then(
        () => console.log("copied"),
        () => console.error("copy failed"),
      );
    };
  };

  return (
    <div data-testid="hit-card" className={styles.card}>
      <div className="line">
        {hit.url && (
          <>
            <span className={styles.article}>
              <a href={hit.url} target="_blank" rel="noreferrer">
                ↗
              </a>
            </span>
            <button onClick={handleCopy("md")} className={styles.copyButton}>
              md
            </button>
            <button onClick={handleCopy("raw")} className={styles.copyButton}>
              raw
            </button>
          </>
        )}
        <span className={styles.title}>
          <a href={hit.github} target="_blank" rel="noreferrer">
            <Highlight attribute="title" hit={hit} />
          </a>
        </span>
      </div>

      {hit.tags.map((tag: string) => {
        return (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        );
      })}

      <br />

      <Snippet
        attribute="text"
        separator="..."
        classNames={{
          root: styles.snippet,
        }}
        hit={hit}
      />
    </div>
  );
};

const Search: NextPage = () => {
  const indices = (process.env.NEXT_PUBLIC_ALGOLIA_INDICES || "").split(",");
  const timerId = useRef<ReturnType<typeof setTimeout>>();

  const algoliaClient = liteClient(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "dummy",
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "dummy",
  );

  const searchClient: SearchClient = {
    ...algoliaClient,
    // NOTE: https://www.algolia.com/doc/guides/building-search-ui/going-further/conditional-requests/react-hooks/
    // クエリ文字列が空の場合はリクエストを送らずダミーのレスポンスを返す実装を挟んでいる
    search: <SearchResponse,>(requests: Readonly<SearchQuery[]>) => {
      if (requests.every((request) => {
        if ('params' in request) {
          if (typeof request.params === 'string') {
            return !request.params || request.params === '';
          } else if (typeof request.params === 'object' && request.params !== null) {
            return !request.params.query || request.params.query === '';
          }
        }
        return !('query' in request) || !request.query;
      })) {
        return Promise.resolve<SearchResponses<SearchResponse>>({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0,
            hitsPerPage: 0,
            exhaustiveNbHits: true,
            query: "",
            params: "",
          })),
        });
      }

      return algoliaClient.search({ requests: [...requests] });
    },
  };

  // NOTE: https://www.algolia.com/doc/guides/building-search-ui/going-further/improve-performance/react-hooks/#disabling-as-you-type
  // 入力確定判断まで1秒待つ
  const queryHook: UseSearchBoxProps["queryHook"] = (query, search) => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    timerId.current = setTimeout(() => search(query), 1000);
  };

  return (
    <>
      <h1>Article Search</h1>

      <InstantSearch searchClient={searchClient} indexName={indices[1]}>
        <SearchBox placeholder="Search" queryHook={queryHook}></SearchBox>
        {/* <div className={styles.grid}>
        {indices.map(index => {
          return(
            <div className={styles.card}>
              <Index key={index} indexName={index}>
                <div>
                  <h2>{index}</h2>
                  <RefinementList
                    attribute='tags'
                    operator='and'
                    showMore={true}
                    classNames={{
                      count: styles.count,
                      item: styles.label,
                      list: styles['tags-list']
                    }}>
                  </RefinementList>
                </div>
              </Index>
            </div>
          )
        })}
      </div> */}

        <div className={styles.grid}>
          {indices.map((index) => {
            return (
              <div key={index} data-testid={index}>
                <Index key={index} indexName={index}>
                  <h2 data-testid="algolia-index">{index}</h2>
                  <InfiniteHits
                    classNames={{
                      list: styles["search-result-list"],
                      loadMore: styles.button,
                      disabledLoadMore: styles.button,
                      disabledLoadPrevious: styles.hidden,
                    }}
                    hitComponent={PageHit}
                  ></InfiniteHits>
                </Index>
              </div>
            );
          })}
        </div>
        <br />
        <PoweredBy classNames={{ root: styles.powered }} />
      </InstantSearch>
    </>
  );
};

export default Search;
