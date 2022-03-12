import * as WebSocket from "ws";

import { WaifuLabsSocketEvent, WaifuLabsSocketResponse, WaifuLabsSocketResponseData, WaifuLabsSocketScope } from "./waifulabs";
import * as EventEmitter from "events";
import { WaifuLabsCredentials } from "./waifu-labs-credentials";
import { SOCKET_OPEN_EVENT_NAME } from "./waifu-labs-constants";

export class WaifuLabsSocket {
  private static socketNumber = 0;
  private static heartbeatPeriodMs = 30000;

  private connectionNumber: number;
  private messageNumber: number;
  private eventEmitter = new EventEmitter();
  private webSocket: WebSocket;
  private credentials: WaifuLabsCredentials;

  private constructor(credentials: WaifuLabsCredentials) {
    this.credentials = credentials;
    this.webSocket = this.getNewWebSocket(credentials);
    this.connectionNumber = WaifuLabsSocket.socketNumber;
    this.messageNumber = this.connectionNumber;
    WaifuLabsSocket.socketNumber++;
  }

  public static async getWaifuLabsSocket(): Promise<WaifuLabsSocket> {
    const credentials = await WaifuLabsCredentials.getWaifuLabsCredentials();
    const waifuLabsSocket = new WaifuLabsSocket(credentials);
    return waifuLabsSocket;
  }

  private getNewWebSocket(credentials: WaifuLabsCredentials): WebSocket {
    const webSocket = new WebSocket(`wss://waifulabs.com/creator/socket/websocket?token=${credentials.getAuthToken()}&vsn=2.0.0`);
    this.setWebSocketHandlers(webSocket);
    return webSocket;
  }

  private setWebSocketHandlers(webSocket: WebSocket): void {
    webSocket.on("open", () => {
      this.request(WaifuLabsSocketEvent.JOIN, {}, WaifuLabsSocketScope.API);
      this.eventEmitter.emit(SOCKET_OPEN_EVENT_NAME);
    });

    webSocket.on("message", (messageString: string) => {
      this.handleMessage(messageString);
    });

    const heartbeatInterval = setInterval(() => {
      this.request(WaifuLabsSocketEvent.HEARTBEAT, {}, WaifuLabsSocketScope.PHOENIX);
    }, WaifuLabsSocket.heartbeatPeriodMs);

    webSocket.on("close", () => {
      clearInterval(heartbeatInterval);
      this.webSocket = this.getNewWebSocket(this.credentials);
    });

    webSocket.on("error", () => {
      clearInterval(heartbeatInterval);
      this.webSocket = this.getNewWebSocket(this.credentials);
    });
  }

  public async request<T>(eventType: WaifuLabsSocketEvent, requestData: Object, scope: WaifuLabsSocketScope): Promise<WaifuLabsSocketResponseData<T>> {
    if (this.webSocket.readyState !== WebSocket.OPEN) {
      await this.waitForEvent(SOCKET_OPEN_EVENT_NAME);
    }

    const messageId = this.messageNumber.toString();
    const connectionId = eventType === WaifuLabsSocketEvent.HEARTBEAT ? null : this.connectionNumber.toString();
    this.messageNumber++;

    const responsePromise = this.waitForEvent<WaifuLabsSocketResponseData<T>>(messageId);
    const requestBody = [connectionId, messageId, scope, eventType, requestData];
    this.webSocket.send(JSON.stringify(requestBody));
    return responsePromise;
  }

  private handleMessage(messageString: string) {
    const [_connectionId, messageId, _, _eventType, responseData] = JSON.parse(messageString) as WaifuLabsSocketResponse;
    this.eventEmitter.emit(messageId, responseData);
  }

  private async waitForEvent<T = void>(eventName: string): Promise<T> {
    return new Promise((resolve) => this.eventEmitter.once(eventName, resolve));
  }
}
