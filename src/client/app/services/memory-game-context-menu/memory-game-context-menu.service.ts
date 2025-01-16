import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ElementRef, inject, Injectable, Injector } from "@angular/core";
import { MemoryGameContextMenuComponent } from "@client/app/services/memory-game-context-menu/memory-game-context-menu/memory-game-context-menu.component";
import { ContextMenuAction } from "@common/typings/memory-game";
import { CONTEXT_MENU_ACTIONS } from "./memory-game-context-menu-actions-injection-token";

@Injectable({
  providedIn: "root",
})
export class MemoryGameContextMenuService {
  private readonly overlay = inject(Overlay);

  public open(elementRef: ElementRef, actions: ContextMenuAction[]): void {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(elementRef)
      .withPositions([{ originX: "center", originY: "center", overlayX: "start", overlayY: "top" }]);

    const contextMenu = this.overlay.create({ positionStrategy });

    const portalInjector = Injector.create({
      providers: [
        { provide: OverlayRef, useValue: contextMenu },
        { provide: CONTEXT_MENU_ACTIONS, useValue: actions },
      ],
    });
    contextMenu.attach(new ComponentPortal(MemoryGameContextMenuComponent, undefined, portalInjector));
  }
}
