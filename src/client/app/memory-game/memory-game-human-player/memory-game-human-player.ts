import { Card, DeckSlotContent } from "@common/typings/card";
import { MemoryGameController, MemoryGamePlayer } from "@common/typings/player";
import { filter, take } from "rxjs/operators";

export class MemoryGameHumanPlayer implements MemoryGamePlayer {
  private controller: MemoryGameController;

  public hand: Card[] = [];

  constructor(controller: MemoryGameController) {
    this.controller = controller;
  }

  public async getFirstGuessPosition(): Promise<number> {
    return this.controller.positionClicked.pipe(take(1)).toPromise();
  }

  public async getSecondGuessPosition(firstGuessedPosition: number): Promise<number> {
    return this.controller.positionClicked.pipe(
      filter((clickedPosition) => clickedPosition !== firstGuessedPosition),
      take(1),
    ).toPromise();
  }

  public rememberContentAtPosition(_content: DeckSlotContent, _position: number) {
    // Left as an excercise to the player
  }
}
