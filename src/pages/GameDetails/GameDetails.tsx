import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Gamepad2,
  Heart,
  MapPin,
  Play,
  Users,
} from "lucide-react";

import {
  formatPlayTime,
} from "../../brain/utils/formatPlayTime";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  LibraryGame,
} from "../../types/Game";

import "./GameDetails.css";

export default function GameDetails() {
  const { gameId } = useParams<{
    gameId: string;
  }>();

  const navigate = useNavigate();

  const [game, setGame] =
    useState<LibraryGame | null>(null);

    const [isUpdatingFavorite, setIsUpdatingFavorite] =
  useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLaunching, setIsLaunching] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        setIsLoading(true);
        setError("");

        if (!gameId) {
          setError(
            "O jogo informado é inválido.",
          );

          return;
        }

        const result =
          await window.nostalcore.listGames();

        if (!result.success) {
          setError(
            result.error ??
              "Não foi possível carregar a biblioteca.",
          );

          return;
        }

        const selectedGame =
          result.games.find(
            (libraryGame) =>
              libraryGame.id === gameId,
          );

        if (!selectedGame) {
          setError(
            "Este jogo não foi encontrado na biblioteca.",
          );

          return;
        }

        setGame(selectedGame);
      } catch (error) {
        console.error(
          "Erro ao carregar jogo:",
          error,
        );

        setError(
          "Não foi possível carregar os detalhes do jogo.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [gameId]);

  async function handlePlayGame() {
    if (!game || isLaunching) {
      return;
    }

    try {
      setIsLaunching(true);
      setError("");

      const result =
        await window.nostalcore.launchGame(
          game.id,
        );

      if (!result.success) {
        setError(
          result.error ??
            "Não foi possível iniciar o jogo.",
        );
      }
    } catch (error) {
      console.error(
        "Erro ao iniciar jogo:",
        error,
      );

      setError(
        "Não foi possível iniciar o jogo.",
      );
    } finally {
      setIsLaunching(false);
    }
    
  }
  async function handleToggleFavorite() {
  if (!game || isUpdatingFavorite) {
    return;
  }

  try {
    setIsUpdatingFavorite(true);
    setError("");

    const result =
      await window.nostalcore.toggleFavorite(
        game.id,
      );

    if (!result.success) {
      setError(result.error);
      return;
    }

    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      return {
        ...currentGame,
        favorite:
          result.game.favorite,
      };
    });

    window.dispatchEvent(
      new CustomEvent(
        "nostalcore:library-updated",
      ),
    );
  } catch (error) {
    console.error(
      "Erro ao favoritar jogo:",
      error,
    );

    setError(
      "Não foi possível atualizar o favorito.",
    );
  } finally {
    setIsUpdatingFavorite(false);
  }
}

  if (isLoading) {
    return (
      <main className="game-details game-details--centered">
        <Gamepad2 size={42} />

        <h1>Carregando jogo...</h1>

        <p>
          O NostalCore está preparando os
          detalhes.
        </p>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="game-details game-details--centered">
        <Gamepad2 size={42} />

        <h1>Jogo não encontrado</h1>

        <p>
          {error ||
            "Este jogo não está mais na biblioteca."}
        </p>

        <button
          type="button"
          className="game-details__back-button"
          onClick={() =>
            navigate("/biblioteca")
          }
        >
          <ArrowLeft size={18} />
          Voltar para a biblioteca
        </button>
      </main>
    );
  }

  const bannerImage =
    game.banner || game.cover;

  return (
    <main className="game-details">
      <button
        type="button"
        className="game-details__back"
        onClick={() =>
          navigate("/biblioteca")
        }
      >
        <ArrowLeft size={18} />
        Voltar para a biblioteca
      </button>

      <section
        className="game-details__hero"
        style={
          bannerImage
            ? {
                backgroundImage: `
                  linear-gradient(
                    90deg,
                    rgba(12, 12, 15, 0.98) 0%,
                    rgba(12, 12, 15, 0.78) 48%,
                    rgba(12, 12, 15, 0.3) 100%
                  ),
                  url("${bannerImage}")
                `,
              }
            : undefined
        }
      >
        <div className="game-details__hero-content">
          <span className="game-details__eyebrow">
            Sua coleção retrô
          </span>

          <h1>{game.title}</h1>

          <div className="game-details__hero-meta">
            <span>{game.consoleName}</span>

            {game.releaseYear && (
              <>
                <span aria-hidden="true">
                  •
                </span>

                <span>
                  {game.releaseYear}
                </span>
              </>
            )}

            {game.region && (
              <>
                <span aria-hidden="true">
                  •
                </span>

                <span>{game.region}</span>
              </>
            )}
          </div>

          <div className="game-details__actions">
            <button
              type="button"
              className="game-details__play"
              disabled={isLaunching}
              onClick={handlePlayGame}
            >
              <Play
                size={19}
                fill="currentColor"
              />

              {isLaunching
                ? "Abrindo..."
                : "Jogar agora"}
            </button>

            <button
  type="button"
  className={`game-details__favorite ${
    game.favorite
      ? "game-details__favorite--active"
      : ""
  }`}
  disabled={isUpdatingFavorite}
  onClick={handleToggleFavorite}
>
  <Heart
    size={20}
    fill={
      game.favorite
        ? "currentColor"
        : "none"
    }
  />

  {isUpdatingFavorite
    ? "Salvando..."
    : game.favorite
      ? "Favoritado"
      : "Favoritar"}
</button>
          </div>
        </div>
      </section>

      {error && (
        <div className="game-details__error">
          {error}
        </div>
      )}

      <section className="game-details__content">
        <aside className="game-details__cover-column">
          <div className="game-details__cover">
            {game.cover ? (
              <img
                src={game.cover}
                alt={`Imagem de ${game.title}`}
              />
            ) : (
              <Gamepad2 size={56} />
            )}
          </div>

          <div className="game-details__quick-info">
            {game.releaseYear && (
              <div>
                <CalendarDays size={18} />

                <span>
                  <small>Lançamento</small>
                  <strong>
                    {game.releaseYear}
                  </strong>
                </span>
              </div>
            )}

            {game.region && (
              <div>
                <MapPin size={18} />

                <span>
                  <small>Região</small>
                  <strong>
                    {game.region}
                  </strong>
                </span>
              </div>
            )}

            <div>
  <Clock3 size={18} />

  <span>
    <small>Tempo jogado</small>

    <strong>
      {formatPlayTime(
        game.playTimeMinutes,
      )}
    </strong>
  </span>
</div>

            {game.players && (
              <div>
                <Users size={18} />

                <span>
                  <small>Jogadores</small>
                  <strong>
                    {game.players}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </aside>

        <div className="game-details__information">
          <section className="game-details__section">
            <span className="game-details__section-eyebrow">
              Sobre o jogo
            </span>

            <h2>{game.title}</h2>

            <p className="game-details__description">
              {game.description ||
                "Ainda não existe uma descrição disponível para este jogo."}
            </p>
          </section>

          <section className="game-details__metadata-grid">
            <article>
              <small>Console</small>
              <strong>
                {game.consoleName}
              </strong>
            </article>

            <article>
              <small>Desenvolvedora</small>
              <strong>
                {game.developer ||
                  "Não informada"}
              </strong>
            </article>

            <article>
              <small>Publicadora</small>
              <strong>
                {game.publisher ||
                  "Não informada"}
              </strong>
            </article>

            <article>
              <small>Região</small>
              <strong>
                {game.region ||
                  "Não informada"}
              </strong>
            </article>

            <article>
              <small>Revisão</small>
              <strong>
                {game.revision ||
                  "Versão original"}
              </strong>
            </article>

            <article>
              <small>Arquivo</small>
              <strong>
                {game.extension.toUpperCase()}
              </strong>
            </article>
          </section>

          {game.genres &&
            game.genres.length > 0 && (
              <section className="game-details__section">
                <span className="game-details__section-eyebrow">
                  Gêneros
                </span>

                <div className="game-details__tags">
                  {game.genres.map(
                    (genre) => (
                      <span key={genre}>
                        {genre}
                      </span>
                    ),
                  )}
                </div>
              </section>
            )}

          {game.languages &&
            game.languages.length > 0 && (
              <section className="game-details__section">
                <span className="game-details__section-eyebrow">
                  Idiomas identificados
                </span>

                <div className="game-details__tags">
                  {game.languages.map(
                    (language) => (
                      <span key={language}>
                        {language}
                      </span>
                    ),
                  )}
                </div>
              </section>
            )}
        </div>
      </section>
    </main>
  );
}