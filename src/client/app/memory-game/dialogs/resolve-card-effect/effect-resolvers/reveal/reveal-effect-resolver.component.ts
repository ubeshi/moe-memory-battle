import { Component, EventEmitter, Input, Output } from "@angular/core";
import { flipCardFaceDown, flipCardFaceUp, wait } from "@client/app/memory-game/memory-game.utils";
import { Deck } from "@common/typings/card";
import { MemoryGamePlayer } from "@common/typings/player";

@Component({
    selector: "mmb-reveal-effect-resolver",
    templateUrl: "./reveal-effect-resolver.component.html",
    standalone: false
})
export class RevealEffectResolverComponent {
  @Input() deck: Deck = [];
  @Input() players: MemoryGamePlayer[] = [];

  @Output() resolved = new EventEmitter<void>();

  async handleDeckPositionClicked(position: number): Promise<void> {
    const clickedCard = this.deck[position];
    if (clickedCard === null) {
      return;
    } else {
      flipCardFaceUp(clickedCard);
      this.players.forEach((player) => player.rememberContentAtPosition(clickedCard, position));
      await wait(1000);
      flipCardFaceDown(clickedCard);
      await wait(500);
      this.resolved.emit();
    }
  }
}
