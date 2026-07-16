import { BrainPipeline } from "./pipeline/BrainPipeline";
import { CleanNameTask } from "./tasks/CleanNameTask";
import { DetectRegionTask } from "./tasks/DetectRegionTask";
import { DetectLanguagesTask } from "./tasks/DetectLanguagesTask";
import { DetectRevisionTask } from "./tasks/DetectRevisionTask";
import { FakeProvider } from "./providers/FakeProvider";
import { MetadataTask } from "./tasks/MetadataTask";

import type {
  BrainContext,
  BrainGame,
} from "./pipeline/BrainContext";

type BrainProgressCallback = (
  context: BrainContext,
) => void;

class NostalBrain {
private readonly metadataProvider =
  new FakeProvider();

  private readonly pipeline = new BrainPipeline([
  new DetectRegionTask(),
  new DetectLanguagesTask(),
  new DetectRevisionTask(),
  new CleanNameTask(),
  new MetadataTask(this.metadataProvider),
]);

  async analyze(
    game: BrainGame,
    onProgress?: BrainProgressCallback,
  ): Promise<BrainGame> {
    const context: BrainContext = {
      game: { ...game },
      progress: 0,
      currentTask: "Preparando análise",
      errors: [],
    };

    const result = await this.pipeline.run(
      context,
      onProgress,
    );

    if (result.errors.length > 0) {
      console.error(
        "Erros do NostalBrain:",
        result.errors,
      );
    }

    return result.game;
  }
}

export const nostalBrain = new NostalBrain();