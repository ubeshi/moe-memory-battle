import { Observable } from "rxjs";
import { Card, DeckSlotContent } from "./card";

export interface MemoryGamePlayer {
  hand: Card[];
  getFirstGuessPosition: () => Promise<number>;
  getSecondGuessPosition: (firstGuessedPosition: number) => Promise<number>;
  rememberContentAtPosition: (content: DeckSlotContent, position: number) => void;
}

export interface MemoryGameController {
  positionClicked: Observable<number>;
}

export interface MemoryGameGuessResult {
  card: Card,
  position: number,
}
