import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MEMORY_GAME_ROUTER_PATH } from "../memory-game/memory-game-routing-constants";
import { AiDifficulty } from "@common/typings/ai-difficulty";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "mmb-main-menu",
  templateUrl: "./main-menu.component.html",
  imports: [
    MatButtonModule,
  ],
})
export class MainMenuComponent {
  private readonly router = inject(Router);

  public handleEasyButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.EASY.name]);
  }

  public handleMediumButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.MEDIUM.name]);
  }

  public handleHardButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.HARD.name]);
  }

  public handlePerfectButtonClicked() {
    this.router.navigate([MEMORY_GAME_ROUTER_PATH, AiDifficulty.PERFECT.name]);
  }
}
