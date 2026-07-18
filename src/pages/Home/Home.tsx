import {
  Clock3,
  Gamepad2,
  Heart,
  Library,
  Play,
  Search,
  Star,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import ImportGame from "../../components/ImportGame/ImportGame";
import type { LibraryGame } from "../../types/Game";

import "./Home.css";

function formatPlayTime(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return "Ainda não jogado";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min jogados`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h jogadas`;
  }

  return `${hours}h ${remainingMinutes}min jogados`;
}

function formatLastPlayed(
  lastPlayedAt: string | null,
): string {
  if (!lastPlayedAt) {
    return "Você ainda não iniciou este jogo.";
  }

  const date = new Date(lastPlayedAt);

  if (Number.isNaN(date.getTime())) {
    return "Última sessão registrada.";
  }

  return `Última sessão em ${date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  )}`;
}

export default function Home() {
  const navigate = useNavigate();

  const [games, setGames] =
    useState<LibraryGame[]>([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] =
    useState(true);

  const [isLaunching, setIsLaunching] =
    useState(false);

  const [error, setError] = useState("");

  async function loadLibrary() {
    try {
      setIsLoading(true);
      setError("");

      const result =
        await window.nostalcore.listGames();

      if (!result.success) {
        setError(
          result.error ??
            "Não foi possível carregar a biblioteca.",
        );

        return;
      }

      setGames(result.games);
    } catch (error) {
      console.error(
        "Erro ao carregar a Home:",
        error,
      );

      setError(
        "Não foi possível carregar os dados da biblioteca.",
      );
    } finally {
      setIsLoading(false);
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

  const uniqueConsoleCount = useMemo(() => {
    return new Set(
      games
        .map((game) => game.consoleName)
        .filter(Boolean),
    ).size;
  }, [games]);

  const favoriteCount = useMemo(() => {
    return games.filter(
      (game) => game.favorite,
    ).length;
  }, [games]);

  const continueGame = useMemo(() => {
    return [...games]
      .filter((game) => game.lastPlayedAt)
      .sort((first, second) => {
        const firstTime = new Date(
          first.lastPlayedAt ?? 0,
        ).getTime();

        const secondTime = new Date(
          second.lastPlayedAt ?? 0,
        ).getTime();

        return secondTime - firstTime;
      })[0] ?? null;
  }, [games]);

  const recentGames = useMemo(() => {
    return [...games]
      .sort((first, second) => {
        const firstTime = new Date(
          first.importedAt,
        ).getTime();

        const secondTime = new Date(
          second.importedAt,
        ).getTime();

        return secondTime - firstTime;
      })
      .slice(0, 4);
  }, [games]);

  const searchResults = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return games
      .filter((game) => {
        return (
          game.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          game.consoleName
            .toLowerCase()
            .includes(normalizedSearch)
        );
      })
      .slice(0, 6);
  }, [games, search]);

  async function handlePlayGame(
    game: LibraryGame,
  ) {
    if (isLaunching) {
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

        return;
      }

      await loadLibrary();

      window.dispatchEvent(
        new CustomEvent(
          "nostalcore:library-updated",
        ),
      );
    } catch (error) {
      console.error(
        "Erro ao iniciar jogo pela Home:",
        error,
      );

      setError(
        "Não foi possível iniciar o jogo.",
      );
    } finally {
      setIsLaunching(false);
    }
  }

  if (isLoading) {
    return (
      <main className="home-page home-page--message">
        <Gamepad2 size={44} />

        <h1>Preparando sua coleção...</h1>

        <p>
          O NostalCore está carregando seus
          jogos.
        </p>
      </main>
    );
  }

  return (
    <main className="home-page">
      <header className="home-page__header">
        <div>
          <span className="home-page__eyebrow">
            Sua coleção retrô
          </span>

          <h1>Boa noite, Matheus.</h1>

          <p>
            {games.length > 0
              ? "Pronto para aproveitar mais um clássico?"
              : "Importe seu primeiro jogo e comece sua coleção."}
          </p>
        </div>

        <div className="home-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Pesquisar jogos..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search.trim() &&
            searchResults.length > 0 && (
              <div className="home-search__results">
                {searchResults.map((game) => (
                  <button
                    type="button"
                    key={game.id}
                    onClick={() =>
                      navigate(
                        `/jogo/${game.id}`,
                      )
                    }
                  >
                    <div>
                      {game.cover ? (
                        <img
                          src={game.cover}
                          alt=""
                        />
                      ) : (
                        <Gamepad2 size={20} />
                      )}
                    </div>

                    <span>
                      <strong>
                        {game.title}
                      </strong>

                      <small>
                        {game.consoleName}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}

          {search.trim() &&
            searchResults.length === 0 && (
              <div className="home-search__empty">
                Nenhum jogo encontrado.
              </div>
            )}
        </div>
      </header>

      <ImportGame />

      {error && (
        <div className="home-page__error">
          {error}
        </div>
      )}

      {continueGame ? (
        <section
          className="home-continue"
          style={
            continueGame.banner ||
            continueGame.cover
              ? {
                  backgroundImage: `
                    linear-gradient(
                      90deg,
                      rgba(10, 10, 13, 0.98) 0%,
                      rgba(10, 10, 13, 0.76) 48%,
                      rgba(10, 10, 13, 0.22) 100%
                    ),
                    url("${
                      continueGame.banner ||
                      continueGame.cover
                    }")
                  `,
                }
              : undefined
          }
        >
          <div className="home-continue__content">
            <span>
              <Clock3 size={16} />
              Continue jogando
            </span>

            <h2>{continueGame.title}</h2>

            <p>
              {formatLastPlayed(
                continueGame.lastPlayedAt,
              )}
            </p>

            <div className="home-continue__tags">
              <span>
                {continueGame.consoleName}
              </span>

              <span>
                {formatPlayTime(
                  continueGame.playTimeMinutes,
                )}
              </span>
            </div>

            <div className="home-continue__actions">
              <button
                type="button"
                disabled={isLaunching}
                onClick={() =>
                  handlePlayGame(continueGame)
                }
              >
                <Play
                  size={18}
                  fill="currentColor"
                />

                {isLaunching
                  ? "Abrindo..."
                  : "Continuar"}
              </button>

              <button
                type="button"
                className="home-continue__details"
                onClick={() =>
                  navigate(
                    `/jogo/${continueGame.id}`,
                  )
                }
              >
                Ver detalhes
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="home-continue home-continue--empty">
          <Gamepad2 size={42} />

          <div>
            <span>Continue jogando</span>

            <h2>Sua próxima aventura começa aqui</h2>

            <p>
              Abra um jogo da Biblioteca e ele
              aparecerá neste espaço.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/biblioteca")
            }
          >
            Ver biblioteca
          </button>
        </section>
      )}

      <section className="home-stats">
        <article>
          <Library size={22} />

          <div>
            <strong>{games.length}</strong>

            <span>
              {games.length === 1
                ? "Jogo na biblioteca"
                : "Jogos na biblioteca"}
            </span>
          </div>
        </article>

        <article>
          <Gamepad2 size={22} />

          <div>
            <strong>
              {uniqueConsoleCount}
            </strong>

            <span>
              {uniqueConsoleCount === 1
                ? "Console cadastrado"
                : "Consoles cadastrados"}
            </span>
          </div>
        </article>

        <article>
          <Star size={22} />

          <div>
            <strong>{favoriteCount}</strong>

            <span>
              {favoriteCount === 1
                ? "Jogo favorito"
                : "Jogos favoritos"}
            </span>
          </div>
        </article>
      </section>

      <section className="home-recent">
        <header>
          <div>
            <span className="home-page__eyebrow">
              Biblioteca
            </span>

            <h2>
              Adicionados recentemente
            </h2>
          </div>

          {games.length > 4 && (
            <button
              type="button"
              onClick={() =>
                navigate("/biblioteca")
              }
            >
              Ver todos
            </button>
          )}
        </header>

        {recentGames.length === 0 ? (
          <div className="home-recent__empty">
            <Gamepad2 size={38} />

            <h3>
              Sua biblioteca está vazia
            </h3>

            <p>
              Use o botão de importação acima
              para adicionar seu primeiro jogo.
            </p>
          </div>
        ) : (
          <div className="home-recent__grid">
            {recentGames.map((game) => (
              <article
                className="home-game"
                key={game.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(
                    `/jogo/${game.id}`,
                  )
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
                <div className="home-game__cover">
                  {game.cover ? (
                    <img
                      src={game.cover}
                      alt={`Imagem de ${game.title}`}
                    />
                  ) : (
                    <Gamepad2 size={38} />
                  )}

                  {game.favorite && (
                    <Heart
                      size={18}
                      fill="currentColor"
                    />
                  )}
                </div>

                <div className="home-game__information">
                  <h3>{game.title}</h3>

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

                      handlePlayGame(game);
                    }}
                  >
                    <Play
                      size={15}
                      fill="currentColor"
                    />

                    Jogar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}