import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { PlayerSlot } from "@common/typings/memory-game";
import { BehaviorSubject, map } from "rxjs";

export interface PlayerTargetingDialogData {
  quantity: number;
  playerSlots: PlayerSlot[];
}

export interface PlayerTargetingDialogResponse {
  selectedPlayerSlots: PlayerSlot[];
}

@Component({
  selector: "mmb-player-targeting-dialog",
  templateUrl: "./player-targeting-dialog.component.html",
  styleUrl: "./player-targeting-dialog.component.scss",
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class PlayerTargetingDialogComponent {
  public static readonly DIALOG_CONFIG: DialogConfig<PlayerTargetingDialogData,  DialogRef<PlayerTargetingDialogResponse, PlayerTargetingDialogComponent>> = {
    hasBackdrop: true,
    disableClose: true,
  };

  private readonly dialogRef = inject(DialogRef<PlayerTargetingDialogResponse, PlayerTargetingDialogComponent>);
  private readonly data: PlayerTargetingDialogData = inject(DIALOG_DATA);

  public readonly playerSlots = this.data.playerSlots;
  public readonly quantity = this.data.quantity;
  public readonly selectedPlayerSlotsMap$ = new BehaviorSubject<Map<PlayerSlot, boolean>>(
    this.getInitialSelectedPlayerSlotsMap(this.playerSlots)
  );
  public readonly numberOfSelectedPlayerSlots$ = this.selectedPlayerSlotsMap$.pipe(map((selectedPlayerSlotsMap) => {
    return Array.from(selectedPlayerSlotsMap.values()).filter((selected) => selected).length;
  }));

  getInitialSelectedPlayerSlotsMap(playerSlots: PlayerSlot[]): Map<PlayerSlot, boolean> {
    const map = new Map<PlayerSlot, boolean>();
    playerSlots.forEach((playerSlot) => {
      map.set(playerSlot, false);
    });
    return map;
  }

  async handlePlayerSlotSelectionChanged(playerSlot: PlayerSlot, selected: boolean): Promise<void> {
    const selectedPlayerSlotsMap = this.selectedPlayerSlotsMap$.value;
    selectedPlayerSlotsMap.set(playerSlot, selected);
    this.selectedPlayerSlotsMap$.next(selectedPlayerSlotsMap);
  }

  handleConfirmTargetsClicked(): void {
    const selectedPlayerSlots = Array.from(this.selectedPlayerSlotsMap$.value.entries())
      .map(([playerSlot, selected]) => ({ playerSlot, selected }))
      .filter(({ selected }) => selected)
      .map(({ playerSlot }) => playerSlot);
    this.dialogRef.close({ selectedPlayerSlots });
  }
}
