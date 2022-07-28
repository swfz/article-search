import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

import {
  MultipleQueriesResponse,
  MultipleQueriesQuery,
} from "@algolia/client-search";
import algoliasearch from "algoliasearch/lite";
import { default as React, useRef } from "react";
import {
  InstantSearch,
  SearchBox,
  Index,
  Highlight,
  Snippet,
  Hits,
  RefinementList,
  PoweredBy,
  InfiniteHits,
} from "react-instantsearch-hooks-web";

import type { Hit, SearchClient } from "instantsearch.js";

type PageHitProps = {
  hit: Hit;
};

type Indices = {
  name: string;
  title?: string;
};

// NOTE: queryHookはSearchBoxConnectorParamsを持ってきたかったが持ってくる方法がわからなかったのでコピーしている
type CustomSearchProps = {
  indices: Indices[];
  queryHook: (query: string, hook: (value: string) => void) => void;
};

const PageHit = ({ hit }: PageHitProps) => {
  return (
    <div className={styles.card}>
      <a href={hit.url} target="_blank" rel="noreferer">
        <p>
          <Highlight attribute="title" hit={hit} />
        </p>
      </a>
      {hit.tags.map((tag: string) => {
        return <span className={styles.tag}>{tag}</span>;
      })}
      <br />
      <Snippet
        attribute="rawMarkdownBody"
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

  const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
  );

  const searchClient: SearchClient = {
    ...algoliaClient,
    // NOTE: https://www.algolia.com/doc/guides/building-search-ui/going-further/conditional-requests/react-hooks/
    // クエリ文字列が空の場合はリクエストを送らずダミーのレスポンスを返す実装を挟んでいる
    search: <SearchResponse,>(requests: Readonly<MultipleQueriesQuery[]>) => {
      if (requests.every(({ params }) => !params?.query)) {
        return Promise.resolve<MultipleQueriesResponse<SearchResponse>>({
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
        }) as Readonly<Promise<MultipleQueriesResponse<SearchResponse>>>;
      }

      return algoliaClient.search(requests);
    },
  };

  // NOTE: https://www.algolia.com/doc/guides/building-search-ui/going-further/improve-performance/react-hooks/#disabling-as-you-type
  // 入力確定判断まで1秒待つ
  const queryHook: CustomSearchProps["queryHook"] = (query, search) => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    timerId.current = setTimeout(() => search(query), 1000);
  };

  return (
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
            <div key={index}>
              <Index key={index} indexName={index}>
                <h2>{index}</h2>
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
  );
};

export default Search;
