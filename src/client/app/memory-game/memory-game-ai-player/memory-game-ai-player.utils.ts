import { AiDifficulty } from "@common/typings/ai";
import { Card, CardFace, Deck, DeckSlotContent } from "@common/typings/card";
import { getDeckSlotCopy, getFaceDownCardsFromDeck, getFaceUpCardsFromDeck, isNotNull } from "../memory-game.utils";

export function addContentToMemory(memory: Deck, content: DeckSlotContent, position: number): Deck {
  memory = memory.slice();
  content = getDeckSlotCopy(content);
  if (isNotNull(content)) {
    rememberCard(content);
  }
  memory[position] = content;
  return memory;
}

export function removePositionFromMemory(memory: Deck, position: number): Deck {
  memory = memory.slice();
  const card = memory[position];
  if (isNotNull(card)) {
    forgetCard(card);
  }
  return memory;
}

export function getAnyPairPositionFromMemory(memory: Deck): [number, number] | null {
  const rememberedCards = getFaceUpCardsFromDeck(memory);
  for (let rememberedCard of rememberedCards) {
    const positions = getRememberedPositionsByImage(memory, rememberedCard.imageUrl);
    if (positions.length === 2) {
      return [positions[0], positions[1]];
    }
  }
  return null;
}

export function getRememberedPositionsByImage(memory: Deck, imageUrl: string): number[] {
  const rememberedCards = getFaceUpCardsFromDeck(memory).filter((card) => card.imageUrl === imageUrl);
  return rememberedCards.map((card) => memory.indexOf(card));
}

export function getFirstGuessPosition(memory: Deck): number {
  const rememberedPosition = getAnyPairPositionFromMemory(memory);
  if (isNotNull(rememberedPosition)) {
    return rememberedPosition[0];
  } else {
    return getRandomUnknownPosition(memory);
  }
}

export function getSecondGuessPosition(memory: Deck, firstGuessedPosition: number): number {
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

export function getRandomUnknownPosition(memory: Deck): number {
  const unknownCards = getFaceDownCardsFromDeck(memory);
  const randomUnknownCard = shuffleArray(unknownCards)[0];
  return memory.indexOf(randomUnknownCard);
}

export function forgetCardAtPosition(memory: Deck, position: number): Deck {
  memory = memory.slice();
  const content = memory[position];
  if (isNotNull(content)) {
    forgetCard(content);
  }
  return memory;
}

export function rememberCard(card: Card): void {
  card.shownFace = CardFace.FRONT;
}

export function forgetCard(card: Card): void {
  card.shownFace = CardFace.BACK;
}

export function shuffleArray<T>(array: Array<T>): Array<T> {
  array = array.slice();
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]]; // swap
  }
  return array;
}

export function getNumberOfCardsToForget(difficulty: AiDifficulty, turnNumber: number): number {
  let numberOfCardsToForget = 0;
  if (isForgettingCardByTurnNumber(difficulty, turnNumber)) {
    numberOfCardsToForget++;
  }
  if (isForgettingCardByChance(difficulty)) {
    numberOfCardsToForget++;
  }
  return numberOfCardsToForget;
}

export function isForgettingCardByTurnNumber(difficulty: AiDifficulty, turnNumber: number): boolean {
  if (difficulty === AiDifficulty.EASY) {
    return true;
  }
  if (difficulty === AiDifficulty.MEDIUM) {
    return turnNumber % 2 === 0;
  }
  if (difficulty === AiDifficulty.HARD) {
    return turnNumber % 3 === 0;
  }
  if (difficulty === AiDifficulty.PERFECT) {
    return false;
  }
  return false;
}

export function isForgettingCardByChance(difficulty: AiDifficulty): boolean {
  if (difficulty === AiDifficulty.EASY) {
    return Math.random() < 0.8;
  }
  if (difficulty === AiDifficulty.MEDIUM) {
    return Math.random() < 0.5;
  }
  if (difficulty === AiDifficulty.HARD) {
    return Math.random() < 0.2;
  }
  if (difficulty === AiDifficulty.PERFECT) {
    return false;
  }
  return false;
}

export function getAnyRememberedPositionFromMemory(memory: Deck): number | null {
  const rememberedCards = memory.filter(isNotNull).filter((card) => card.shownFace === CardFace.FRONT);
  if (rememberedCards.length === 0) {
    return null;
  } else {
    const randomRememberedCard = shuffleArray(rememberedCards)[0];
    return memory.indexOf(randomRememberedCard);
  }
}
