import type { BrainContext } from "./BrainContext";

export abstract class BrainTask {
  abstract readonly name: string;

  abstract execute(
    context: BrainContext,
  ): Promise<void>;
}