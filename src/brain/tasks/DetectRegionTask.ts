import type { BrainContext } from "../pipeline/BrainContext";
import { BrainTask } from "../pipeline/BrainTask";

const REGION_PATTERNS = [
  {
    region: "USA",
    patterns: [/\(USA\)/i, /\(US\)/i],
  },
  {
    region: "Europe",
    patterns: [/\(Europe\)/i, /\(EUR\)/i],
  },
  {
    region: "Japan",
    patterns: [/\(Japan\)/i, /\(JPN\)/i],
  },
  {
    region: "Brazil",
    patterns: [/\(Brazil\)/i, /\(Brasil\)/i, /\(BR\)/i],
  },
  {
    region: "World",
    patterns: [/\(World\)/i],
  },
  {
    region: "Australia",
    patterns: [/\(Australia\)/i],
  },
  {
    region: "Korea",
    patterns: [/\(Korea\)/i],
  },
];

export class DetectRegionTask extends BrainTask {
  readonly name = "Detectando região";

  async execute(
    context: BrainContext,
  ): Promise<void> {
    const fileName = context.game.fileName;

    const match = REGION_PATTERNS.find((entry) =>
      entry.patterns.some((pattern) =>
        pattern.test(fileName),
      ),
    );

    context.game.region = match?.region ?? null;
  }
}