import { Component, OnInit } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { WaifuApiService } from "@client/app/services/waifu-api/waifu-api.service";

const enum MemoryGameState {
  NOT_STARTED,
  STARTED,
  FINISHED,
};

@Component({
  selector: "memory-game-board",
  templateUrl: "./memory-game-board.component.html",
  // styleUrls: ["./memory-game-board.component.scss"],
})
export class MemoryGameBoardComponent implements OnInit {

  constructor(private waifuApiService: WaifuApiService) { }
  
  public cardImages: SafeUrl[] = [];

  async ngOnInit(): Promise<void> {
    await this.getNewCards();
  }

  async getNewCards() {
    this.cardImages = await this.waifuApiService.getWaifus();
  }
}
