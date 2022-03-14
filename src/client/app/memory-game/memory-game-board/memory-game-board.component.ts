import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Card, Deck } from "@common/typings/card";
import { MemoryGamePhase } from "../memory-game.component";

@Component({
  selector: "memory-game-board",
  templateUrl: "./memory-game-board.component.html",
  styleUrls: ["./memory-game-board.component.scss"],
})
export class MemoryGameBoardComponent {
  @Input() memoryGamePhase = MemoryGamePhase.PLAYER_TURN_NO_CARDS_REVEALED;
  @Input() deck: Deck = [];

  @Output() playerSelectedCard = new EventEmitter<Card>();

  public handleCardClicked(card: Card): void {
    if (this.isInteractableGamePhase(this.memoryGamePhase)) {
      this.playerSelectedCard.emit(card);
    }
  }

  private isInteractableGamePhase(gamePhase: MemoryGamePhase): boolean {
    if (gamePhase === MemoryGamePhase.PLAYER_TURN_NO_CARDS_REVEALED) {
      return true;
    }
    if (gamePhase === MemoryGamePhase.PLAYER_TURN_FIRST_CARD_REVEALED) {
      return true;
    }
    return false;
  }

}
