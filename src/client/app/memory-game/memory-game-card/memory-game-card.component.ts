import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { CardFace } from "@common/typings/card";

@Component({
  selector: "mmb-memory-game-card",
  templateUrl: "./memory-game-card.component.html",
  styleUrls: ["./memory-game-card.component.scss"],
})
export class MemoryGameCardComponent {
  @Input() set frontImage(imageUrl: string) {
    this._frontImage = this.domSanitizer.bypassSecurityTrustResourceUrl(imageUrl);
  }
  @Input() set backImage(imageUrl: string) {
    this._backImage = this.domSanitizer.bypassSecurityTrustResourceUrl(imageUrl);
  }
  @Input() shownFace: CardFace = CardFace.BACK;

  public CardFace = CardFace;
  public _frontImage: SafeUrl | undefined;
  public _backImage: SafeUrl | undefined;

  constructor(private domSanitizer: DomSanitizer) { }
}
