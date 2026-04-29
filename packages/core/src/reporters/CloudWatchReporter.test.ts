import { describe, it, expect, vi } from "vitest";
import { CloudWatchReporter } from "./CloudWatchReporter";

const makeReporter = (overrides?: Partial<ConstructorParameters<typeof CloudWatchReporter>[0]>) =>
  new CloudWatchReporter({
    logGroupName: "/myapp/errors",
    logStreamName: "production",
    putLogEvents: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

describe("CloudWatchReporter", () => {
  it("calls putLogEvents with the correct log group, stream, and event shape", async () => {
    const putLogEvents = vi.fn().mockResolvedValue(undefined);
    const reporter = makeReporter({ putLogEvents, service: "my-app", environment: "production" });

    await reporter.report(new Error("boom"), {
      boundaryName: "Global",
      routeName: "/home",
    });

    expect(putLogEvents).toHaveBeenCalledOnce();
    const [logGroupName, logStreamName, events] = putLogEvents.mock.calls[0];
    expect(logGroupName).toBe("/myapp/errors");
    expect(logStreamName).toBe("production");
    expect(events).toHaveLength(1);
    expect(typeof events[0].timestamp).toBe("number");

    const entry = JSON.parse(events[0].message);
    expect(entry.level).toBe("error");
    expect(entry.message).toBe("boom");
    expect(entry.errorName).toBe("Error");
    expect(entry.boundaryName).toBe("Global");
    expect(entry.routeName).toBe("/home");
    expect(entry.service).toBe("my-app");
    expect(entry.environment).toBe("production");
  });

  it("does not throw when putLogEvents rejects", async () => {
    const putLogEvents = vi.fn().mockRejectedValue(new Error("CloudWatch unavailable"));
    const reporter = makeReporter({ putLogEvents });

    await expect(reporter.report(new Error("test"), {})).resolves.not.toThrow();
  });

  it("spreads context.extra fields into the log entry", async () => {
    const putLogEvents = vi.fn().mockResolvedValue(undefined);
    const reporter = makeReporter({ putLogEvents });

    await reporter.report(new Error("test"), {
      extra: { requestId: "abc-123", version: "1.0.5" },
    });

    const entry = JSON.parse(putLogEvents.mock.calls[0][2][0].message);
    expect(entry.requestId).toBe("abc-123");
    expect(entry.version).toBe("1.0.5");
  });

  it("omits undefined context fields from the log entry", async () => {
    const putLogEvents = vi.fn().mockResolvedValue(undefined);
    const reporter = makeReporter({ putLogEvents });

    await reporter.report(new Error("test"), {});

    const entry = JSON.parse(putLogEvents.mock.calls[0][2][0].message);
    expect(entry).not.toHaveProperty("boundaryName");
    expect(entry).not.toHaveProperty("routeName");
    expect(entry).not.toHaveProperty("userId");
    expect(entry).not.toHaveProperty("service");
    expect(entry).not.toHaveProperty("environment");
  });

  it("includes stack trace in the log entry", async () => {
    const putLogEvents = vi.fn().mockResolvedValue(undefined);
    const error = new Error("with stack");
    const reporter = makeReporter({ putLogEvents });

    await reporter.report(error, {});

    const entry = JSON.parse(putLogEvents.mock.calls[0][2][0].message);
    expect(entry.stack).toBe(error.stack);
  });
});
