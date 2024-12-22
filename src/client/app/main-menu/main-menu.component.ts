import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AiDifficulty } from "@common/typings/ai";
import { MEMORY_GAME_ROUTER_PATH } from "../memory-game/memory-game-routing-constants";

@Component({
    selector: "mmb-main-menu",
    templateUrl: "./main-menu.component.html",
    standalone: false
})
export class MainMenuComponent {
  constructor(private router: Router) { }

  public handleEasyButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.EASY]);
  }

  public handleMediumButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.MEDIUM]);
  }

  public handleHardButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.HARD]);
  }

  public handlePerfectButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.PERFECT]);
  }
}
