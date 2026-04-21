import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { decompressFromEncodedURIComponent } from "lz-string";
import { TextField, Button, Box, Container, Typography } from "@mui/material";
import "./Oracle.css";

interface OracleAnswer {
    reply: string;
    quote: string;
    song: string;
}

const ORACLE_ANSWERS: OracleAnswer[] = [
    {
        reply: "Maxim rät, zünd den Reichstag an, weil subtiles Marketing einfach nichts bringt",
        quote: "Wir brauchen Promo, zünd den Reichstag an",
        song: "K.I.Z. Crew"
    },
    {
        reply: "Maxim empfiehlt, rauch noch eine, bevor du die Entscheidung triffst, die du sowieso schon kennst",
        quote: "Ich hab so Angst und ich rauch noch eine",
        song: "Abteilungsleiter der Liebe"
    },
    {
        reply: "Maxim schlägt vor, red mit deinem Auto, denn manchmal versteht dich dein Audi besser als die Menschen",
        quote: "Ich rede mit meinem Auto wie David Hasselhoff",
        song: "Abteilungsleiter der Liebe"
    },
    {
        reply: "Maxim besteht darauf, schein so hell, dass dir die Antwort auf deine Frage von selbst einleuchtet",
        quote: "Ich scheine so hell, noch viel mehr als ein Solarium",
        song: "Herbstzeitblätter"
    },
    {
        reply: "Maxim fordert auf, steck ne Blume in die AK, weil Frieden manchmal einfach die aggressivste Geste ist",
        quote: "Ich steck ne Blume in die AK",
        song: "Herbstzeitblätter"
    },
    {
        reply: "Maxim betont, plan jeden Move, denn wer nicht plant, der verliert – und zwar gründlich",
        quote: "Ich plane jeden Move wie ein Anschlag",
        song: "Herbstzeitblätter"
    },
    {
        reply: "Maxim rät, zünd ein Auto an um die Mieten zu senken, falls der Brief an den Vermieter mal wieder ignoriert wurde",
        quote: "Zünd' ich ein Auto an, um die Mieten zu senken!",
        song: "Selbstjustiz"
    },
    {
        reply: "Maxim mahnt, hol das Geld von der Bank, bevor irgendjemand anderes diese Idee für dich umsetzt",
        quote: "Bevor sie es verzocken – Holt das Geld von der Bank!",
        song: "Selbstjustiz"
    },
    {
        reply: "Maxim empfiehlt, puste Kokain vom Spülkasten, um endlich auf Augenhöhe mit der Politik zu diskutieren",
        quote: "Ich bin im Bundestagsklo und puste Kokain vom Spülkasten",
        song: "Selbstjustiz"
    },
    {
        reply: "Maxim fordert, zeig Ackermann an, auch wenn keiner rangeht, wenn du die 110 wählst",
        quote: "Ackermann, du Arschloch – Ich zeige dich an!",
        song: "Selbstjustiz"
    },
    {
        reply: "Maxim legt nahe, pump Wagner und krieg nen Steifen, denn klassische Bildung muss nicht langweilig sein",
        quote: "Ich pumpe Wagner und kriege 'n Steifen",
        song: "Einritt"
    },
    {
        reply: "Maxim besteht darauf, schrei fickt euch alle auf Esperanto, damit es wirklich jeder versteht",
        quote: "Ich trage Dauerwelle, nennt mich Rambo, und schrei: 'Fickt euch alle' auf Esperanto",
        song: "Einritt"
    },
    {
        reply: "Maxim schlägt vor, häng mit Schwaben Sachsen und Friesen, für ein vollständiges Bild der deutschen Seele",
        quote: "Ich häng mit Schwaben Sachsen und Friesen",
        song: "Biergarten Eden"
    },
    {
        reply: "Maxim erinnert daran, leb mit Barbaren, die tun, was die Bildzeitung ihnen sagt",
        quote: "Meine Vorfahren haben Wildschweine gejagt, jetzt leb' ich mit Barbaren",
        song: "Boom Boom Boom"
    },
    {
        reply: "Maxim empfiehlt, zeig den Kleinen Monopoly, weil die Zukunft zum Glück noch keine Ahnung hat",
        quote: "Ich zeig' den Kleinen Monopoly, doch sie verstehn's nicht",
        song: "Hurra die Welt geht unter"
    },
    {
        reply: "Maxim lädt ein, denk dir Namen für Sterne aus, denn die meisten wichtigen Dinge passieren sowieso nachts",
        quote: "Heut' Nacht denken wir uns Namen für Sterne aus",
        song: "Hurra die Welt geht unter"
    },
    {
        reply: "Maxim rät, winke mit dem Penis von der Straßenseite, als nonverbale Kommunikationsstrategie",
        quote: "Ich winke mit dem Penis, von der andern Straßenseite",
        song: "Mein Penis"
    },
];

