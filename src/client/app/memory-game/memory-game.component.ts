import { Component } from "@angular/core";
import { Card } from "@common/typings/card";

@Component({
  selector: "memory-game",
  templateUrl: "./memory-game.component.html",
  // styleUrls: ["./memory-game.component.scss"],
})
export class MemoryGameComponent {
  public playerHand: Card[] = [];

  public handlePairMatched(card: Card): void {
    this.playerHand.push(card);
  }
}
