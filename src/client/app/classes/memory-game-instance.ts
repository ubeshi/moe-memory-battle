import { Field } from "@common/typings/card";
import { MemoryGame, PlayerId, PlayerSlot, PlayerTeam, PlayerZones, Turn, TurnPhase } from "@common/typings/memory-game";
import { BehaviorSubject, Observable } from "rxjs";
import { MemoryGameService } from "../services/memory-game/memory-game.service";
import { AiPlayerInstance } from "@common/typings/ai";
import { PlayerControlType } from "@common/typings/player";
import { BasicMemoryAiPlayerInstance } from "./basic-memory-ai-player-instance";

export class MemoryGameInstance implements MemoryGame {
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
  aiPlayerInstances: { [key in PlayerId]: AiPlayerInstance };

  private _currentTurn$: BehaviorSubject<Turn>;
  private _currentPhase$: BehaviorSubject<TurnPhase>;

  private memoryGameService = MemoryGameService.getInstance();

  constructor(playerSlots: PlayerSlot[]) {
    this.playerSlots = playerSlots;
    const aiPlayerSlots = this.playerSlots.filter((playerSlot) => playerSlot.player.controlType === PlayerControlType.LOCAL_AI);

    this.aiPlayerInstances = aiPlayerSlots.reduce((acc, aiPlayerSlot) => {
      if (aiPlayerSlot.player.controlType === PlayerControlType.LOCAL_AI) {
        acc[aiPlayerSlot.playerId] = new BasicMemoryAiPlayerInstance(aiPlayerSlot.playerId, this, aiPlayerSlot.player.aiDifficulty.config.maximumFaceDownMemory);
      }
      return acc;
    }, {} as { [key in PlayerId]: AiPlayerInstance });

    this.turns = playerSlots.map((playerSlot) => this.memoryGameService.getDefaultTurn(playerSlot.playerId));
    this.currentTurnIndex = 0;
    this.currentTurnPhaseIndex = 0;
    this.playerZones = playerSlots.reduce((acc, playerSlot) => {
      acc[playerSlot.playerId] = this.memoryGameService.getPlayerZones();
      return acc;
    }, {} as Record<PlayerId, PlayerZones>);
    this.field = this.memoryGameService.getInitialField(playerSlots.map((playerSlot) => playerSlot.player.deck));
    this.playerPenalties = playerSlots.reduce((acc, playerSlot) => {
      acc[playerSlot.playerId] = {
        penaltyMarks: 0,
        penaltyPoints: 0,
      };
      return acc;
    }, {} as Record<PlayerId, { penaltyMarks: number; penaltyPoints: number }>);
    this.teams = playerSlots.map((playerSlot) => playerSlot.playerTeam).filter((team, index, self) => self.indexOf(team) === index);
    this.lostTeams = [];

    const currentTurn = this.turns[this.currentTurnIndex];
    this._currentTurn$ = new BehaviorSubject(currentTurn);
    const currentPhase = currentTurn.phases[this.currentTurnPhaseIndex];
    this._currentPhase$ = new BehaviorSubject(currentPhase);

    // Initialize player starting hands
    playerSlots.forEach((playerSlot) => {
      const playerZones = this.playerZones[playerSlot.playerId];
      const hand = playerZones.hand;
      hand.cards = playerSlot.player.deck.startingHandCards.slice();
    });
  }

  public appendTurnForPlayer(playerId: PlayerId): void {
    this.turns.push(this.memoryGameService.getDefaultTurn(playerId));
  }

  public getCurrentTurn(): Observable<Turn> {
    return this._currentTurn$.asObservable();
  }

  public getCurrentPhase(): Observable<TurnPhase> {
    return this._currentPhase$.asObservable();
  }

  public goToNextTurn(): void {
    this.currentTurnIndex++;
    this.currentTurnPhaseIndex = 0;
    if (this.currentTurnIndex >= this.turns.length) {
      throw new Error("goToNextTurn out of bounds");
    }
    const currentTurn = this.turns[this.currentTurnIndex];
    this._currentTurn$.next(currentTurn);
    this._currentPhase$.next(currentTurn.phases[this.currentTurnPhaseIndex]);
  }

  public goToNextPhase(): void {
    this.currentTurnPhaseIndex++;
    const currentTurn = this.turns[this.currentTurnIndex];
    if (this.currentTurnPhaseIndex >= currentTurn.phases.length) {
      throw new Error("goToNextPhase out of bounds");
    }
    const currentPhase = currentTurn.phases[this.currentTurnPhaseIndex];
    this._currentPhase$.next(currentPhase);
  }

  public getPlayerTeamByPlayerId(playerId: PlayerId): PlayerTeam | undefined {
    return this.playerSlots.find((playerSlot) => playerSlot.playerId === playerId)?.playerTeam;
  }
}
