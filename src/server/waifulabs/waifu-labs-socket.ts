import * as WebSocket from "ws";
import * as EventEmitter from "events";

import { WaifuLabsSocketEvent, WaifuLabsSocketMetadata, WaifuLabsSocketResponse, WaifuLabsSocketResponseData, WaifuLabsSocketScope } from "./waifulabs";
import { WaifuLabsCredentials } from "./waifu-labs-credentials";
import { SOCKET_OPEN_EVENT_NAME } from "./waifu-labs-constants";

export class WaifuLabsSocket {
  private static socketNumber = 0;
  private static _transactionNumber = 0;
  private static heartbeatPeriodMs = 30000;

  private eventEmitter = new EventEmitter();
  private webSocketMetadata: WaifuLabsSocketMetadata;
  private credentials: WaifuLabsCredentials;

  private constructor(credentials: WaifuLabsCredentials) {
    this.credentials = credentials;
    this.webSocketMetadata = this.getNewWebSocket(credentials);
  }

  public static async getWaifuLabsSocket(): Promise<WaifuLabsSocket> {
    const credentials = await WaifuLabsCredentials.getWaifuLabsCredentials();
    const waifuLabsSocket = new WaifuLabsSocket(credentials);
    return waifuLabsSocket;
  }

  private static getNewTransactionNumber(): number {
    return this._transactionNumber++;
  }

  private getNewWebSocket(credentials: WaifuLabsCredentials): WaifuLabsSocketMetadata {
    const webSocket = new WebSocket(`wss://waifulabs.com/creator/socket/websocket?token=${credentials.getAuthToken()}&vsn=2.0.0`);
    this.setWebSocketHandlers(webSocket);
    const connectionNumber = WaifuLabsSocket.socketNumber++;
    return { webSocket, connectionNumber };
  }

  private setWebSocketHandlers(webSocket: WebSocket): void {
    webSocket.on("open", () => {
      this.request(WaifuLabsSocketEvent.JOIN, {}, WaifuLabsSocketScope.API);
      this.eventEmitter.emit(SOCKET_OPEN_EVENT_NAME);
    });

    webSocket.on("message", (messageString: string) => {
      this.handleResponse(messageString);
    });

    const heartbeatInterval = setInterval(() => {
      this.request(WaifuLabsSocketEvent.HEARTBEAT, {}, WaifuLabsSocketScope.PHOENIX);
    }, WaifuLabsSocket.heartbeatPeriodMs);

    webSocket.on("close", () => {
      clearInterval(heartbeatInterval);
      this.webSocketMetadata = this.getNewWebSocket(this.credentials);
    });

    webSocket.on("error", () => {
      clearInterval(heartbeatInterval);
      this.webSocketMetadata = this.getNewWebSocket(this.credentials);
    });
  }

  public async request<T>(eventType: WaifuLabsSocketEvent, requestData: Object, scope: WaifuLabsSocketScope): Promise<WaifuLabsSocketResponseData<T>> {
    const { webSocket, connectionNumber } = this.webSocketMetadata;
    const readyState = webSocket.readyState;
    const transactionId = WaifuLabsSocket.getNewTransactionNumber().toString();
    const connectionId = eventType === WaifuLabsSocketEvent.HEARTBEAT ? null : connectionNumber.toString();

    // If the socket is closed, open a new one
    if (readyState === WebSocket.CLOSING || readyState === WebSocket.CLOSED) {
      this.webSocketMetadata = this.getNewWebSocket(this.credentials);
    }

    // If the socket has not connected yet, wait for it to open
    if (readyState === WebSocket.CONNECTING) {
      await this.waitForEvent(SOCKET_OPEN_EVENT_NAME);
    }

    const responsePromise = this.waitForEvent<WaifuLabsSocketResponseData<T>>(transactionId);
    const requestBody = [connectionId, transactionId, scope, eventType, requestData];
    webSocket.send(JSON.stringify(requestBody));
    return responsePromise;
  }

  private handleResponse(messageString: string) {
    const [_connectionId, messageId, _, _eventType, responseData] = JSON.parse(messageString) as WaifuLabsSocketResponse;
    this.eventEmitter.emit(messageId, responseData);
  }

  private async waitForEvent<T = void>(eventName: string): Promise<T> {
    return new Promise((resolve) => this.eventEmitter.once(eventName, resolve));
  }
}
