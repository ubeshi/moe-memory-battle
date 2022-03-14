import { Component, OnInit } from "@angular/core";
import { AiDifficulty } from "@common/typings/ai";
import { Card, CardFace, Deck } from "@common/typings/card";
import { WaifuApiService } from "../services/waifu-api/waifu-api.service";
import { MemoryGameAi } from "./memory-game-ai/memory-game-ai";
import { shuffleArray } from "./memory-game-ai/memory-game-ai.utils";
import { flipCardFaceDown, flipCardFaceUp, getFaceUpCardsFromDeck, isNotNull, wait } from "./memory-game.utils";

export const enum MemoryGamePhase {
  PLAYER_TURN_NO_CARDS_REVEALED,
  PLAYER_TURN_FIRST_CARD_REVEALED,
  PLAYER_TURN_SECOND_CARD_REVEALED,
  AI_TURN,
};

const AI_TURN_PHASE_DELAY = 1000;
const PLAYER_TURN_END_DELAY = 1000;

@Component({
  selector: "memory-game",
  templateUrl: "./memory-game.component.html",
  // styleUrls: ["./memory-game.component.scss"],
})
export class MemoryGameComponent implements OnInit {
  public playerHand: Card[] = [];
  public aiHand: Card[] = [];
  public deck: Deck = [];
  private memoryGameState = MemoryGamePhase.PLAYER_TURN_NO_CARDS_REVEALED;
  private memoryGameAi: MemoryGameAi | undefined;

  constructor(
    private waifuApiService: WaifuApiService
  ) { }

  async ngOnInit() {
    this.deck = await this.getNewCards();
    this.memoryGameAi = new MemoryGameAi(this.deck.slice(), AiDifficulty.EASY);
  }

  private async conductAiTurn(): Promise<void> {
    await wait(AI_TURN_PHASE_DELAY);
    const isDeckEmpty = this.deck.every((cardSlot) => cardSlot === null);
    if (isDeckEmpty) {
      return;
    } else {
      const aiGuessedPositions = this.memoryGameAi!.takeTurn();

      if (aiGuessedPositions[0] === aiGuessedPositions[1]) {
        console.error(`AI guessed same position twice: ${aiGuessedPositions[0]}, ${aiGuessedPositions[1]}`);
      }

      const aiGuessedCards = aiGuessedPositions.map((position) => this.deck[position]);
      if (isNotNull(aiGuessedCards[0]) && isNotNull(aiGuessedCards[1])) {
        flipCardFaceUp(aiGuessedCards[0]);
        await wait(AI_TURN_PHASE_DELAY);
        
        flipCardFaceUp(aiGuessedCards[1]);
        await wait(AI_TURN_PHASE_DELAY);

        if (aiGuessedCards[0].imageUrl === aiGuessedCards[1].imageUrl) {
          this.handlePairMatched(aiGuessedCards[0]);
        } else {
          flipCardFaceDown(aiGuessedCards[0]);
          flipCardFaceDown(aiGuessedCards[1]);
        }
      } else {
        throw new Error("AI guessed empty position!");
      }
    }
  }

  public handlePairMatched(cardFromPair: Card): void {
    const matchingCards = this.deck.filter(isNotNull).filter((card) => card.imageUrl === cardFromPair.imageUrl);
    const matchingCardsPositions = matchingCards.map((card) => this.deck.indexOf(card));

    matchingCardsPositions.forEach((matchingCardPosition) => {
      this.memoryGameAi!.rememberPosition(matchingCardPosition, null);
    });

    this.deck = this.removeCardsFromDeck(this.deck, matchingCards);
    cardFromPair.shownFace = CardFace.FRONT;

    if (this.memoryGameState === MemoryGamePhase.AI_TURN) {
      this.aiHand.push(cardFromPair);
    } else {
      this.playerHand.push(cardFromPair);
    }
  }

  async getNewCards(): Promise<Card[]> {
    const uniqueCardImages = await this.waifuApiService.getWaifus();

    // Create pairs of cards
    const uniqueCards: Card[] = uniqueCardImages.map((imageUrl) => ({ imageUrl, shownFace: CardFace.BACK }));
    const uniqueCardDupes: Card[] = uniqueCardImages.map((imageUrl) => ({ imageUrl, shownFace: CardFace.BACK }));
    const pairedCards = uniqueCards.concat(uniqueCardDupes);

    return shuffleArray(pairedCards);
  }

  public handlePlayerSelectedCard(selectedCard: Card): void {
    if (selectedCard.shownFace === CardFace.FRONT) {
      return;
    }

    switch (this.memoryGameState) {
      case MemoryGamePhase.PLAYER_TURN_NO_CARDS_REVEALED: {
        this.handlePlayerNoCardsRevealedState(selectedCard);
        break;
      }
      case MemoryGamePhase.PLAYER_TURN_FIRST_CARD_REVEALED: {
        this.handlePlayerFirstCardRevealedState(selectedCard);
        break;
      }
      case MemoryGamePhase.PLAYER_TURN_SECOND_CARD_REVEALED: {
        // Do nothing
        break;
      }
      case MemoryGamePhase.AI_TURN: {
        // Do nothing
        break;
      }
    }
  }

  private handlePlayerNoCardsRevealedState(clickedCard: Card): void {
    flipCardFaceUp(clickedCard);
    const clickedCardPosition = this.deck.indexOf(clickedCard);
    this.memoryGameAi?.rememberPosition(clickedCardPosition, clickedCard);
    this.memoryGameState = MemoryGamePhase.PLAYER_TURN_FIRST_CARD_REVEALED;
  }

  private async handlePlayerFirstCardRevealedState(clickedCard: Card): Promise<void> {
    flipCardFaceUp(clickedCard);
    const clickedCardPosition = this.deck.indexOf(clickedCard);
    this.memoryGameAi?.rememberPosition(clickedCardPosition, clickedCard);
    this.memoryGameState = MemoryGamePhase.PLAYER_TURN_SECOND_CARD_REVEALED;

    const faceUpCards = getFaceUpCardsFromDeck(this.deck);
    const isPair = faceUpCards.every((card) => card.imageUrl === faceUpCards[0].imageUrl);
    
    await wait(PLAYER_TURN_END_DELAY);

    if (isPair) { // Remove matched cards from the deck
      this.handlePairMatched(faceUpCards[0]);
    } else { // Flip the cards back down
      faceUpCards.forEach(flipCardFaceDown);
    }
    this.memoryGameState = MemoryGamePhase.AI_TURN;
    this.conductAiTurn().then(() => {
      this.memoryGameState = MemoryGamePhase.PLAYER_TURN_NO_CARDS_REVEALED;
    });
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
}
