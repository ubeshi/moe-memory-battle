import { Observable } from "rxjs";
import { Card, FieldSlot } from "./card";
import { Deck } from "./deck";
import { AiDifficulty } from "./ai-difficulty";

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

export interface BasePlayer {
  deck: Deck;
  name: string;
  controlType: PlayerControlType;
}

export type Player = HumanPlayer | AiPlayer;

export interface HumanPlayer extends BasePlayer {
  controlType: PlayerControlType.LOCAL_HUMAN;
}

export interface AiPlayer extends BasePlayer{
  controlType: PlayerControlType.LOCAL_AI;
  aiDifficulty: AiDifficulty;
}

export enum PlayerControlType {
  LOCAL_HUMAN = "localHuman",
  LOCAL_AI = "localAi",
}
