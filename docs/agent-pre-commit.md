# pre-commit フック

依存関係をインストールした後、次のコマンドで Git の pre-commit フックを有効にする。

```shell
pnpm exec lefthook install
```

フックはコミット対象の TypeScript / TSX ファイルに対して Prettier と ESLint を実行する。
設定変更後の動作確認や、コミットせず同じ検証を実行したい場合は次のコマンドを使う。

```shell
pnpm exec lefthook run pre-commit
```
