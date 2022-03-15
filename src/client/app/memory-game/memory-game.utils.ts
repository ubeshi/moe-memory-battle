import { Card, CardFace, Deck, DeckSlotContent } from "@common/typings/card";

export function isNotNull<T>(item: T | null): item is T {
  return item !== null;
}

export function getFaceUpCardsFromDeck(deck: Deck): Card[] {
  return deck
    .filter(isNotNull)
    .filter((card) => card.shownFace === CardFace.FRONT);
}

export function getFaceDownCardsFromDeck(deck: Deck): Card[] {
  return deck
    .filter(isNotNull)
    .filter((card) => card.shownFace === CardFace.BACK);
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, milliseconds);
  });
}

export function getDeckCopy(deck: Deck): Deck {
  return deck.map(getDeckSlotCopy);
}

export function getDeckSlotCopy(deckSlotContent: DeckSlotContent): DeckSlotContent {
  if (deckSlotContent === null) {
    return null;
  } else {
    return getCardCopy(deckSlotContent);
  }
}

export function getCardCopy(card: Card): Card {
  return {
    imageUrl: card.imageUrl,
    shownFace: card.shownFace,
  };
}

export function removeCardsFromDeck(deck: Deck, cards: Card[]): Deck {
  deck = deck.slice();
  cards.forEach((card) => {
    const cardIndex = deck.indexOf(card);
    if (cardIndex !== -1) {
      deck[cardIndex] = null;
    }
  });
  return deck;
}

export function isDeckEmpty(deck: Deck): boolean {
  return deck.every((deckSlot) => deckSlot === null);
}

export function flipCardFaceUp(card: Card): void {
  card.shownFace = CardFace.FRONT;
}

export function flipCardFaceDown(card: Card): void {
  card.shownFace = CardFace.BACK;
}

