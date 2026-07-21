import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  LibraryGame,
} from "../types/Game";

interface UseLibraryResult {
  games: LibraryGame[];
  isLoading: boolean;
  error: string;
  reloadLibrary: () => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const [games, setGames] =
    useState<LibraryGame[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const reloadLibrary =
    useCallback(async () => {
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
          "Erro ao carregar a biblioteca:",
          error,
        );

        setError(
          "Não foi possível carregar os dados da biblioteca.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    reloadLibrary();

    function handleLibraryUpdated() {
      reloadLibrary();
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
  }, [reloadLibrary]);

  return {
    games,
    isLoading,
    error,
    reloadLibrary,
  };
}