import {
  CheckCircle2,
  Cpu,
  FolderOpen,
  Gamepad2,
} from "lucide-react";

import { useEffect, useState } from "react";

import "./Settings.css";

type EmulatorConfiguration = {
  executablePath: string;
  configuredAt: string;
};

export default function Settings() {
  const [snesEmulator, setSnesEmulator] =
    useState<EmulatorConfiguration | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState("");

  async function loadEmulatorSettings() {
    try {
      setIsLoading(true);
      setError("");

      const result =
        await window.nostalcore.getEmulatorSettings();

      if (!result.success) {
        setError(
          result.error ??
            "Não foi possível carregar as configurações.",
        );

        return;
      }

      setSnesEmulator(result.emulators.snes9x ?? null);
    } catch (error) {
      console.error(
        "Erro ao carregar emuladores:",
        error,
      );

      setError(
        "Não foi possível carregar as configurações.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectSnes9x() {
    try {
      setIsSelecting(true);
      setError("");

      const result =
        await window.nostalcore.selectEmulator("snes9x");

      if (result.canceled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSnesEmulator({
        executablePath: result.executablePath,
        configuredAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Erro ao selecionar emulador:",
        error,
      );

      setError("Não foi possível selecionar o emulador.");
    } finally {
      setIsSelecting(false);
    }
  }

  useEffect(() => {
    loadEmulatorSettings();
  }, []);

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <span>Preferências do sistema</span>

        <h1>Configurações</h1>

        <p>
          Configure os programas usados para executar seus
          jogos.
        </p>
      </header>

      <section className="settings-section">
        <div className="settings-section__title">
          <Cpu size={22} />

          <div>
            <h2>Emuladores</h2>
            <p>
              Escolha o emulador utilizado por cada console.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="settings-loading">
            Carregando configurações...
          </div>
        ) : (
          <article className="emulator-card">
            <div className="emulator-card__icon">
              <Gamepad2 size={28} />
            </div>

            <div className="emulator-card__information">
              <span>Nintendo</span>

              <h3>Super Nintendo</h3>

              <strong>Snes9x</strong>

              {snesEmulator ? (
                <div className="emulator-card__configured">
                  <CheckCircle2 size={16} />

                  <div>
                    <span>Emulador configurado</span>

                    <small>
                      {snesEmulator.executablePath}
                    </small>
                  </div>
                </div>
              ) : (
                <p>Nenhum emulador configurado.</p>
              )}
            </div>

            <button
              type="button"
              disabled={isSelecting}
              onClick={handleSelectSnes9x}
            >
              <FolderOpen size={18} />

              {isSelecting
                ? "Abrindo..."
                : snesEmulator
                  ? "Alterar"
                  : "Localizar emulador"}
            </button>
          </article>
        )}

        {error && (
          <div className="settings-error">{error}</div>
        )}
      </section>
    </div>
  );
}