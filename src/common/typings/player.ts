import { Observable } from "rxjs";
import { Card, FieldSlot } from "./card";
import { Deck } from "./deck";

export interface MemoryGamePlayer {
  hand: Card[];
  getFirstGuessPosition: () => Promise<number>;
  getSecondGuessPosition: (firstGuessedPosition: number) => Promise<number>;
  rememberContentAtPosition: (content: FieldSlot, position: number) => void;
  getPlayedCardFromHandPosition: () => Promise<number>;
}

export interface MemoryGameController {
  positionClicked: Observable<number>;
}

export interface MemoryGameGuessResult {
  card: Card,
  position: number,
}

export const enum GameAction {
  GUESS_CARD,
  PLAY_CARD,
}

export interface Player {
  deck: Deck;
}

export enum PlayerControlType {
  LOCAL_HUMAN = "localHuman",
  LOCAL_AI = "localAi",
}
