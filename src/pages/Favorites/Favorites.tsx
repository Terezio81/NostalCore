import {
  Gamepad2,
  Heart,
  Play,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  LibraryGame,
} from "../../types/Game";

import "./Favorites.css";

export default function Favorites() {
  const navigate = useNavigate();

  const [games, setGames] =
    useState<LibraryGame[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadFavorites() {
    try {
      setIsLoading(true);
      setError("");

      const result =
        await window.nostalcore.listGames();

      if (!result.success) {
        setError(
          result.error ??
            "Não foi possível carregar os favoritos.",
        );

        return;
      }

      setGames(
        result.games.filter(
          (game) => game.favorite,
        ),
      );
    } catch (error) {
      console.error(
        "Erro ao carregar favoritos:",
        error,
      );

      setError(
        "Não foi possível carregar os favoritos.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();

    function handleLibraryUpdated() {
      loadFavorites();
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

  async function playGame(
    game: LibraryGame,
  ) {
    const result =
      await window.nostalcore.launchGame(
        game.id,
      );

    if (!result.success) {
      setError(result.error);
    }
  }

  if (isLoading) {
    return (
      <main className="favorites-page favorites-page--message">
        <Heart size={42} />
        <h1>Carregando favoritos...</h1>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      <header className="favorites-page__header">
        <span>Jogos especiais</span>
        <h1>Favoritos</h1>
        <p>
          {games.length}{" "}
          {games.length === 1
            ? "jogo favoritado"
            : "jogos favoritados"}
        </p>
      </header>

      {error && (
        <div className="favorites-page__error">
          {error}
        </div>
      )}

      {!error && games.length === 0 && (
        <section className="favorites-page--message">
          <Heart size={44} />

          <h2>Nenhum favorito ainda</h2>

          <p>
            Abra um jogo e clique em
            Favoritar para adicioná-lo aqui.
          </p>
        </section>
      )}

      {games.length > 0 && (
        <section className="favorites-page__grid">
          {games.map((game) => (
            <article
              className="favorite-game"
              key={game.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(`/jogo/${game.id}`)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  navigate(
                    `/jogo/${game.id}`,
                  );
                }
              }}
            >
              <div className="favorite-game__cover">
                {game.cover ? (
                  <img
                    src={game.cover}
                    alt={`Imagem de ${game.title}`}
                  />
                ) : (
                  <Gamepad2 size={46} />
                )}
              </div>

              <div className="favorite-game__information">
                <Heart
                  size={18}
                  fill="currentColor"
                />

                <h2>{game.title}</h2>

                <span>
                  {game.consoleName}
                  {game.releaseYear
                    ? ` • ${game.releaseYear}`
                    : ""}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    playGame(game);
                  }}
                >
                  <Play
                    size={16}
                    fill="currentColor"
                  />
                  Jogar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}