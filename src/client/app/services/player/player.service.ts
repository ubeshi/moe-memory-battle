import { inject, Injectable } from "@angular/core";
import { AiPlayer, HumanPlayer, PlayerControlType } from "@common/typings/player";
import { DeckService } from "../deck/deck.service";
import { AiDifficulty } from "@common/typings/ai-difficulty";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  private readonly deckService = inject(DeckService);

  getLocalHumanPlayer(name: string): HumanPlayer {
    return {
      name,
      deck: this.deckService.getStarterDeck(),
      controlType: PlayerControlType.LOCAL_HUMAN,
    };
  }

  getLocalAiPlayer(name: string, aiDifficulty: AiDifficulty): AiPlayer {
    return {
      name,
      deck: this.deckService.getStarterDeck(),
      controlType: PlayerControlType.LOCAL_AI,
      aiDifficulty,
    };
  }
}
