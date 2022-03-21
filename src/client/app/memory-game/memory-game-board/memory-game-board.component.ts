import { Component, Input, Output } from "@angular/core";
import { Deck } from "@common/typings/card";
import { MemoryGameController } from "@common/typings/player";
import { Observable, Subject } from "rxjs";

@Component({
  selector: "mmb-memory-game-board",
  templateUrl: "./memory-game-board.component.html",
  styleUrls: ["./memory-game-board.component.scss"],
})
export class MemoryGameBoardComponent implements MemoryGameController {
  @Input() deck: Deck = [];

  private _positionClicked = new Subject<number>();
  @Output() public get positionClicked(): Observable<number> {
    return this._positionClicked.asObservable();
  }

  public handlePositionClicked(position: number): void {
    this._positionClicked.next(position);
  }
}
