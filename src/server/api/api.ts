import * as express from "express";

const router = express.Router();
export default router;

import waifuApi from "./waifu/waifu-api";
router.use("/waifu", waifuApi);