const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const Oracle = () => {
    const [searchParams] = useSearchParams();
    const questionInputRef = useRef<HTMLInputElement>(null);

    const [answer, setAnswer] = useState<OracleAnswer | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const decodedName = (() => {
        const encoded = searchParams.get("name");
        if (encoded) {
            try {
                return decompressFromEncodedURIComponent(encoded);
            } catch {
                return "";
            }
        }
        return "";
    })();

    const getImagePosition = (): { backgroundPosition: string } => {
        if (isLoading) {
            return { backgroundPosition: "-1% 99%" }; // Bottom left loading
        }
        if (answer) {
            return { backgroundPosition: "100% 2%" }; // Top right success
        }
        return { backgroundPosition: "98% 97%" }; // Initial waiting
    };

    const askQuestion = async () => {
        const question = questionInputRef.current?.value || "";
        if (!question.trim()) return;

        setIsLoading(true);

        // Simulate thinking/loading for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        const nameToUse = decodedName || "anonymous";
        const combined = `${nameToUse}:${question}`;
        const hash = simpleHash(combined);
        const answerIndex = hash % ORACLE_ANSWERS.length;
        setAnswer(ORACLE_ANSWERS[answerIndex]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isLoading) {
            askQuestion();
        }
    };

    return (
        <>
            <Container maxWidth="sm" sx={{ py: 2, px: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <Typography className="oracle-title" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" } }}>
                        Was würde Maxim tun?
                    </Typography>

                    <Box
                        className={`oracle-avatar ${isLoading ? "loading" : ""}`}
                        sx={{
                            width: { xs: 180, sm: 220, md: 250 },
                            height: { xs: 180, sm: 220, md: 250 },
                            borderRadius: "50%",
                            overflow: "hidden",
                            backgroundImage: 'url(/assets/maxim.png)',
                            backgroundSize: "210% 210%",
                            backgroundPosition: getImagePosition().backgroundPosition,
                        }}
                    />

                    {!answer && (
                        <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, color: "rgba(255, 255, 255, 0.8)", textAlign: "center" }}>
                            {decodedName ? `Hallo ${decodedName}, frag Maxim 🥸` : "Frag Maxim 🥸"}
                        </Typography>
                    )}

                    {answer && (
                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center", mb: 1 }}>
                            <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1rem" }, fontWeight: "bold", width: "100%", textAlign: "center", color: "white" }}>
                                {answer.reply}
                            </Typography>
                            <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" }, color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
                                „{answer.quote}"
                            </Typography>
                            <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, color: "rgba(255, 255, 255, 0.5)", fontStyle: "italic" }}>
                                — {answer.song}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        label="Deine Frage"
                        type="text"
                        placeholder="Stelle deine Frage..."
                        inputRef={questionInputRef}
                        fullWidth
                        variant="outlined"
                        onChange={() => setAnswer(null)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        size="small"
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={askQuestion}
                        size="medium"
                        fullWidth
                        disabled={isLoading}
                    >
                        {isLoading ? "Maxim denkt..." : "Frag Maxim"}
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Oracle;
