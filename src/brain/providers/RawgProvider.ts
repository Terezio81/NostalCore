import type { GameMetadata } from "../domain/GameMetadata";
import {
  hasCompatiblePlatform,
  rankRawgCandidates,
} from "../matching/RawgMatchEngine";

import {
  BaseProvider,
  type MetadataSearchInput,
} from "./BaseProvider";

const MINIMUM_MATCH_SCORE = 75;

function getReleaseYear(
  released: string | null,
): number | null {
  if (!released) {
    return null;
  }

  const year = Number(released.slice(0, 4));

  return Number.isFinite(year) ? year : null;
}

export class RawgProvider extends BaseProvider {
  readonly id = "rawg";
  readonly name = "RAWG";

  async searchMetadata(
    input: MetadataSearchInput,
  ): Promise<GameMetadata | null> {
    try {
      const searchResult =
        await window.nostalcore.searchRawgGame(
          input.title,
        );

      if (
        !searchResult.success ||
        searchResult.games.length === 0
      ) {
        console.warn(
          "RAWG não encontrou candidatos para:",
          input.title,
        );

        return null;
      }

      const rankedCandidates = rankRawgCandidates(
        input.title,
        input.consoleName,
        searchResult.games,
      );

      const strongCandidate = rankedCandidates.find(
  (candidate) =>
    candidate.score >= MINIMUM_MATCH_SCORE,
);

const compatibleCandidate = rankedCandidates.find(
  (candidate) =>
    candidate.score >= 55 &&
    hasCompatiblePlatform(
      input.consoleName,
      candidate.platforms,
    ),
);

const bestCandidate =
  strongCandidate ?? compatibleCandidate;

if (!bestCandidate) {
  console.warn(
    "Nenhum candidato seguro foi encontrado:",
    {
      searchedTitle: input.title,
      consoleName: input.consoleName,
      candidates: rankedCandidates.map(
        (candidate) => ({
          name: candidate.name,
          platforms: candidate.platforms,
          score: candidate.score,
          reasons: candidate.reasons,
        }),
      ),
    },
  );

  return null;
}

      console.log("Melhor candidato RAWG:", {
        name: bestCandidate.name,
        score: bestCandidate.score,
        reasons: bestCandidate.reasons,
      });

      const detailsResult =
        await window.nostalcore.getRawgGameDetails(
          bestCandidate.id,
        );

      if (!detailsResult.success) {
        console.warn(detailsResult.error);
        return null;
      }

      const details = detailsResult.game;

      const remoteCover =
  details.backgroundImage ?? "";

const remoteBanner =
  details.additionalImage ??
  details.backgroundImage ??
  "";

let cover = remoteCover;
let banner = remoteBanner;

if (remoteCover) {
  const coverResult =
    await window.nostalcore.cacheRemoteImage(
      remoteCover,
      "covers",
    );

  if (coverResult.success) {
    cover = coverResult.mediaUrl;
  } else {
    console.warn(
      "Não foi possível salvar a capa:",
      coverResult.error,
    );
  }
}

if (remoteBanner) {
  const bannerResult =
    await window.nostalcore.cacheRemoteImage(
      remoteBanner,
      "banners",
    );

  if (bannerResult.success) {
    banner = bannerResult.mediaUrl;
  } else {
    console.warn(
      "Não foi possível salvar o banner:",
      bannerResult.error,
    );
  }
}

      return {
        title: input.title,
        consoleName: input.consoleName,

        releaseYear: getReleaseYear(
          details.released,
        ),

        developer:
          details.developers[0] ?? null,

        publisher:
          details.publishers[0] ?? null,

        genres: [...details.genres],

        // A RAWG nem sempre fornece isso claramente.
        players: null,

        description: details.description,

        cover,
        banner,
      };
    } catch (error) {
      console.error(
        "Erro no RawgProvider:",
        error,
      );

      return null;
    }
  }
}