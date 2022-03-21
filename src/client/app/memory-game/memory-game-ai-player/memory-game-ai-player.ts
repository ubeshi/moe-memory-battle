import { AiDifficulty } from "@common/typings/ai";
import { Card, Deck, DeckSlotContent } from "@common/typings/card";
import { MemoryGamePlayer } from "@common/typings/player";
import { getDeckCopy, isNotNull, wait } from "../memory-game.utils";
import {
  addContentToMemory,
  getAnyRememberedPositionFromMemory,
  removePositionFromMemory,
  getNumberOfCardsToForget,
  getFirstGuessPosition,
  getSecondGuessPosition,
} from "./memory-game-ai-player.utils";

const AI_THINKING_DELAY = 1000;

export class MemoryGameAiPlayer implements MemoryGamePlayer {
  private rememberedDeck: Deck = [];  
  private turnNumber = 0;
  private difficulty = AiDifficulty.PERFECT;

  public hand: Card[] = [];

  constructor(deck: Deck, difficulty: AiDifficulty) {
    this.rememberedDeck = getDeckCopy(deck);
    this.difficulty = difficulty;
  }
  
  public rememberContentAtPosition(content: DeckSlotContent, position: number): void {
    this.rememberedDeck = addContentToMemory(this.rememberedDeck, content, position);
  }

  public async getFirstGuessPosition(): Promise<number> {
    this.rememberedDeck = this.getMemoryAfterForgetting(this.rememberedDeck);
    await wait(AI_THINKING_DELAY);
    return Promise.resolve(getFirstGuessPosition(this.rememberedDeck));
  }

  public async getSecondGuessPosition(firstGuessedPosition: number): Promise<number> {
    this.turnNumber++;
    await wait(AI_THINKING_DELAY);
    return Promise.resolve(getSecondGuessPosition(this.rememberedDeck, firstGuessedPosition));
  }

  public async getPlayedCardFromHandPosition():Promise<number> {
    return Promise.reject(); // Not implemented
  }

  private getMemoryAfterForgetting(memory: Deck): Deck {
    const numberOfCardsToForget = getNumberOfCardsToForget(this.difficulty, this.turnNumber);
    for (let i = 0; i < numberOfCardsToForget; i++) {
      const rememberedPosition = getAnyRememberedPositionFromMemory(memory);
      if (isNotNull(rememberedPosition)) {
        memory = removePositionFromMemory(memory, rememberedPosition);
      }
    }
    return memory;
  }
}
