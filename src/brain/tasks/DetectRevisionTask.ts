import type { BrainContext } from "../pipeline/BrainContext";
import { BrainTask } from "../pipeline/BrainTask";

const REVISION_PATTERNS = [
  /\(Rev(?:ision)?[\s_-]*([A-Z0-9.]+)\)/i,
  /\[Rev(?:ision)?[\s_-]*([A-Z0-9.]+)\]/i,
  /\(Version[\s_-]*([A-Z0-9.]+)\)/i,
  /\(v([0-9.]+)\)/i,
];

export class DetectRevisionTask extends BrainTask {
  readonly name = "Detectando revisão";

  async execute(
    context: BrainContext,
  ): Promise<void> {
    const fileName = context.game.fileName;

    for (const pattern of REVISION_PATTERNS) {
      const match = fileName.match(pattern);

      if (match) {
        const value = match[1];

        context.game.revision =
          pattern.source.includes("\\(v")
            ? `v${value}`
            : `Rev ${value}`;

        return;
      }
    }

    context.game.revision = null;
  }
}