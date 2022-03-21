import * as os from "os";
import { execFile } from "child_process";
import { downloadChromium } from "./download-chromium";

export async function spawnClient(port: number): Promise<void> {
  const installedPath = await downloadChromium({ revision: "662092", installPath: os.tmpdir() });
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
}
