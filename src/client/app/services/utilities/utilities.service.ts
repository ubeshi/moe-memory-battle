import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UtilitiesService {
  public getRange(start: number, end: number): number[] {
    return [...Array(end - start).keys()].map((i) => i + start);
  }

  public shuffleArray<T>(array: T[]): T[] {
    array = array.slice();
    for (let index = array.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]]; // swap
    }
    return array;
  }
}
