# article-search

複数サイトの記事データをAlgoliaに入れて全文検索を可能にするための検索UI

サイト毎にAlgoliaのインデックスを作成し記事データを保存する

本リポジトリは今のところ検索のUIのみ

記事のレコードを作成する処理は別途行う必要がある

## 環境変数

|name|remark|
|---|---|
|NEXT_PUBLIC_ALGOLIA_APP_ID|AlgoliaのAPP_ID|
|NEXT_PUBLIC_ALGOLIA_SEARCH_KEY|AlgoliaのSEARCH KEY|
|NEXT_PUBLIC_ALGOLIA_INDICES|検索対象のインデックスのリスト、カンマ区切り eg) `indexA,indexB,indexC` |

## インデックスに必要なattribute

検索UIで使用しているattribute

|name|remark|
|---|---|
|title|タイトル|
|url|記事のリンク(url)|
|tags|タグの配列|
|text|記事本文|

## dev

```shell
yarn dev
```

### Algolia APIのモック

```
export NEXT_PUBLIC_API_MOCKING=enabled
```

下記キーワード入力時のみmswが反応する

- m
- ms
- msw

### test時

サンプルの用意は下記2つのインデックス

```
export NEXT_PUBLIC_ALGOLIA_INDICES=hatenablog,til
```