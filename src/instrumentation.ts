export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // In production cloud environments or when ENABLE_AUTO_POLLER is true, automatically launch 24/7 background poller
    const shouldRunPoller =
      process.env.ENABLE_AUTO_POLLER === "true" ||
      process.env.NODE_ENV === "production";

    if (shouldRunPoller) {
      console.log("[Cloud Runner] Initializing 24/7 background Reddit poller daemon...");
      const { pollerService } = await import("./services/poller-service");
      pollerService.startDaemon();
    }
  }
}
