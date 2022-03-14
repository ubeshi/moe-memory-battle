export interface Card {
  imageUrl: string;
  shownFace: CardFace;
}

export enum CardFace {
  FRONT,
  BACK,
}

export type DeckSlotContent = Card | null;

export type Deck = DeckSlotContent[];
