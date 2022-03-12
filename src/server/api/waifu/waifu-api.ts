import * as express from "express";

import { WaifuLabsClient } from "@server/waifulabs/waifu-labs-client";

const router = express.Router();
export default router;

router.get("/random", async (_req, res) => {
  try {
    const waifuLabsClient = await WaifuLabsClient.getWaifuLabsClient();
    const randomWaifus = await waifuLabsClient.getWaifus();
    res.status(200).send(randomWaifus);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});
