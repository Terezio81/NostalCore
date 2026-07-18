import {
  Gamepad2,
  Heart,
  Library,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { ConsoleCollectionService } from "../../brain/collections/ConsoleCollectionService";

import { useNavigate } from "react-router-dom";

import type { ConsoleCollection } from "../../types/ConsoleCollection";
import type { LibraryGame } from "../../types/Game";

import "./Consoles.css";

export default function Consoles() {
  const [games, setGames] =
    useState<LibraryGame[]>([]);

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  async function loadLibrary() {
    try {
      setIsLoading(true);
      setError("");

      const result =
        await window.nostalcore.listGames();

      if (!result.success) {
        setError(
          result.error ??
            "Não foi possível carregar os consoles.",
        );

        return;
      }

      setGames(result.games);
    } catch (error) {
      console.error(
        "Erro ao carregar os consoles:",
        error,
      );

      setError(
        "Não foi possível carregar os consoles.",
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

  const consoles = useMemo<
    ConsoleCollection[]
  >(() => {
    return ConsoleCollectionService.build(
      games,
    );
  }, [games]);

  const filteredConsoles = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return consoles;
    }

    return consoles.filter((console) => {
      return console.name
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [consoles, search]);

  const totalFavorites = useMemo(() => {
    return consoles.reduce(
      (total, console) => {
        return (
          total + console.favoriteGames
        );
      },
      0,
    );
  }, [consoles]);

  if (isLoading) {
    return (
      <main className="consoles-page consoles-page--message">
        <Gamepad2 size={46} />

        <h1>Organizando sua coleção...</h1>

        <p>
          O NostalBrain está agrupando os
          jogos por console.
        </p>
      </main>
    );
  }

  function handleExploreConsole(
  consoleCollection: ConsoleCollection,
) {
  const consoleName = encodeURIComponent(
    consoleCollection.name,
  );

  navigate(
    `/biblioteca?console=${consoleName}`,
  );
}

  return (
    <main className="consoles-page">
      <header className="consoles-page__header">
        <div>
          <span className="consoles-page__eyebrow">
            Sua coleção
          </span>

          <h1>Consoles</h1>

          <p>
            Explore sua biblioteca organizada
            automaticamente por plataforma.
          </p>
        </div>

        <div className="consoles-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Pesquisar console..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </header>

      {error && (
        <div className="consoles-page__error">
          {error}
        </div>
      )}

      <section className="consoles-stats">
        <article>
          <Gamepad2 size={22} />

          <div>
            <strong>
              {consoles.length}
            </strong>

            <span>
              {consoles.length === 1
                ? "Console identificado"
                : "Consoles identificados"}
            </span>
          </div>
        </article>

        <article>
          <Library size={22} />

          <div>
            <strong>{games.length}</strong>

            <span>
              {games.length === 1
                ? "Jogo organizado"
                : "Jogos organizados"}
            </span>
          </div>
        </article>

        <article>
          <Heart size={22} />

          <div>
            <strong>
              {totalFavorites}
            </strong>

            <span>
              {totalFavorites === 1
                ? "Favorito encontrado"
                : "Favoritos encontrados"}
            </span>
          </div>
        </article>
      </section>

      {consoles.length === 0 ? (
        <section className="consoles-empty">
          <Gamepad2 size={48} />

          <h2>
            Nenhum console identificado
          </h2>

          <p>
            Importe jogos para que o
            NostalBrain organize sua coleção
            automaticamente.
          </p>
        </section>
      ) : filteredConsoles.length === 0 ? (
        <section className="consoles-empty">
          <Search size={42} />

          <h2>
            Nenhum console encontrado
          </h2>

          <p>
            Não encontramos uma plataforma
            com esse nome.
          </p>
        </section>
      ) : (
        <section className="consoles-grid">
          {filteredConsoles.map(
            (console) => (
              <article
                className="console-card"
                key={console.id}
              >
                <div
                  className="console-card__background"
                  style={
                    console.banner ||
                    console.cover
                      ? {
                          backgroundImage: `
                            linear-gradient(
                              90deg,
                              rgba(10, 10, 14, 0.96) 0%,
                              rgba(10, 10, 14, 0.74) 55%,
                              rgba(10, 10, 14, 0.32) 100%
                            ),
                            url("${
                              console.banner ??
                              console.cover
                            }")
                          `,
                        }
                      : undefined
                  }
                />

                <div className="console-card__content">
                  <span className="console-card__label">
                    Plataforma
                  </span>

                  <h2>{console.name}</h2>

                  <div className="console-card__stats">
                    <span>
                      <Library size={15} />

                      {console.totalGames}

                      {console.totalGames === 1
                        ? " jogo"
                        : " jogos"}
                    </span>

                    <span>
                      <Heart
                        size={15}
                        fill={
                          console.favoriteGames >
                          0
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {
                        console.favoriteGames
                      }

                      {console.favoriteGames ===
                      1
                        ? " favorito"
                        : " favoritos"}
                    </span>
                  </div>

                  {console.lastPlayedGame ? (
                    <p>
                      Último jogado:{" "}
                      <strong>
                        {
                          console
                            .lastPlayedGame
                            .title
                        }
                      </strong>
                    </p>
                  ) : (
                    <p>
                      Nenhum jogo aberto nesta
                      plataforma.
                    </p>
                  )}

                  <button
                  type="button"
                  onClick={() =>
                  handleExploreConsole(console)
                  }
                >
                Explorar console
                </button>
                </div>
              </article>
            ),
          )}
        </section>
      )}
    </main>
  );
}