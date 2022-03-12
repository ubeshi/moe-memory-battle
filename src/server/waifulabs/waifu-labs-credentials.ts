import { WaifuLabsAxios } from "./waifu-labs-axios";
import { WAIFU_LABS_ACCESS_TOKEN_REGEX, WAIFU_LABS_CSRF_TOKEN_REGEX } from "./waifu-regex";
import type { WaifuLabsSessionTokens } from "./waifulabs";

export class WaifuLabsCredentials {
  private _authToken: string;
  private _csrfToken: string;

  private constructor(credentials: WaifuLabsSessionTokens) {
    this._authToken = credentials.authToken;
    this._csrfToken = credentials.csrfToken;
  }

  public static async getWaifuLabsCredentials(): Promise<WaifuLabsCredentials> {
    const generatePageResponse = await WaifuLabsAxios.get<string>("/generate");

    const authToken = this.parseAuthToken(generatePageResponse.data);
    if (authToken === undefined) {
      throw new Error("Could not parse authToken from API response.");
    }

    const csrfToken = this.parseCsrfToken(generatePageResponse.data);
    if (csrfToken === undefined) {
      throw new Error("Could not parse csrfToken from API response.");
    }

    return new WaifuLabsCredentials({ authToken, csrfToken });
  }

  public getAuthToken(): string {
    return this._authToken;
  }

  public getCsrfToken(): string {
    return this._csrfToken;
  }

  private static parseAuthToken(html: string): string | undefined {
    if (WAIFU_LABS_ACCESS_TOKEN_REGEX.test(html) === true) {
      const matchGroups = WAIFU_LABS_ACCESS_TOKEN_REGEX.exec(html)!.groups;
      return matchGroups?.authToken;
    } else {
      return undefined;
    }
  }

  private static parseCsrfToken(html: string): string | undefined {
    if (WAIFU_LABS_CSRF_TOKEN_REGEX.test(html) === true) {
      const matchGroups = WAIFU_LABS_CSRF_TOKEN_REGEX.exec(html)!.groups;
      return matchGroups?.csrfToken;
    } else {
      return undefined;
    }
  }
}