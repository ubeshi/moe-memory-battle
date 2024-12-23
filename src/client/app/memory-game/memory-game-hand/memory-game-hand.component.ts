import { Component, Input } from "@angular/core";
import { Card } from "@common/typings/card";
import { MemoryGameController } from "@common/typings/player";
import { Observable, Subject } from "rxjs";

@Component({
    selector: "mmb-memory-game-hand",
    templateUrl: "./memory-game-hand.component.html",
    styleUrls: ["./memory-game-hand.component.scss"],
    standalone: false
})
export class MemoryGameHandComponent implements MemoryGameController {
  @Input() cards: Card[] = [];

  private _positionClicked = new Subject<number>();
  public get positionClicked(): Observable<number> {
    return this._positionClicked.asObservable();
  }

  public handlePositionClicked(position: number): void {
    this._positionClicked.next(position);
  }
}
