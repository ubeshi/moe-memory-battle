import { Component, Input } from "@angular/core";
import { Card } from "@common/typings/card";

@Component({
  selector: "memory-game-hand",
  templateUrl: "./memory-game-hand.component.html",
  // styleUrls: ["./memory-game-hand.component.scss"],
})
export class MemoryGameHandComponent {
  @Input() cards: Card[] = [];
}
