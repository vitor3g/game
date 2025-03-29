export function suppressViteLogs() {
  return {
    name: "suppress-vite-logs",
    configureServer(server: any) {
      const originalInfo = server.config.logger.info;
      const originalWarn = server.config.logger.warn;
      const originalError = server.config.logger.error;

      server.config.logger.info = (msg: string, options: object) => {
        if (!msg.includes("[vite]")) {
          originalInfo(msg, options);
        }
      };

      server.config.logger.warn = (msg: string, options: object) => {
        if (!msg.includes("[vite]")) {
          originalWarn(msg, options);
        }
      };

      server.config.logger.error = (msg: string, options: object) => {
        if (!msg.includes("[vite]")) {
          originalError(msg, options);
        }
      };
    },
    transformIndexHtml(html: string) {
      return html.replace(
        '<script type="module" src="/@vite/client"></script>',
        "",
      );
    },
  };
}
