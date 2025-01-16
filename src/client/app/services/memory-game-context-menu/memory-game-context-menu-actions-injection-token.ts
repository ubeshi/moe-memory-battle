import { InjectionToken } from "@angular/core";
import { ContextMenuAction } from "@common/typings/memory-game";

export const CONTEXT_MENU_ACTIONS = new InjectionToken<ContextMenuAction[]>("CONTEXT_MENU_ACTIONS");
