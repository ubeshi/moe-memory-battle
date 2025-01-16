import { Injectable } from "@angular/core";
import { Card } from "@common/typings/card";

@Injectable({
  providedIn: "root",
})
export class CardService {
  public getCardCopy(card: Card): Card {
    return JSON.parse(JSON.stringify(card)) as Card;
  }
}
