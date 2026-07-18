import type { GameMetadata } from "../domain/GameMetadata";

import {
  BaseProvider,
  type MetadataSearchInput,
} from "./BaseProvider";

export class FallbackProvider extends BaseProvider {
  readonly id = "fallback-provider";
  readonly name = "Provider Chain";

  private readonly providers: BaseProvider[];

  constructor(providers: BaseProvider[]) {
    super();

    this.providers = providers;
  }

  async searchMetadata(
    input: MetadataSearchInput,
  ): Promise<GameMetadata | null> {
    for (const provider of this.providers) {
      try {
        const metadata =
          await provider.searchMetadata(input);

        if (metadata) {
          console.log(
            `Metadados encontrados por: ${provider.name}`,
          );

          return metadata;
        }
      } catch (error) {
        console.error(
          `Falha no provider ${provider.name}:`,
          error,
        );
      }
    }

    console.warn(
      "Nenhum provider encontrou metadados para:",
      input.title,
    );

    return null;
  }
}