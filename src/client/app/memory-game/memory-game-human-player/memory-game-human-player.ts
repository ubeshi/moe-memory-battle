import { Card, DeckSlotContent } from "@common/typings/card";
import { MemoryGameController, MemoryGamePlayer } from "@common/typings/player";
import { filter, take } from "rxjs/operators";

export class MemoryGameHumanPlayer implements MemoryGamePlayer {
  private boardController: MemoryGameController;
  private handController: MemoryGameController;

  public hand: Card[] = [];

  constructor(boardController: MemoryGameController, handController: MemoryGameController) {
    this.boardController = boardController;
    this.handController = handController;
  }

  public async getFirstGuessPosition(): Promise<number> {
    return this.boardController.positionClicked.pipe(take(1)).toPromise();
  }

  public async getSecondGuessPosition(firstGuessedPosition: number): Promise<number> {
    return this.boardController.positionClicked.pipe(
      filter((clickedPosition) => clickedPosition !== firstGuessedPosition),
      take(1),
    ).toPromise();
  }

  public async getPlayedCardFromHandPosition(): Promise<number> {
    return this.handController.positionClicked.pipe(take(1)).toPromise();
  }

  public rememberContentAtPosition(_content: DeckSlotContent, _position: number) {
    // Left as an excercise to the player
  }
}
