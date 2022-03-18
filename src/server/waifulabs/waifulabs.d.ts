import type WebSocket from "ws";

import { Waifu } from "@common/typings/waifu";

export type WaifuSeedable = Waifu | string;

interface WaifulabsCredentials {
  session: string;
  static: string;
  id: string;
  csrf: string;
  token: string;
}

export interface WaifuLabsSessionTokens {
  authToken: string;
  csrfToken: string;
}

export interface GenerateGridResponse {
  data: {
    newGirls: Array<ResponseWaifu>;
  };
}

export interface GenerateBigResponse {
  data: {
    girl: string;
  }
}

interface ResponseWaifu {
  seeds: string;
  image: string;
}

export const enum GenerateWaifuStep {
  BASE = 0,
  COLOR = 1,
  DETAILS = 2,
  POSE = 3,
}

export type WaifuLabsSocketResponse = [
  connectionId: string,
  messageId: string,
  scope: WaifuLabsSocketScope,
  eventType: WaifuLabsSocketEvent,
  responseData: WaifuLabsSocketResponseData,
];

export const enum WaifuLabsSocketScope {
  API = "api",
  PHOENIX = "phoenix",
}

export const enum WaifuLabsSocketEvent {
  HEARTBEAT = "heartbeat",
  JOIN = "phx_join",
  REPLY = "phx_reply",
  GENERATE = "generate",
  GENERATE_PORTRAIT = "generate_big",
}

export interface WaifuLabsSocketResponseData<T = Record<string, unknown>> {
  response: T;
  status: string;
}

export interface WaifuLabsSocketMetadata {
  webSocket: WebSocket;
  connectionNumber: number;
}
