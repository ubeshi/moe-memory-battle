import { Injectable } from "@angular/core";
import { revealCard } from "@client/app/card-database/reveal.card";
import { Deck } from "@common/typings/deck";

@Injectable({
  providedIn: "root",
})
export class DeckService {
  public getStarterDeck(): Deck {
    return {
      startingHandCards: [revealCard, revealCard, revealCard],
      fieldCards: [
        revealCard,
        revealCard,
        revealCard,
        revealCard,

        revealCard,
        revealCard,
        revealCard,
        revealCard,
      ],
    };
  }
}
