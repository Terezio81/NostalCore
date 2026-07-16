import { ROM_EXTENSIONS } from "../utils/Extensions";

export function cleanGameName(fileName: string): string {

    let name = fileName;

    // Remove extensão

    const extensionRegex = new RegExp(

        `\\.(${ROM_EXTENSIONS.join("|")})$`,

        "i"

    );

    name = name.replace(extensionRegex, "");

    // Remove (USA)

    name = name.replace(/\([^)]*\)/g, " ");

    // Remove [!]

    name = name.replace(/\[[^\]]*\]/g, " ");

    // Remove { }

    name = name.replace(/\{[^}]*\}/g, " ");

    // Troca _ por espaço

    name = name.replace(/_/g, " ");

    // Troca - por espaço

    name = name.replace(/-/g, " ");

    // Remove espaços duplicados

    name = name.replace(/\s+/g, " ");

    return name.trim();

}