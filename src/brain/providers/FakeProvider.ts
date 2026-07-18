import type { GameMetadata } from "../domain/GameMetadata";

import {
  BaseProvider,
  type MetadataSearchInput,
} from "./BaseProvider";

const FAKE_DATABASE: GameMetadata[] = [
  {
    title: "Mega Man X",
    consoleName: "Super Nintendo",
    releaseYear: 1993,
    developer: "Capcom",
    publisher: "Capcom",
    genres: ["Action", "Platform"],
    players: 1,
    description:
      "Mega Man X é um jogo de ação e plataforma ambientado em um futuro dominado por robôs avançados.",
  cover: "",
banner: "",
  
    },
  {
    title: "Super Mario World",
    consoleName: "Super Nintendo",
    releaseYear: 1990,
    developer: "Nintendo EAD",
    publisher: "Nintendo",
    genres: ["Platform"],
    players: 2,
    description:
      "Mario e Luigi exploram Dinosaur Land em uma aventura de plataforma ao lado de Yoshi.",
 cover: "",
banner: "",
 
    },
  {
    title: "Donkey Kong Country",
    consoleName: "Super Nintendo",
    releaseYear: 1994,
    developer: "Rare",
    publisher: "Nintendo",
    genres: ["Platform"],
    players: 2,
    description:
      "Donkey Kong e Diddy Kong atravessam a Ilha DK para recuperar sua reserva de bananas.",
 cover: "",
banner: "",
 
    },
  {
  title: "Aladdin",
  consoleName: "Super Nintendo",
  releaseYear: 1993,
  developer: "Capcom",
  publisher: "Capcom",
  genres: ["Action", "Platform"],
  players: 1,
  description:
    "Aladdin é um jogo de ação e plataforma inspirado no filme da Disney, acompanhando sua aventura pelas ruas de Agrabah.",
cover: "",
banner: "",

  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export class FakeProvider extends BaseProvider {
  readonly id = "fake-provider";
  readonly name = "NostalBrain Local Database";

  async searchMetadata(
    input: MetadataSearchInput,
  ): Promise<GameMetadata | null> {
    const normalizedTitle = normalizeText(input.title);
    const normalizedConsole = normalizeText(
      input.consoleName,
    );

    const metadata = FAKE_DATABASE.find((game) => {
      return (
        normalizeText(game.title) === normalizedTitle &&
        normalizeText(game.consoleName) ===
          normalizedConsole
      );
    });

    return metadata ? { ...metadata } : null;
  }
}