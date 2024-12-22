import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Card, CardEffect, Deck } from "@common/typings/card";
import { MemoryGamePlayer } from "@common/typings/player";
import { getCardEffectDescription } from "../../card-effects/card-effect-descriptions";
import { getCardEffectName } from "../../card-effects/card-effect-names";

@Component({
    selector: "mmb-resolve-card-effect-dialog",
    templateUrl: "./resolve-card-effect.dialog.html",
    standalone: false
})
export class ResolveCardEffectDialogComponent {
  public CardEffect = CardEffect;

  public card: Card;
  public deck: Deck;
  public players: MemoryGamePlayer[];

  public cardEffectName: string;
  public cardEffectDescription: string;

  constructor(
    public dialogRef: MatDialogRef<ResolveCardEffectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { card: Card, deck: Deck, players: MemoryGamePlayer[] },
  ) {
    this.dialogRef.disableClose = true;
    this.card = data.card;
    this.deck = data.deck;
    this.players = data.players;

    this.cardEffectName = getCardEffectName(data.card.effect);
    this.cardEffectDescription = getCardEffectDescription(data.card.effect);
  }
}
