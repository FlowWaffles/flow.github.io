import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/header/Header";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { TextField, Button, Box, Container, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const ShareOracle = () => {
    const [searchParams] = useSearchParams();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const resultInputRef = useRef<HTMLInputElement>(null);

    const [resultUrl, setResultUrl] = useState("");
    const [copied, setCopied] = useState(false);

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

    const generateLink = async () => {
        const name = nameInputRef.current?.value || "";

        const encodedName = compressToEncodedURIComponent(name);

        const url = new URL("/wwmt", window.location.origin);
        url.searchParams.append("name", encodedName);

        const finalUrl = url.toString();
        setResultUrl(finalUrl);

        try {
            await navigator.clipboard.writeText(finalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <>
            <Header />

            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {decodedName && (
                        <Alert severity="info">Welcome, Oracle Master {decodedName}!</Alert>
                    )}

                    <TextField
                        label="Your Name"
                        type="text"
                        placeholder="Enter your name"
                        inputRef={nameInputRef}
                        fullWidth
                        variant="outlined"
                        defaultValue={decodedName}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={generateLink}
                        endIcon={<ContentCopyIcon />}
                        size="large"
                        fullWidth
                    >
                        Share Oracle
                    </Button>

                    {copied && (
                        <Alert severity="success">Link copied to clipboard!</Alert>
                    )}

                    {resultUrl && (
                        <TextField
                            label="Share Link"
                            type="text"
                            value={resultUrl}
                            fullWidth
                            variant="outlined"
                            inputRef={resultInputRef}
                            InputProps={{
                                readOnly: true,
                            }}
                            onFocus={(e) => e.currentTarget.select()}
                            helperText="Click to select and copy"
                        />
                    )}
                </Box>
            </Container>
        </>
    );
};

export default ShareOracle;
