import { Component, ElementRef, inject, input } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { Card, CardFace, CardFieldSlot } from "@common/typings/card";

@Component({
    selector: "mmb-memory-game-card",
    templateUrl: "./memory-game-card.component.html",
    styleUrls: ["./memory-game-card.component.scss"],
    standalone: false
})
export class MemoryGameCardComponent {
  public _cardFieldSlot = input.required<CardFieldSlot>({ alias: "cardFieldSlot" });

  public readonly elementRef = inject(ElementRef);

  // public _card: Card = { shownFace: CardFace.BACK } as Card;
  // @Input() set card(card: Card) {
  //   this._card = card;
  //   this.effectIcon = `ion ion-md-${getCardEffectIcon(card.effect)}`;
  //   this._frontImage = this.domSanitizer.bypassSecurityTrustResourceUrl(card.imageUrl);
  // }

  public CardFace = CardFace;
  public _frontImage: SafeUrl | undefined;
  public _backImage: SafeUrl | undefined;
  public effectIcon = "";
}
