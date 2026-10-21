// エージェントやログ基盤がレベルと文脈で絞り込めるよう、1 行の JSON で出力する。
// 新規のログは console を直接呼ばず、この logger を使う
type Level = "debug" | "info" | "warn" | "error";
type Context = Record<string, unknown>;

// Error は JSON.stringify すると {} になるため、name と message を残す
const replacer = (_key: string, value: unknown) =>
  value instanceof Error ? { name: value.name, message: value.message } : value;

const write = (level: Level, msg: string, context?: Context) => {
  const entry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...(context ? { context } : {}),
  };
  console[level](JSON.stringify(entry, replacer));
};

export const logger = {
  debug: (msg: string, context?: Context) => write("debug", msg, context),
  info: (msg: string, context?: Context) => write("info", msg, context),
  warn: (msg: string, context?: Context) => write("warn", msg, context),
  error: (msg: string, context?: Context) => write("error", msg, context),
};
