import {
  FileQuestion,
  Gamepad2,
  Heart,
  Library as LibraryIcon,
  Play,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import type { LibraryGame } from "../../types/Game";
import "./Library.css";


export default function Library() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
  useSearchParams();

const selectedConsole =
  searchParams.get("console");

  const [selectedGameIds, setSelectedGameIds] =
  useState<string[]>([]);

const [isDeleting, setIsDeleting] =
  useState(false);

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
  function toggleGameSelection(gameId: string) {
  setSelectedGameIds((currentIds) => {
    if (currentIds.includes(gameId)) {
      return currentIds.filter(
        (selectedId) => selectedId !== gameId,
      );
    }

    return [...currentIds, gameId];
  });
}

function selectAllVisibleGames() {
  const visibleGameIds = filteredGames.map(
    (game) => game.id,
  );

  const allVisibleAreSelected =
    visibleGameIds.length > 0 &&
    visibleGameIds.every((gameId) =>
      selectedGameIds.includes(gameId),
    );

  if (allVisibleAreSelected) {
    setSelectedGameIds((currentIds) =>
      currentIds.filter(
        (gameId) =>
          !visibleGameIds.includes(gameId),
      ),
    );

    return;
  }

  setSelectedGameIds((currentIds) => [
    ...new Set([
      ...currentIds,
      ...visibleGameIds,
    ]),
  ]);
}

async function handleDeleteSelectedGames() {
  if (selectedGameIds.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    `Remover ${selectedGameIds.length} ${
      selectedGameIds.length === 1
        ? "jogo"
        : "jogos"
    } da biblioteca?\n\nOs arquivos originais não serão apagados.`,
  );

  if (!confirmed) {
    return;
  }

  try {
    setIsDeleting(true);
    setError("");

    const result =
      await window.nostalcore.deleteGames(
        selectedGameIds,
      );

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSelectedGameIds([]);
    await loadLibrary();
  } catch (error) {
    console.error(
      "Erro ao excluir jogos:",
      error,
    );

    setError(
      "Não foi possível excluir os jogos selecionados.",
    );
  } finally {
    setIsDeleting(false);
  }
}

async function handleClearLibrary() {
  if (games.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    `Remover todos os ${games.length} jogos da biblioteca?\n\nOs arquivos originais não serão apagados.`,
  );

  if (!confirmed) {
    return;
  }

  const finalConfirmation = window.confirm(
    "Esta ação limpará toda a biblioteca. Deseja realmente continuar?",
  );

  if (!finalConfirmation) {
    return;
  }

  try {
    setIsDeleting(true);
    setError("");

    const result =
      await window.nostalcore.clearLibrary();

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSelectedGameIds([]);
    await loadLibrary();
  } catch (error) {
    console.error(
      "Erro ao limpar biblioteca:",
      error,
    );

    setError(
      "Não foi possível limpar a biblioteca.",
    );
  } finally {
    setIsDeleting(false);
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

  const filteredGames = useMemo(() => {
  const normalizedSearch =
    search.trim().toLowerCase();

  return games.filter((game) => {
    const matchesSearch =
      !normalizedSearch ||
      game.title
        .toLowerCase()
        .includes(normalizedSearch) ||
      game.consoleName
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesConsole =
      !selectedConsole ||
      game.consoleName === selectedConsole;

    return (
      matchesSearch &&
      matchesConsole
    );
  });
}, [
  games,
  search,
  selectedConsole,
]);

  return (
    <div className="library-page">
      <header className="library-page__header">
        <div className="library-toolbar">
  <div className="library-toolbar__selection">
    <button
      type="button"
      className="library-toolbar__secondary"
      disabled={
        isDeleting ||
        filteredGames.length === 0
      }
      onClick={selectAllVisibleGames}
    >
      {filteredGames.length > 0 &&
      filteredGames.every((game) =>
        selectedGameIds.includes(game.id),
      )
        ? "Desmarcar todos"
        : "Selecionar todos"}
    </button>

    <span>
      {selectedGameIds.length}{" "}
      {selectedGameIds.length === 1
        ? "selecionado"
        : "selecionados"}
    </span>
  </div>

  <div className="library-toolbar__actions">
    <button
      type="button"
      className="library-toolbar__delete"
      disabled={
        isDeleting ||
        selectedGameIds.length === 0
      }
      onClick={handleDeleteSelectedGames}
    >
      {isDeleting
        ? "Excluindo..."
        : "Excluir selecionados"}
    </button>

    <button
      type="button"
      className="library-toolbar__clear"
      disabled={
        isDeleting ||
        games.length === 0
      }
      onClick={handleClearLibrary}
    >
      Limpar biblioteca
    </button>
  </div>
</div>
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

{selectedConsole && (
        <section className="library-console-filter">
          <div>
            <span>Console selecionado</span>

            <strong>{selectedConsole}</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextParams =
                new URLSearchParams(searchParams);

              nextParams.delete("console");

              setSearchParams(nextParams);
            }}
          >
            Mostrar todos
          </button>
        </section>
      )}

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
  className={`library-game ${
    selectedGameIds.includes(game.id)
      ? "library-game--selected"
      : ""
  }`}
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
      navigate(`/jogo/${game.id}`);
    }
  }}
>
  <label
  className="library-game__selector"
  title="Selecionar jogo"
  onClick={(event) =>
  event.stopPropagation()
}
>
  <input
    type="checkbox"
    checked={selectedGameIds.includes(
      game.id,
    )}
    onClick={(event) =>
  event.stopPropagation()
}
    onChange={() =>
      toggleGameSelection(game.id)
    }
  />

  <span aria-hidden="true" />
</label>
              <div className="library-game__cover">
  {game.cover ? (
    <img
      src={game.cover}
      alt={`Imagem de ${game.title}`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display =
          "none";
      }}
    />
  ) : (
    <Gamepad2 size={46} />
  )}
</div>

              <div className="library-game__information">
  <div className="library-game__heading">
    <div>
      <h2>{game.title}</h2>

      <span>
        {game.consoleName}

        {game.releaseYear
          ? ` • ${game.releaseYear}`
          : ""}
      </span>
    </div>

    {game.favorite && (
      <Heart
        className="library-game__favorite-icon"
        size={18}
        fill="currentColor"
        aria-label="Jogo favoritado"
      />
    )}
  </div>

  <button
    type="button"
    className="library-game__play"
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
    </div>
  );
}