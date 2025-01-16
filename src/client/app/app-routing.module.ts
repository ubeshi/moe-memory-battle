import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MAIN_MENU_ROUTER_PATH } from "./main-menu/main-menu-routing-constants";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { DIFFICULTY_ROUTE_PARAM, MEMORY_GAME_ROUTER_PATH } from "./memory-game/memory-game-routing-constants";
import { MemoryGameTwoComponent } from "./memory-game/memory-game-two.component";

const routes: Routes = [
  { path: `${MAIN_MENU_ROUTER_PATH}`, component: MainMenuComponent },
  { path: `${MEMORY_GAME_ROUTER_PATH}/:${DIFFICULTY_ROUTE_PARAM}`, component: MemoryGameTwoComponent },
  { path: "**", redirectTo: `/${MAIN_MENU_ROUTER_PATH}` },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
