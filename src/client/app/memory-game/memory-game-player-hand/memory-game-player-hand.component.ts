import { Component, Input } from "@angular/core";
import { Card } from "@common/typings/card";

@Component({
  selector: "memory-game-player-hand",
  templateUrl: "./memory-game-player-hand.component.html",
  // styleUrls: ["./memory-game-player.hand.component.scss"],
})
export class MemoryGamePlayerHandComponent {
  @Input() cards: Card[] = [];
}
