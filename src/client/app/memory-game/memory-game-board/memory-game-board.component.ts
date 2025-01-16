import { Component, ElementRef, input, output } from "@angular/core";
import { FieldSlotType } from "@common/typings/card";
import { MemoryGame } from "@common/typings/memory-game";

@Component({
    selector: "mmb-memory-game-board",
    templateUrl: "./memory-game-board.component.html",
    styleUrls: ["./memory-game-board.component.scss"],
    standalone: false
})
export class MemoryGameBoardComponent {
  public _memoryGame = input.required<MemoryGame>({ alias: "memoryGame" });
  public positionClicked = output<{ position: number, elementRef: ElementRef }>();

  public FieldSlotType = FieldSlotType;

  public handlePositionClicked(position: number, elementRef: ElementRef): void {
    this.positionClicked.emit({ position, elementRef });
  }
}
