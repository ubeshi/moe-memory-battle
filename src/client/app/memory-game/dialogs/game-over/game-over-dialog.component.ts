import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MemoryGameInstance } from "@client/app/classes/memory-game-instance";
import { CardZoneType } from "@common/typings/card";
import { PlayerId, PlayerSlot } from "@common/typings/memory-game";

export interface GameOverDialogData {
  memoryGame: MemoryGameInstance;
}

export enum GameOverDialogAction {
  REMATCH = "rematch",
  MAIN_MENU = "main-menu",
}

export interface GameOverDialogResponse {
  action: GameOverDialogAction;
}

@Component({
  selector: "mmb-game-over-dialog",
  templateUrl: "./game-over-dialog.component.html",
  styleUrl: "./game-over-dialog.component.scss",
  imports: [
    MatCardModule,
    MatButtonModule,
  ],
})
export class GameOverDialogComponent {
  public static readonly DIALOG_CONFIG: DialogConfig<GameOverDialogData, DialogRef<GameOverDialogResponse, GameOverDialogComponent>> = {
    hasBackdrop: true,
    disableClose: true,
  };

  private readonly dialogRef = inject(DialogRef);
  private readonly data: GameOverDialogData = inject(DIALOG_DATA);

  public readonly memoryGame = this.data.memoryGame;
  public readonly PlayerId = PlayerId;
  public readonly CardZoneType = CardZoneType;
  public readonly GameOverDialogAction = GameOverDialogAction;

  public readonly gameResultDescription = this.getGameResultDescription(this.memoryGame);

  getGameResultDescription(memoryGame: MemoryGameInstance): string {
    const numberOfRemainingTeams = memoryGame.teams.length - memoryGame.lostTeams.length;
    const isGameOverByPenalties = numberOfRemainingTeams <= 1;
    if (isGameOverByPenalties) {
      if (numberOfRemainingTeams === 0) {
        return "Draw!";
      } else {
        const winningTeam = memoryGame.teams.find((team) => !memoryGame.lostTeams.includes(team));

        const winningTeamPlayerNames = memoryGame.playerSlots
          .filter((playerSlot) => {
            const playerId = playerSlot.playerId;
            const playerTeam = memoryGame.getPlayerTeamByPlayerId(playerId);
            return playerTeam === winningTeam;
          })
          .map((playerSlot) => playerSlot.player.name);

        if (winningTeamPlayerNames.length === 1) {
          return `${winningTeamPlayerNames[0]} wins!`;
        } else {
          return `${winningTeamPlayerNames.join(" & ")} win!`;
        }
      }
    }

    const pointsByPlayerSlot = new Map<PlayerSlot, number>();
    for (const playerSlot of memoryGame.playerSlots) {
      const playerId = playerSlot.playerId;
      const pointsFromHand = memoryGame.playerZones[playerId][CardZoneType.HAND].cards.length;
      const pointsFromExhaust = memoryGame.playerZones[playerId][CardZoneType.EXHAUST].cards.length;
      const penaltyPoints = memoryGame.playerPenalties[playerId].penaltyPoints;

      const totalPoints = pointsFromHand + pointsFromExhaust - penaltyPoints;
      pointsByPlayerSlot.set(playerSlot, totalPoints);
    }

    const playerSlotEntries = Array.from(pointsByPlayerSlot.entries())
      .map(([playerSlot, points]) => ({ playerSlot, points }));
    const firstPlayerPoints = playerSlotEntries[0].points;
    const allPlayersHaveSamePoints = playerSlotEntries.every(({ points }) => points === firstPlayerPoints);
    if (allPlayersHaveSamePoints) {
      return "Draw!";
    }

    const playerSlotWithMostPoints = Array.from(pointsByPlayerSlot.entries())
      .map(([playerSlot, points]) => ({ playerSlot, points }))
      .sort((a, b) => b.points - a.points)[0].playerSlot;

    const winnerName = playerSlotWithMostPoints.player.name;
    return `${winnerName} wins!`;
  }

  handleGameOverDialogActionClicked(action: GameOverDialogAction): void {
    this.dialogRef.close({ action });
  }
}
