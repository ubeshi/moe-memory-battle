import { Dialog } from "@angular/cdk/dialog";
import { inject, Injectable } from "@angular/core";
import { CardTargetPlayerType } from "@common/typings/card";
import { MemoryGame, PlayerSlot } from "@common/typings/memory-game";
import { PlayerTargetingDialogComponent, PlayerTargetingDialogData, PlayerTargetingDialogResponse } from "./player-targeting-dialog.component";
import { firstValueFrom } from "rxjs";

export interface PlayerTargetingOptions {
  quantity: number;
  saveTargetPlayersToKey: string;
  targetTypes: CardTargetPlayerType[];
  activatedPlayerId: string;
}

@Injectable({
  providedIn: "root",
})
export class PlayerTargetingService {
  private readonly dialog = inject(Dialog);
  private readonly _playerTargetsMap = new Map<string, PlayerSlot[]>();

  async getPlayerTargets(options: PlayerTargetingOptions, memoryGame: MemoryGame): Promise<PlayerSlot[]> {
    const validTargetPlayerSlots = memoryGame.playerSlots.filter((playerSlot) => {
      if (options.targetTypes.includes(CardTargetPlayerType.ANY)) {
        return true;
      } else if (options.targetTypes.includes(CardTargetPlayerType.SELF)) {
        return playerSlot.playerId === options.activatedPlayerId;
      } else if (options.targetTypes.includes(CardTargetPlayerType.OPPONENT)) {
        return playerSlot.playerId !== options.activatedPlayerId;
      }
      return false;
    });

    const dialogRef = this.dialog.open<PlayerTargetingDialogResponse, PlayerTargetingDialogData, PlayerTargetingDialogComponent>(
      PlayerTargetingDialogComponent,
      {
        ...PlayerTargetingDialogComponent.DIALOG_CONFIG,
        data: {
          playerSlots: validTargetPlayerSlots,
          quantity: options.quantity,
        },
      },
    );

    const { selectedPlayerSlots } = await firstValueFrom(dialogRef.closed) ?? { selectedPlayerSlots: [] };
    this._playerTargetsMap.set(options.saveTargetPlayersToKey, selectedPlayerSlots);
    return selectedPlayerSlots;
  }

  public getPlayerTargetsFromKey(key: string): PlayerSlot[] {
    return this._playerTargetsMap.get(key) ?? [];
  }

  public clearPlayerTargetsFromKey(key: string): void {
    this._playerTargetsMap.delete(key);
  }
}
