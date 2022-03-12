import { Component, OnInit } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { WaifuApiService } from "@client/app/services/waifu-api/waifu-api.service";
import { CardFace } from "../memory-game-constants";

const enum MemoryGameState {
  NO_CARDS_REVEALED,
  FIRST_CARD_REVEALED,
  SECOND_CARD_REVEALED,
};

interface Card {
  image: SafeUrl;
  shownFace: CardFace;
}

type Deck = Array<Card | null>;

@Component({
  selector: "memory-game-board",
  templateUrl: "./memory-game-board.component.html",
  styleUrls: ["./memory-game-board.component.scss"],
})
export class MemoryGameBoardComponent implements OnInit {

  constructor(private waifuApiService: WaifuApiService) { }

  private memoryGameState = MemoryGameState.NO_CARDS_REVEALED;

  public deck: Deck = [];

  async ngOnInit(): Promise<void> {
    this.deck = await this.getNewCards();
  }

  async getNewCards(): Promise<Card[]> {
    const uniqueCardImages = await this.waifuApiService.getWaifus();

    // Create pairs of cards
    const uniqueCards: Card[] = uniqueCardImages.map((image) => ({ image, shownFace: CardFace.BACK }));
    const uniqueCardDupes: Card[] = uniqueCardImages.map((image) => ({ image, shownFace: CardFace.BACK }));
    const pairedCards = uniqueCards.concat(uniqueCardDupes);

    return this.shuffleArray(pairedCards);
  }

  private shuffleArray<T>(array: Array<T>): Array<T> {
    array = array.slice();
    for (let index = array.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]]; // swap
    }
    return array;
  }

  private flipCard(card: Card): void {
    if (card.shownFace === CardFace.BACK) {
      card.shownFace = CardFace.FRONT;
    } else {
      card.shownFace = CardFace.BACK;
    }
  }

  public handleCardClicked(clickedCard: Card): void {
    if (clickedCard.shownFace === CardFace.FRONT) {
      return;
    }

    switch (this.memoryGameState) {
      case MemoryGameState.NO_CARDS_REVEALED: {
        this.handleNoCardsRevealedState(clickedCard);
        break;
      }
      case MemoryGameState.FIRST_CARD_REVEALED: {
        this.handleFirstCardRevealedState(clickedCard);
        break;
      }
      case MemoryGameState.SECOND_CARD_REVEALED: {
        // Do nothing
        break;
      }
    }
  }

  private handleNoCardsRevealedState(clickedCard: Card): void {
    this.flipCard(clickedCard);
    this.memoryGameState = MemoryGameState.FIRST_CARD_REVEALED;
  }

  private handleFirstCardRevealedState(clickedCard: Card): void {
    this.flipCard(clickedCard);
    this.memoryGameState = MemoryGameState.SECOND_CARD_REVEALED;

    const faceUpCards = this.getFaceUpCardsFromDeck(this.deck);
    const isPair = faceUpCards.every((card) => card.image === faceUpCards[0].image);
    
    const timeout = setTimeout(() => {
      clearTimeout(timeout);

      if (isPair) { // Remove matched cards from the deck
        this.deck = this.removeCardsFromDeck(this.deck, faceUpCards);
      } else { // Flip the cards back down
        faceUpCards.forEach(this.flipCard);
      }
      this.memoryGameState = MemoryGameState.NO_CARDS_REVEALED;
    }, 1000);  
  }

  private getFaceUpCardsFromDeck(deck: Deck): Card[] {
    return deck
      .filter(this.isNotNull)
      .filter((card) => card.shownFace === CardFace.FRONT);
  }

  private removeCardsFromDeck(deck: Deck, cards: Card[]): Deck {
    deck = deck.slice();
    cards.forEach((card) => {
      const cardIndex = deck.indexOf(card);
      if (cardIndex !== -1) {
        deck[cardIndex] = null;
      }
    });
    return deck;
  }

  private isNotNull<T>(item: T | null): item is T {
    return item !== null;
  }
}
