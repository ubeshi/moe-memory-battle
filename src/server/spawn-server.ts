import cors from "cors";
import express from "express";
import * as http from "http";
import * as path from "path";
import { AddressInfo } from "net";

import api from "./api/api";

export async function spawnServer(): Promise<http.Server> {
  const app = express();
  app.use(express.text());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Direct all api calls to the api
  app.use("/api", api);

  // Direct all non-api calls to the SPA
  app.use("/", express.static(path.join(__dirname, "../client/browser"))); // Express will serve index.html and supporting resources
  app.use("/", (_req, res) => res.sendFile(path.join(__dirname, "../client/browser/index.html"))); // SPA router handles all other paths

  const server = new http.Server(app);

  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      console.log(`Listening on port ${port}`);
      resolve(server);
    });
  });
}
