import { cleanGameName } from "../scanner/NameCleaner";

import type { BrainContext } from "../pipeline/BrainContext";
import { BrainTask } from "../pipeline/BrainTask";

export class CleanNameTask extends BrainTask {
  readonly name = "Limpando nome do jogo";

  async execute(
    context: BrainContext,
  ): Promise<void> {
    context.game.title = cleanGameName(
      context.game.fileName,
    );
  }
}