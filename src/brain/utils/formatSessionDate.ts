export function formatSessionDate(
    date: string,
): string {
    const sessionDate = new Date(date);
    const now = new Date();

    const sameDay =
        sessionDate.toDateString() ===
        now.toDateString();

    if (sameDay) {
        return `Hoje • ${sessionDate.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
            },
        )}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (
        sessionDate.toDateString() ===
        yesterday.toDateString()
    ) {
        return `Ontem • ${sessionDate.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
            },
        )}`;
    }

    return sessionDate.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}