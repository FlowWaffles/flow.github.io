import { useRef, useState, useEffect } from "react";
import { TextField, Button, Box, Container, Typography } from "@mui/material";
import "./EightBall.css";

type Stage = "intro" | "shaking" | "idle" | "loading" | "revealing" | "answered";

const EIGHT_BALL_ANSWERS = [
    { text: "Ja klar Digga", positive: true },
    { text: "Hundert Prozent", positive: true },
    { text: "Auf jeden Fall", positive: true },
    { text: "Läuft bei dir", positive: true },
    { text: "Kein Zweifel Bro", positive: true },
    { text: "Auf jeden", positive: true },
    { text: "Sicher wie Amen", positive: true },
    { text: "Ja Alter", positive: true },
    { text: "Natürlich Bruder", positive: true },
    { text: "Volles Programm", positive: true },
    { text: "Ohne Frage", positive: true },
    { text: "Frag nochmal", positive: null },
    { text: "Kommt drauf an", positive: null },
    { text: "Weiß ich nicht", positive: null },
    { text: "Später vielleicht", positive: null },
    { text: "Noch unklar Digga", positive: null },
    { text: "Nein Alter", positive: false },
    { text: "Vergiss es", positive: false },
    { text: "Auf keinen Fall", positive: false },
    { text: "Nicht dein Tag", positive: false },
    { text: "Kein Bock darauf", positive: false },
    { text: "Spitte erstmal par bars", positive: false },
];

const EightBall = () => {
    const [stage, setStage] = useState<Stage>("intro");
    const [answer, setAnswer] = useState<typeof EIGHT_BALL_ANSWERS[0] | null>(null);
    const [showText, setShowText] = useState(false);
    const questionInputRef = useRef<HTMLInputElement>(null);

    // On mount: play intro shake → reveal avatar
    useEffect(() => {
        const shakeTimer = setTimeout(() => setStage("shaking"), 600);
        const idleTimer = setTimeout(() => setStage("idle"), 2200);
        return () => {
            clearTimeout(shakeTimer);
            clearTimeout(idleTimer);
        };
    }, []);

    const askQuestion = async () => {
        const question = questionInputRef.current?.value || "";
        if (!question.trim() || stage === "loading" || stage === "shaking") return;

        setAnswer(null);
        setShowText(false);
        setStage("loading");

        await new Promise(resolve => setTimeout(resolve, 2200));

        const picked = EIGHT_BALL_ANSWERS[Math.floor(Math.random() * EIGHT_BALL_ANSWERS.length)];
        setAnswer(picked);
        setStage("revealing");

        setTimeout(() => {
            setShowText(true);
            setStage("answered");
        }, 800);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") askQuestion();
    };

    const handleInputChange = () => {
        if (stage === "answered" || stage === "revealing") {
            setAnswer(null);
            setShowText(false);
            setStage("idle");
        }
    };

    const isLoading = stage === "loading";
    const isIntro = stage === "intro" || stage === "shaking";
    const isShaking = stage === "shaking";

    return (
        <Container maxWidth="sm" sx={{ py: 2, px: 2, display: "flex", justifyContent: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", width: "100%" }}>
                <Typography
                    className="eightball-title"
                    sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "1.8rem", sm: "2.2rem" } }}
                >
                    Was würde Maxim sagen wenn er ein magischer 8-Ball wäre
                </Typography>

                <Box
                    className={`eightball-wrapper ${isShaking ? "shaking" : ""} ${isLoading ? "wobbling" : ""}`}
                    sx={{ width: { xs: 200, sm: 240, md: 270 }, height: { xs: 200, sm: 240, md: 270 }, position: "relative" }}
                >
                    <Box
                        className={`eightball-inner ${isIntro ? "intro-visible" : "avatar-visible"}`}
                        sx={{ position: "absolute", inset: "18%", borderRadius: "50%", overflow: "hidden" }}
                    >
                        <Box
                            className={`eightball-eight-face ${isIntro ? "visible" : "hidden"}`}
                            sx={{ position: "absolute", inset: 0, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <Typography sx={{ fontSize: "5rem", fontWeight: "bold", color: "#111", lineHeight: 1 }}>
                                8
                            </Typography>
                        </Box>
                        <Box sx={{
                            position: "absolute", inset: 0,
                            backgroundImage: "url(/assets/maxim.png)",
                            backgroundSize: "210% 210%",
                            backgroundPosition: "98% 97%",
                            opacity: (!isIntro && !isLoading && stage !== "revealing" && stage !== "answered")
                                || ((stage === "revealing" || stage === "answered") && answer?.positive === false) ? 1 : 0,
                        }} />
                        <Box sx={{
                            position: "absolute", inset: 0,
                            backgroundImage: "url(/assets/maxim.png)",
                            backgroundSize: "210% 210%",
                            backgroundPosition: "-1% 99%",
                            opacity: isLoading ? 1 : 0,
                        }} />
                        <Box sx={{
                            position: "absolute", inset: 0,
                            backgroundImage: "url(/assets/maxim.png)",
                            backgroundSize: "210% 210%",
                            backgroundPosition: "100% 2%",
                            opacity: (stage === "revealing" || stage === "answered") && answer?.positive !== false ? 1 : 0,
                        }} />

                        {answer && (
                            <Box
                                className={`eightball-answer-overlay ${showText ? "visible" : ""}`}
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    background: answer.positive === true
                                        ? "rgba(66, 220, 219, 0.65)"
                                        : answer.positive === false
                                            ? "rgba(226, 102, 199, 0.65)"
                                            : "rgba(20, 20, 60, 0.65)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0.25rem",
                                }}
                            >
                                <Typography sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    lineHeight: 1.3,
                                    maxWidth: "120px",
                                    wordBreak: "break-word",
                                    textShadow: "0 0 10px rgba(255,255,255,0.4)",
                                }}>
                                    {answer.text}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        component="img"
                        src="/assets/8ball.png"
                        alt=""
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            borderRadius: "50%",
                        }}
                    />
                </Box>

                <Typography sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" }, color: "rgba(255,255,255,0.7)", textAlign: "center", minHeight: "1.5em" }}>
                    {isLoading && "Maxim denkt…"}
                    {stage === "answered" && "Maxim hat gesprochen."}
                </Typography>

                <TextField
                    label="Deine Frage"
                    type="text"
                    placeholder="Werde ich…?"
                    inputRef={questionInputRef}
                    fullWidth
                    variant="outlined"
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || isIntro}
                    size="small"
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={askQuestion}
                    fullWidth
                    disabled={isLoading || isIntro}
                >
                    {isLoading ? "Maxim denkt…" : "Frag Maxim"}
                </Button>
            </Box>
        </Container>
    );
};

export default EightBall;

