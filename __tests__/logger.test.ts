import { logger } from "../lib/logger";

describe("logger", () => {
  const levels = ["debug", "info", "warn", "error"] as const;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(levels)(
    "%s は同名の console メソッドに 1 行の JSON を出す",
    (level) => {
      const spy = vi.spyOn(console, level).mockImplementation(() => {});

      logger[level]("hello");

      expect(spy).toHaveBeenCalledTimes(1);
      const line = spy.mock.calls[0][0] as string;
      expect(line).not.toContain("\n");
      expect(JSON.parse(line)).toEqual({
        level,
        msg: "hello",
        ts: "2026-01-02T03:04:05.000Z",
      });
    },
  );

  it("context を渡すと context キーにそのまま入る", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    logger.info("copied", { format: "md", count: 1 });

    expect(JSON.parse(spy.mock.calls[0][0] as string)).toEqual({
      level: "info",
      msg: "copied",
      ts: "2026-01-02T03:04:05.000Z",
      context: { format: "md", count: 1 },
    });
  });

  it("context の Error は name と message に展開する", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("copy failed", { reason: new Error("denied") });

    expect(JSON.parse(spy.mock.calls[0][0] as string)).toEqual({
      level: "error",
      msg: "copy failed",
      ts: "2026-01-02T03:04:05.000Z",
      context: { reason: { name: "Error", message: "denied" } },
    });
  });

  it("他のレベルの console メソッドは呼ばない", () => {
    const spies = levels.map((level) =>
      vi.spyOn(console, level).mockImplementation(() => {}),
    );

    logger.warn("only warn");

    expect(spies.map((spy) => spy.mock.calls.length)).toEqual([0, 0, 1, 0]);
  });
});
