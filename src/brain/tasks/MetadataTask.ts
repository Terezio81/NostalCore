import type { BrainContext } from "../pipeline/BrainContext";
import { BrainTask } from "../pipeline/BrainTask";
import type { BaseProvider } from "../providers/BaseProvider";

export class MetadataTask extends BrainTask {
  readonly name = "Buscando metadados";

  private readonly provider: BaseProvider;

  constructor(provider: BaseProvider) {
    super();

    this.provider = provider;
  }

  async execute(
    context: BrainContext,
  ): Promise<void> {
    const metadata =
      await this.provider.searchMetadata({
        title: context.game.title,
        consoleName: context.game.consoleName,
      });

    if (!metadata) {
      return;
    }

    context.game.releaseYear = metadata.releaseYear;
    context.game.developer = metadata.developer;
    context.game.publisher = metadata.publisher;
    context.game.genres = [...metadata.genres];
    context.game.players = metadata.players;
    context.game.description = metadata.description;
    context.game.cover = metadata.cover;
    context.game.banner = metadata.banner;
  }
}