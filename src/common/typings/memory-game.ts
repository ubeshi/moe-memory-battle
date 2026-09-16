import { Card, CardFieldSlot, CardZoneType, Field } from "./card";
import { Player } from "./player";

export const MAXIMUM_PENALTY_MARKS = 3;
export const MAXIMUM_PENALTY_POINTS = 2;

export interface MemoryGame {
  playerSlots: PlayerSlot[];
  turns: Turn[];
  currentTurnIndex: number;
  currentTurnPhaseIndex: number;
  playerZones: Record<PlayerId, PlayerZones>;
  field: Field;
  playerPenalties: Record<PlayerId, {
    penaltyMarks: number;
    penaltyPoints: number
  }>;
  teams: PlayerTeam[];
  lostTeams: PlayerTeam[];
}

export interface Turn {
  playerId: PlayerId;
  phases: TurnPhase[];
  flipPhaseOneGuesses: CardFieldSlot[];
  flipPhaseTwoGuesses: CardFieldSlot[];
}

export enum PlayerId {
  PLAYER_ONE = "playerOne",
  PLAYER_TWO = "playerTwo",
}

export enum PlayerTeam {
  TEAM_ONE = "teamOne",
  TEAM_TWO = "teamTwo",
}

export interface PlayerSlot {
  playerId: PlayerId;
  playerTeam: PlayerTeam;
  player: Player;
}

export interface BaseTurnPhase {
  type: TurnPhaseType;
}

export enum TurnPhaseType {
  PLAY_CARD_PHASE = "playCardPhase",
  FLIP_PHASE_ONE = "flipPhaseOne",
  FLIP_PHASE_TWO = "flipPhaseTwo",
  END_PHASE = "endPhase",
}

export interface TurnPhase {
  type: TurnPhaseType;
}

export interface PlayCardPhase extends BaseTurnPhase {
  type: TurnPhaseType.PLAY_CARD_PHASE;
  state: PlayCardPhaseState;
}

export interface FlipPhaseOne extends BaseTurnPhase {
  type: TurnPhaseType.FLIP_PHASE_ONE;
}

export interface FlipPhaseTwo extends BaseTurnPhase {
  type: TurnPhaseType.FLIP_PHASE_TWO;
}

export interface EndPhase extends BaseTurnPhase {
  type: TurnPhaseType.END_PHASE;
}

export enum PlayCardPhaseState {
  PLAY_CARD_OR_END_PHASE = "playCardOrEndPhase",
  CARD_PLAYED = "cardPlayed",
}

export interface PlayerZones {
  [CardZoneType.HAND]: PlayerZone;
  [CardZoneType.ACTIVATION]: PlayerZone;
  [CardZoneType.EXHAUST]: PlayerZone;
  [CardZoneType.DISCARD]: PlayerZone;
  [CardZoneType.MATCH]: PlayerZone;
}

export interface PlayerZone {
  cards: Card[];
}

export interface ContextMenuAction {
  label: string;
  callback: () => void;
}
