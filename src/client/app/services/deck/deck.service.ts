import { inject, Injectable } from "@angular/core";
import { peekCard } from "@client/app/card-database/peek.card";
import { revealCard } from "@client/app/card-database/reveal.card";
import { Deck } from "@common/typings/deck";
import { CardService } from "../card/card.service";
import { shineCard } from "@client/app/card-database/shine.card";
import { turboCard } from "@client/app/card-database/turbo.card";
import { blinkCard } from "@client/app/card-database/blink.card";

@Injectable({
  providedIn: "root",
})
export class DeckService {
  private readonly cardService = inject(CardService);

  public getStarterDeck(): Deck {
    return {
      startingHandCards: [
        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),
      ],
      fieldCards: [
        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),

        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),

        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),
        this.cardService.getCardCopy(blinkCard),
      ],
    };
  }
}
