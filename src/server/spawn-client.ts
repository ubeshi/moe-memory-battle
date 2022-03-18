import * as download from "download-chromium";
import * as os from "os";
import { execFile } from "child_process";

export function spawnClient(port: number): void {
  download({
    revision: "662092",
    installPath: os.tmpdir(),
  }).then((installedPath: string) => {
    const clientProcess = execFile(installedPath, [ `--app=http://localhost:${port}` ], (error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
    clientProcess.on("close", () => {
      process.exit(0);
    });
  });
}
