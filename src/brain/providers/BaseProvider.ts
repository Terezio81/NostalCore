import type { GameMetadata } from "../domain/GameMetadata";

export type MetadataSearchInput = {
  title: string;
  consoleName: string;
};

export abstract class BaseProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract searchMetadata(
    input: MetadataSearchInput,
  ): Promise<GameMetadata | null>;
}