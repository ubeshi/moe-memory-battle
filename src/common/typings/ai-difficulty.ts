export class AiDifficulty {
  public static readonly EASY = new AiDifficulty("easy", { maximumFaceDownMemory: 2 });
  public static readonly MEDIUM = new AiDifficulty("medium", { maximumFaceDownMemory: 4 });
  public static readonly HARD = new AiDifficulty("hard", { maximumFaceDownMemory: 8 });
  public static readonly PERFECT = new AiDifficulty("perfect", { maximumFaceDownMemory: 16 });

  constructor(public readonly name: string, public readonly config: AiDifficultyConfig) {}
}

interface AiDifficultyConfig {
  maximumFaceDownMemory: number;
}

const aiDifficulties = [
  AiDifficulty.EASY,
  AiDifficulty.MEDIUM,
  AiDifficulty.HARD,
  AiDifficulty.PERFECT,
];

export function getAiDifficultyByName(name: string): AiDifficulty {
  return aiDifficulties.find((aiDifficulty) => aiDifficulty.name === name) as AiDifficulty;
}
