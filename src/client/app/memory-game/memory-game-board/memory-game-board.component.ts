import { Component, OnInit } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { WaifuApiService } from "@client/app/services/waifu-api/waifu-api.service";
import { CardFace } from "../memory-game-constants";

const enum MemoryGameState {
  NOT_STARTED,
  STARTED,
  FINISHED,
};

interface Card {
  image: SafeUrl;
  shownFace: CardFace;
}

@Component({
  selector: "memory-game-board",
  templateUrl: "./memory-game-board.component.html",
  // styleUrls: ["./memory-game-board.component.scss"],
})
export class MemoryGameBoardComponent implements OnInit {

  constructor(private waifuApiService: WaifuApiService) { }
  
  public cards: Card[] = [];

  async ngOnInit(): Promise<void> {
    this.cards = await this.getNewCards();
  }

  async getNewCards(): Promise<Card[]> {
    const uniqueCardImages = await this.waifuApiService.getWaifus();

    // Create pairs of cards
    const uniqueCards: Card[] = uniqueCardImages.map((image) => ({ image, shownFace: CardFace.BACK }));
    const uniqueCardDupes: Card[] = uniqueCardImages.map((image) => ({ image, shownFace: CardFace.BACK }));
    const pairedCards = uniqueCards.concat(uniqueCardDupes);

    return this.shuffleCards(pairedCards);
  }

  private shuffleCards(cards: Card[]): Card[] {
    cards = cards.slice();
    for (let index = cards.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]]; // swap
    }
    return cards;
  }

  private flipCard(card: Card) {
    if (card.shownFace === CardFace.BACK) {
      card.shownFace = CardFace.FRONT;
    } else {
      card.shownFace = CardFace.BACK;
    }
  }

  public handleCardClicked(card: Card): void {
    this.flipCard(card);
  }
}
