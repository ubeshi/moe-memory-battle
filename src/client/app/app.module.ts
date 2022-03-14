import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { MemoryGameBoardComponent } from "./memory-game/memory-game-board/memory-game-board.component";
import { MemoryGameCardComponent } from "./memory-game/memory-game-card/memory-game-card.component";
import { MemoryGameHandComponent } from "./memory-game/memory-game-hand/memory-game-hand.component";
import { MemoryGameComponent } from "./memory-game/memory-game.component";

@NgModule({
  declarations: [
    AppComponent,
    MemoryGameComponent,
    MemoryGameBoardComponent,
    MemoryGameCardComponent,
    MemoryGameHandComponent,
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
