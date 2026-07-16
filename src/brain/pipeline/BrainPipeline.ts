import type { BrainContext } from "./BrainContext";
import type { BrainTask } from "./BrainTask";

type BrainProgressCallback = (
  context: BrainContext,
) => void;

export class BrainPipeline {
  private readonly tasks: BrainTask[];

  constructor(tasks: BrainTask[]) {
    this.tasks = tasks;
  }

  async run(
    initialContext: BrainContext,
    onProgress?: BrainProgressCallback,
  ): Promise<BrainContext> {
    const totalTasks = this.tasks.length;

    for (let index = 0; index < totalTasks; index += 1) {
      const task = this.tasks[index];

      initialContext.currentTask = task.name;
      initialContext.progress = Math.round(
        (index / totalTasks) * 100,
      );

      onProgress?.({ ...initialContext });

      try {
        await task.execute(initialContext);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro desconhecido";

        initialContext.errors.push(
          `${task.name}: ${message}`,
        );
      }
    }

    initialContext.currentTask = "Análise concluída";
    initialContext.progress = 100;

    onProgress?.({ ...initialContext });

    return initialContext;
  }
}