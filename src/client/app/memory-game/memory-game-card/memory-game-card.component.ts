import { Component, Input } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { CardFace } from "@common/typings/card";

@Component({
  selector: "memory-game-card",
  templateUrl: "./memory-game-card.component.html",
  styleUrls: ["./memory-game-card.component.scss"],
})
export class MemoryGameCardComponent {
  @Input() frontImage: SafeUrl | undefined;
  @Input() backImage: SafeUrl | undefined;
  @Input() shownFace: CardFace = CardFace.BACK;

  public CardFace = CardFace;
}
