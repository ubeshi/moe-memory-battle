import { AiDifficulty } from "@common/typings/ai";
import { Deck, DeckSlotContent } from "@common/typings/card";
import { getDeckCopy, getFaceUpCardsFromDeck, isNotNull } from "../memory-game.utils";
import {
  addContentToMemory,
  getAnyPairPositionFromMemory,
  getAnyRememberedPositionFromMemory,
  getRandomUnknownPosition,
  removePositionFromMemory,
  getNumberOfCardsToForget,
} from "./memory-game-ai.utils";

export class MemoryGameAi {
  private rememberedDeck: Deck = [];  
  private turnNumber: number = 0;
  private difficulty = AiDifficulty.PERFECT;

  constructor(deck: Deck, difficulty: AiDifficulty) {
    this.rememberedDeck = getDeckCopy(deck);
    this.difficulty = difficulty;
  }
  
  public rememberPosition(position: number, content: DeckSlotContent): void {
    this.rememberedDeck = addContentToMemory(this.rememberedDeck, content, position);
  }

  public forgetPosition(position: number): void {
    this.rememberedDeck = removePositionFromMemory(this.rememberedDeck, position);
  }

  public getBestFirstGuessPosition(memory: Deck): number {
    const rememberedPosition = getAnyPairPositionFromMemory(memory);
    if (isNotNull(rememberedPosition)) {
      return rememberedPosition[0];
    } else {
      return getRandomUnknownPosition(memory);
    }
  }

  public getBestSecondGuessPosition(memory: Deck, firstGuessedPosition: number): number {
    const firstGuessedCard = memory[firstGuessedPosition];
    const rememberedCards = getFaceUpCardsFromDeck(memory);
    const matchingRememberedCards = rememberedCards.filter((card) => card.imageUrl === firstGuessedCard?.imageUrl);

    if (matchingRememberedCards.length === 2) {
      const matchingCardPositions = matchingRememberedCards.map((card) => memory.indexOf(card));
      if (matchingCardPositions[0] !== firstGuessedPosition) {
        return matchingCardPositions[0];
      } else {
        return matchingCardPositions[1];
      }
    } else {
      return getRandomUnknownPosition(memory);
    }
  }

  public takeTurn(): [firstGuessedPosition: number, secondGuessedPosition: number] {
    this.rememberedDeck = this.getPersistingMemory(this.rememberedDeck);
    const firstGuessedPosition = this.getFirstGuessPosition();
    const secondGuessedPosition = this.getSecondGuessPosition(firstGuessedPosition);
    this.turnNumber++;
    return [firstGuessedPosition, secondGuessedPosition];
  }

  private getPersistingMemory(memory: Deck): Deck {
    const numberOfCardsToForget = getNumberOfCardsToForget(this.difficulty, this.turnNumber);
    for (let i = 0; i < numberOfCardsToForget; i++) {
      const rememberedPosition = getAnyRememberedPositionFromMemory(memory);
      if (isNotNull(rememberedPosition)) {
        memory = removePositionFromMemory(memory, rememberedPosition);
      }
    }
    return memory;
  }

  private getFirstGuessPosition(): number {
    const guessedPosition = this.getBestFirstGuessPosition(this.rememberedDeck);
    const guessedContent = this.rememberedDeck[guessedPosition];

    if (isNotNull(guessedContent)) {
      this.rememberPosition(guessedPosition, guessedContent);
      return guessedPosition;
    } else {
      throw new Error("AI guessed position was empty");
    }
  }

  private getSecondGuessPosition(firstGuessedPosition: number): number {
    const guessedPosition = this.getBestSecondGuessPosition(this.rememberedDeck, firstGuessedPosition);
    const guessedContent = this.rememberedDeck[guessedPosition];

    if (isNotNull(guessedContent)) {
      this.rememberPosition(guessedPosition, guessedContent);
      return guessedPosition;
    } else {
      throw new Error("AI guessed position was empty");
    }
  }
}
