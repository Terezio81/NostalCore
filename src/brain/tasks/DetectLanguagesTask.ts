import type { BrainContext } from "../pipeline/BrainContext";
import { BrainTask } from "../pipeline/BrainTask";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  "pt-br": "Portuguese (Brazil)",
  ja: "Japanese",
  jp: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  nl: "Dutch",
  ru: "Russian",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
};

export class DetectLanguagesTask extends BrainTask {
  readonly name = "Detectando idiomas";

  async execute(
    context: BrainContext,
  ): Promise<void> {
    const fileName = context.game.fileName;

    const groups = fileName.match(/\(([^()]*)\)/g) ?? [];

    const detectedLanguages = new Set<string>();

    for (const group of groups) {
      const content = group
        .replace(/[()]/g, "")
        .trim();

      const codes = content.split(",");

      for (const code of codes) {
        const normalizedCode = code
          .trim()
          .toLowerCase();

        const language =
          LANGUAGE_NAMES[normalizedCode];

        if (language) {
          detectedLanguages.add(language);
        }
      }
    }

    context.game.languages = [
      ...detectedLanguages,
    ];
  }
}