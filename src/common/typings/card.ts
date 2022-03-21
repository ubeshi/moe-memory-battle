export interface Card {
  imageUrl: string;
  shownFace: CardFace;
  effect: CardEffect;
}

export enum CardFace {
  FRONT,
  BACK,
}

export type DeckSlotContent = Card | null;

export type Deck = DeckSlotContent[];

export enum CardEffect {
  REVEAL = "reveal",
}
