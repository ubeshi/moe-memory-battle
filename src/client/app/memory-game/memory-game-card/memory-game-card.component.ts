import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Card, CardFace } from "@common/typings/card";
import { getCardEffectIcon } from "../card-effects/card-effect-icons";

@Component({
  selector: "mmb-memory-game-card",
  templateUrl: "./memory-game-card.component.html",
  styleUrls: ["./memory-game-card.component.scss"],
})
export class MemoryGameCardComponent {
  public _card: Card = { shownFace: CardFace.BACK } as Card;
  @Input() set card(card: Card) {
    this._card = card;
    this.effectIcon = `ion ion-md-${getCardEffectIcon(card.effect)}`;
    this._frontImage = this.domSanitizer.bypassSecurityTrustResourceUrl(card.imageUrl);
  }

  public CardFace = CardFace;
  public _frontImage: SafeUrl | undefined;
  public _backImage: SafeUrl | undefined;
  public effectIcon = "";

  constructor(private domSanitizer: DomSanitizer) { }
}
