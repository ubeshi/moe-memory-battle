import { AiDifficulty } from "@common/typings/ai";

export const MEMORY_GAME_ROUTER_PATH = "memory-game";
export const DIFFICULTY_ROUTE_PARAM = "difficulty";

export interface MemoryGameActivatedRouteParams {
  [DIFFICULTY_ROUTE_PARAM]: AiDifficulty;
};
