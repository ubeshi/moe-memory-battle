import { Component, computed, ElementRef, input, output } from "@angular/core";
import { Card, CardFace } from "@common/typings/card";
import { MemoryGameCardComponent } from "../memory-game-card/memory-game-card.component";

@Component({
  selector: "mmb-memory-game-hand",
  templateUrl: "./memory-game-hand.component.html",
  styleUrls: ["./memory-game-hand.component.scss"],
  imports: [
    MemoryGameCardComponent,
  ],
})
export class MemoryGameHandComponent {
  public _cards = input.required<Card[]>({ alias: "cards" });
  public _shownFace = input.required<CardFace>({ alias: "shownFace" });
  public _cardSlots = computed(() => {
    return this._cards().map((card) => ({
      shownFace: this._shownFace(),
      card,
    }));
  });
  public positionClicked = output<{ position: number, elementRef: ElementRef }>();

  public handlePositionClicked(position: number, elementRef: ElementRef): void {
    this.positionClicked.emit({ position, elementRef });
  }
}
