import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { MainMenuComponent } from "./main-menu/main-menu.component";

import { MemoryGameBoardComponent } from "./memory-game/memory-game-board/memory-game-board.component";
import { MemoryGameCardComponent } from "./memory-game/memory-game-card/memory-game-card.component";
import { MemoryGameHandComponent } from "./memory-game/memory-game-hand/memory-game-hand.component";
import { MemoryGameComponent } from "./memory-game/memory-game.component";
import { RevealEffectResolverComponent } from "./memory-game/dialogs/resolve-card-effect/effect-resolvers/reveal/reveal-effect-resolver.component";
import { ResolveCardEffectDialogComponent } from "./memory-game/dialogs/resolve-card-effect/resolve-card-effect.dialog";
import { MatDialogModule } from "@angular/material/dialog";


@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    MemoryGameComponent,
    MemoryGameBoardComponent,
    MemoryGameCardComponent,
    MemoryGameHandComponent,
    ResolveCardEffectDialogComponent,
    RevealEffectResolverComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
