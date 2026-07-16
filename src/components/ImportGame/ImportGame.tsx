import { CheckCircle2, FileUp, Gamepad2, X } from "lucide-react";
import { useState } from "react";
import { nostalBrain } from "../../brain/NostalBrain";
import "./ImportGame.css";

type ImportedGame = {
  title: string;
  fileName: string;
  filePath: string;
  extension: string;
  consoleName: string;
};

export default function ImportGame() {
  const [game, setGame] = useState<ImportedGame | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [brainStatus, setBrainStatus] = useState("");

  async function handleImportGame() {
  try {
    setIsImporting(true);
    setError("");
    setSuccessMessage("");
    setBrainStatus("Aguardando arquivo...");

    const selectionResult =
      await window.nostalcore.selectGame();

    if (selectionResult.canceled) {
      setBrainStatus("");
      return;
    }

    setBrainStatus("Analisando nome do jogo...");

    const analyzedGame = await nostalBrain.analyze(
  {
    ...selectionResult.game,
    region: null,
    languages: [],
    revision: null,
    
    releaseYear: null,
   developer: null,
   publisher: null,
   genres: [],
   players: null,
    description: "",
  },
  (context) => {
    setBrainStatus(
      `${context.currentTask} — ${context.progress}%`,
    );
  },
);

    setGame(analyzedGame);

    setBrainStatus("Salvando na biblioteca...");

    const saveResult = await window.nostalcore.addGame(
      analyzedGame,
    );

    if (!saveResult.success) {
      setError(saveResult.error);
      setBrainStatus("Não foi possível concluir.");
      return;
    }

    setSuccessMessage(
      `${saveResult.game.title} foi adicionado à biblioteca!`,
    );

    setBrainStatus("Tudo pronto.");

    window.dispatchEvent(
      new CustomEvent("nostalcore:library-updated"),
    );
  } catch (error) {
    console.error("Erro ao importar jogo:", error);

    setError(
      "Não foi possível importar o jogo. Tente novamente.",
    );

    setBrainStatus("Ocorreu um erro.");
  } finally {
    setIsImporting(false);
  }
}

  function handleClearGame() {
    setGame(null);
    setError("");
  }

  return (
    <section className="import-game">
      <div className="import-game__content">
        <div className="import-game__icon">
          <FileUp size={28} />
        </div>

        <div>
          <span className="import-game__eyebrow">
            Biblioteca inteligente
          </span>

          <h2>Adicione um jogo à sua coleção</h2>

          <p>
            Escolha um arquivo e o NostalCore tentará identificar
            automaticamente o console.
          </p>
        </div>
      </div>
{brainStatus && (
  <div className="import-game__brain-status">
    <span className="import-game__brain-dot" />

    <div>
      <strong>NostalBrain</strong>
      <span>{brainStatus}</span>
    </div>
  </div>
)}
      <button
        className="import-game__button"
        type="button"
        disabled={isImporting}
        onClick={handleImportGame}
      >
        <FileUp size={19} />

        {isImporting ? "Abrindo..." : "Importar jogo"}
      </button>
{successMessage && (
  <div className="import-game__success">
    <CheckCircle2 size={18} />
    <span>{successMessage}</span>
  </div>
)}
      {error && (
        <div className="import-game__error">
          <span>{error}</span>
        </div>
      )}

      {game && (
        <article className="import-result">
          <div className="import-result__status">
            <CheckCircle2 size={22} />

            <span>Arquivo recebido com sucesso</span>
          </div>

          <div className="import-result__game">
            <div className="import-result__game-icon">
              <Gamepad2 size={25} />
            </div>

            <div className="import-result__information">
              <strong>{game.title}</strong>

              <span>{game.consoleName}</span>

              <small>{game.fileName}</small>
            </div>

            <button
              className="import-result__close"
              type="button"
              aria-label="Remover resultado"
              onClick={handleClearGame}
            >
              <X size={18} />
            </button>
          </div>
        </article>
      )}
    </section>
  );
}