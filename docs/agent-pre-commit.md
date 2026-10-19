# pre-commit フック

`pnpm install --frozen-lockfile` の `prepare` scriptでHuskyが初期化される。
この環境では共通フック (`~/git-hooks/hooks`) が `.husky/pre-commit` を先に呼び出すため、Huskyが設定する `core.hooksPath` と共存できる。

フックはlint-stagedを介し、コミット対象のTypeScript / TSXファイルに対してPrettierとESLintを実行する。
コミットせず同じ検証を実行したい場合は、対象ファイルをstageして次のコマンドを使う。

```shell
pnpm exec lint-staged
```
