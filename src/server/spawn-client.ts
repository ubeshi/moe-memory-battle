import * as os from "os";
import { execFile } from "child_process";
import { downloadChromium } from "./download-chromium";

export async function spawnClient(port: number): Promise<void> {
  const installedPath = await downloadChromium({ revision: "1399578", installPath: os.tmpdir(), log: true });
  const clientProcess = execFile(installedPath, [ `--app=http://localhost:${port}`, `--test-type` ], (error) => {
    if (error) {
      console.error(error);
      throw error;
    } else {
      process.exit(0);
    }
  });
  clientProcess.on("close", () => {
    process.exit(0);
  });
}
