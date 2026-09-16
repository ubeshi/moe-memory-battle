import { Component, ElementRef, inject } from "@angular/core";

@Component({
  selector: "mmb-memory-game-empty-slot",
  templateUrl: "./memory-game-empty-slot.component.html",
  styleUrls: ["./memory-game-empty-slot.component.scss"],
})
export class MemoryGameEmptySlotComponent {
  public readonly elementRef = inject(ElementRef);
}
