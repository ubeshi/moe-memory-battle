import axios, { AxiosResponse } from "axios";
import * as SetCookieParser from "set-cookie-parser";

declare module "axios" {
  interface HeadersDefaults {
    cookie: string;
  }
}

export class WaifuLabsAxios {
  private static baseUrl = `https://waifulabs.com`;

  private static axiosInstance = axios.create({
    baseURL: WaifuLabsAxios.baseUrl,
    withCredentials: true,
    responseType: "text",
  });

  private static waifuLabsKey: string | undefined;

  private static WAIFU_LABS_KEY_COOKIE_NAME = "_waifulab_key";

  public static async get<T>(path: string): Promise<AxiosResponse<T>> {
    await WaifuLabsAxios.initializeWaifuLabsKey();
    return WaifuLabsAxios.axiosInstance.get(path);
  }

  public static async post<T, B>(path: string, body?: B): Promise<AxiosResponse<T>> {
    await WaifuLabsAxios.initializeWaifuLabsKey();
    return WaifuLabsAxios.axiosInstance.post(path, body);
  }

  private static async initializeWaifuLabsKey(): Promise<void> {
    if (!WaifuLabsAxios.waifuLabsKey) {
      const generatePageResponse = await WaifuLabsAxios.axiosInstance.get<string>("/generate");
      const setCookieHeaders = SetCookieParser.parse(generatePageResponse.headers["set-cookie"] ?? [], { map: true });
      const waifuLabsKey = setCookieHeaders[WaifuLabsAxios.WAIFU_LABS_KEY_COOKIE_NAME].value;
      WaifuLabsAxios.axiosInstance.defaults.headers.cookie = `_waifulab_key=${waifuLabsKey}`;
    }
  }
}
