import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { map, take } from "rxjs/operators";

import { Waifu } from "@common/typings/waifu";
import { baseUrl } from "@client/app/config";

@Injectable({
  providedIn: "root",
})
export class WaifuApiService {
  constructor (
    private httpClient: HttpClient,
  ) {}

  public async getWaifus(): Promise<string[]> {
    return this.httpClient.get<Waifu[]>(`${baseUrl}/api/waifu/random`).pipe(
      take(1),
      map((waifus) => waifus.map((waifu) => waifu.image)),
      map((base64Strings) => base64Strings.map((base64String) => `data:image/png;charset=utf-8;base64,${base64String}`)),
    ).toPromise();
  }
}
