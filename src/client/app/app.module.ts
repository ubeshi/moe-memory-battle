import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { MemoryGameBoardComponent } from "./memory-game/memory-game-board/memory-game-board.component";
import { MemoryGameCardComponent } from "./memory-game/memory-game-card/memory-game-card.component";
import { MemoryGamePlayerHandComponent } from "./memory-game/memory-game-player-hand/memory-game-player-hand.component";
import { MemoryGameComponent } from "./memory-game/memory-game.component";

@NgModule({
  declarations: [
    AppComponent,
    MemoryGameComponent,
    MemoryGameBoardComponent,
    MemoryGameCardComponent,
    MemoryGamePlayerHandComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
