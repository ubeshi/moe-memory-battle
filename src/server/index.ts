import { AddressInfo } from "net";

import { spawnClient } from "./spawn-client";
import { spawnServer } from "./spawn-server";

export const cwd = process.cwd();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const server = await spawnServer();
  const { port } = server.address() as AddressInfo;
  await spawnClient(port);
}
