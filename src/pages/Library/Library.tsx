import {
  FileQuestion,
  Gamepad2,
  Library as LibraryIcon,
  Search,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { LibraryGame } from "../../types/Game";
import "./Library.css";

export default function Library() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLibrary() {
    try {
      setIsLoading(true);
      setError("");

      const result = await window.nostalcore.listGames();

      if (!result.success) {
        setError(
          result.error ?? "Não foi possível carregar a biblioteca.",
        );

        return;
      }

      setGames(result.games);
    } catch (error) {
      console.error("Erro ao carregar biblioteca:", error);

      setError("Não foi possível carregar a biblioteca.");
    } finally {
      setIsLoading(false);
    }
  }
  async function playGame(game: LibraryGame) {
  try {
    setError("");

    const result =
      await window.nostalcore.launchGame(game.id);

    if (!result.success) {
      setError(result.error);
    }
  } catch (error) {
    console.error("Erro ao iniciar jogo:", error);

    setError("Não foi possível iniciar o jogo.");
  }
}
  

  useEffect(() => {
    loadLibrary();

    function handleLibraryUpdated() {
      loadLibrary();
    }

    window.addEventListener(
      "nostalcore:library-updated",
      handleLibraryUpdated,
    );

    return () => {
      window.removeEventListener(
        "nostalcore:library-updated",
        handleLibraryUpdated,
      );
    };
  }, []);

  const filteredGames = games.filter((game) => {
    const normalizedSearch = search.toLowerCase().trim();

    return (
      game.title.toLowerCase().includes(normalizedSearch) ||
      game.consoleName.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="library-page">
      <header className="library-page__header">
        <div>
          <span className="library-page__eyebrow">
            Sua coleção
          </span>

          <h1>Biblioteca</h1>

          <p>
            {games.length}{" "}
            {games.length === 1
              ? "jogo adicionado"
              : "jogos adicionados"}
          </p>
        </div>

        <label className="library-page__search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Pesquisar na biblioteca..."
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </label>
      </header>

      {isLoading && (
        <div className="library-page__message">
          <LibraryIcon size={34} />
          <h2>Carregando biblioteca...</h2>
        </div>
      )}

      {!isLoading && error && (
        <div className="library-page__message">
          <FileQuestion size={34} />
          <h2>Algo deu errado</h2>
          <p>{error}</p>

          <button type="button" onClick={loadLibrary}>
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && games.length === 0 && (
        <div className="library-page__message">
          <Gamepad2 size={40} />

          <h2>Sua biblioteca está vazia</h2>

          <p>
            Volte ao Início e importe seu primeiro jogo.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        games.length > 0 &&
        filteredGames.length === 0 && (
          <div className="library-page__message">
            <Search size={36} />

            <h2>Nenhum jogo encontrado</h2>

            <p>
              Experimente pesquisar por outro nome ou console.
            </p>
          </div>
        )}

      {!isLoading && !error && filteredGames.length > 0 && (
        <section className="library-page__grid">
          {filteredGames.map((game) => (
            <article
              className="library-game"
              key={game.id}
            >
              <div className="library-game__cover">
                {game.cover ? (
                  <img
                    src={game.cover}
                    alt={`Capa de ${game.title}`}
                  />
                ) : (
                  <Gamepad2 size={46} />
                )}
              </div>

              <div className="library-game__information">
  <h2>{game.title}</h2>

  <span>{game.consoleName}</span>

  {game.region && (
  <small className="library-game__region">
    Região: {game.region}
    {game.languages &&
  game.languages.length > 0 && (
    <small className="library-game__languages">
      Idiomas: {game.languages.join(", ")}
    </small>
  )}
  {game.revision && (
  <small className="library-game__revision">
    Revisão: {game.revision}
  </small>
)}
{game.releaseYear && (
  <small className="library-game__metadata">
    Ano: {game.releaseYear}
  </small>
)}

{game.developer && (
  <small className="library-game__metadata">
    Desenvolvedora: {game.developer}
  </small>
)}

{game.publisher && (
  <small className="library-game__metadata">
    Publicadora: {game.publisher}
  </small>
)}

{game.genres && game.genres.length > 0 && (
  <small className="library-game__metadata">
    Gêneros: {game.genres.join(", ")}
  </small>
)}

{game.players && (
  <small className="library-game__metadata">
    Jogadores: {game.players}
  </small>
)}
  </small>
)}

  <small>{game.extension}</small>

  {game.lastPlayedAt && (
  <small className="library-game__last-played">
    Última vez:{" "}
    {new Date(game.lastPlayedAt).toLocaleString("pt-BR")}
  </small>
)}

{game.playCount > 0 && (
  <small className="library-game__play-count">
    Aberto {game.playCount}{" "}
    {game.playCount === 1 ? "vez" : "vezes"}
  </small>
)}

  <button
    className="play-button"
    type="button"
    onClick={() => playGame(game)}
  >
    ▶ Jogar
  </button>
</div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}