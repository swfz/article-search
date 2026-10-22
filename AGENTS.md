# AGENTS.md

このリポジトリは、複数の Algolia インデックスを横断検索する Next.js の UI です。記事データの収集・Algolia への登録は別の仕組みが担当し、このリポジトリからは行いません。

## 前提とセットアップ

- Node.js は `.node-version` のバージョンを使う。
- パッケージマネージャーは `package.json` の `packageManager` にある pnpm を使う。npm や yarn で lockfile を増やさない。
- 依存関係は次のコマンドで再現する。

```sh
pnpm install --frozen-lockfile
```

本番の Algolia に接続する場合は、次の公開環境変数が必要になる。値や秘密情報はコミットしない。

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia application ID |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | 検索専用 API key。管理権限のある key は使わない |
| `NEXT_PUBLIC_ALGOLIA_INDICES` | 検索対象インデックスをカンマ区切りで指定 |
| `NEXT_PUBLIC_API_MOCKING` | `enabled` のとき MSW を有効化 |

## 開発・検証コマンド

```sh
pnpm dev          # MSWとhatenablog,tilを設定して開発サーバーを起動
pnpm build        # 静的サイトをout/へ生成
pnpm lint         # ESLint
pnpm lint:format  # Prettierの差分確認
pnpm typecheck    # TypeScriptの型検査
pnpm test         # MSWを使うVitest一式
pnpm test:coverage # Vitest一式＋カバレッジ計測(lines 70%未満で失敗。閾値は vitest.config.ts)
pnpm test:e2e     # Playwright の e2e。pnpm dev(MSW 有効)を起動して e2e/ を実行する。初回は pnpm exec playwright install chromium が必要
```

コミット前に `pnpm lint`、`pnpm lint:format`、`pnpm typecheck`、`pnpm test`、`pnpm test:e2e`、`pnpm build` を実行する。挙動を変えた場合は `__tests__/` に対応するテストを追加し、バグ修正では再現ケースをリグレッションテストとして残す。スナップショットは差分の意味を確認してから更新する。

`pnpm dev` は `NEXT_PUBLIC_API_MOCKING=enabled` を設定するため、Algolia の認証情報なしで動かせる。検索語 `m`、`ms`、`msw` に対して fixture が返る。実サービスを確認するときだけ、必要な `NEXT_PUBLIC_ALGOLIA_*` を明示してモックなしで起動する。

## 構成

- `pages/`: Next.js Pages Router の画面とアプリ初期化。`pages/index.tsx` が Algolia client と検索 UI を組み立て、`pages/_app.tsx` が必要に応じてブラウザー用 MSW を起動する。静的 export では API Routes を配信できないため、`pages/api/hello.ts` を本番 API として利用しない。
- `mocks/`: 開発とテストで共有する Algolia API の MSW handlers、ブラウザー／Node の初期化、JSON fixture。
- `e2e/`: Playwright の e2e。`pnpm dev` の MSW を使い、検索から結果表示・コピーまでを実ブラウザーで確認する。
- `__tests__/`: Vitest、Testing Library、Node 用 MSW による handler と UI のテスト。`__snapshots__/` には UI のスナップショットがある。
- `public/`: favicon と MSW の Service Worker。
- `styles/`: グローバル CSS と画面用 CSS Modules。
- `next.config.js`: `output: "export"` を指定する。`pnpm build` の成果物は追跡対象外の `out/` に出る。
- `.github/workflows/ci.yml`: push と pull request で build、ESLint、Prettier、型検査、テスト、e2e を別 job として実行する。
- `.github/workflows/slack.yml`: CI 完了後の通知。アプリケーションの検証ロジックではない。

Algolia のインデックス名はビルド時の `NEXT_PUBLIC_ALGOLIA_INDICES` から画面へ埋め込まれる。ブラウザーは検索時に Algolia へ直接リクエストする。開発とテストでは `mocks/handler.ts` が同じ API を横取りし、外部通信に依存しない。Cloudflare Pages は `pnpm build` で生成された静的な `out/` を配信する。

## ログと失敗の調査

### ローカル

アプリのログは `lib/logger.ts` の `logger.debug/info/warn/error(msg, context?)` で `{"level","msg","ts","context"}` の 1 行 JSON として出る。新しいログは `console` を直接呼ばず logger を使う。

`pnpm dev` と各検証コマンドの標準出力を最初に確認する。ブラウザー側の例外、MSW の未処理リクエスト、Algolia のレスポンスは DevTools の Console と Network で確認する。静的出力だけを切り分ける場合は `pnpm build` のログと `out/` の生成有無を確認する。

### GitHub Actions

GitHub CLI は `gh auth status` が成功し、`swfz/article-search` と Actions を読み取れる認証が必要。対象ブランチの run と失敗ログは次で取得する。

```sh
gh run list -R swfz/article-search --workflow ci.yml --branch <branch>
gh run view -R swfz/article-search <run-id> --log-failed
gh pr checks -R swfz/article-search <pr-number>
```

Web UI では PR の Checks、またはリポジトリの Actions → ci → 対象 run から各 job のログを開く。`slack notification` の失敗はアプリ本体の CI と分けて、Actions → slack notification で確認する。

### Cloudflare Pages

PR の Checks にある `Cloudflare Pages` の Details から対象 deployment を開く。直接確認する場合は Cloudflare Dashboard → Workers & Pages → `article-search` → Deployments → 対象 commit の View details で Build log と deployment status を確認する。閲覧にはこの Cloudflare account と `article-search` project への権限が必要で、GitHub の認証だけでは見られない。

Cloudflare 側で失敗した場合は、同じ commit の GitHub Actions `build` と比較する。GitHub 側だけ成功する場合は Cloudflare の Node/pnpm、build command、環境変数を確認する。ただし、このリポジトリの作業から Cloudflare 設定、deploy、Algolia データを変更しない。設定変更や秘匿値が必要なら人へ引き継ぐ。
