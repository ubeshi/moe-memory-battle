declare module "download-chromium" {
  function download (options: { revision: string, installPath: string }): Promise<string>;
  export = download;
}
