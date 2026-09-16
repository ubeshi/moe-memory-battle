import { CommonModule, NgClass } from "@angular/common";
import { Component, computed, ElementRef, inject, input } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { CardFace, CardSlot } from "@common/typings/card";

@Component({
  selector: "mmb-memory-game-card",
  templateUrl: "./memory-game-card.component.html",
  styleUrls: ["./memory-game-card.component.scss"],
  imports: [
    NgClass,
    CommonModule,
  ],
})
export class MemoryGameCardComponent {
  public _cardSlot = input.required<CardSlot>({ alias: "cardSlot" });
  public _cardText = computed(() => {
    return this._cardSlot().card.name;
  });

  public readonly elementRef = inject(ElementRef);

  public CardFace = CardFace;
  public _frontImage: SafeUrl | undefined;
  public _backImage: SafeUrl | undefined;
  public effectIcon = "";
}
