import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
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
import { MatDialogModule } from "@angular/material/dialog";
import { MemoryGameTwoComponent } from "./memory-game/memory-game-two.component";


@NgModule({ declarations: [
  AppComponent,
  MainMenuComponent,
  MemoryGameTwoComponent,
  MemoryGameBoardComponent,
  MemoryGameCardComponent,
  MemoryGameHandComponent,
],
bootstrap: [AppComponent], imports: [BrowserModule,
  CommonModule,
  AppRoutingModule,
  RouterModule,
  BrowserAnimationsModule,
  MatButtonModule,
  MatDialogModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
