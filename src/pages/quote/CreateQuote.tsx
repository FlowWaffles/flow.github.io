import { useRef, useState } from "react";
import Header from "../../components/header/Header";
import { compressToEncodedURIComponent } from "lz-string";
import { TextField, Button, Box, Container, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const CreateQuote = () => {
    const quoteInputRef = useRef<HTMLTextAreaElement>(null);
    const authorInputRef = useRef<HTMLInputElement>(null);
    const resultInputRef = useRef<HTMLInputElement>(null);

    const [resultUrl, setResultUrl] = useState("");
    const [copied, setCopied] = useState(false);

    const createUrl = async () => {
        const quote = quoteInputRef.current?.value || "";
        const author = authorInputRef.current?.value || "";

        const encodedQuote = compressToEncodedURIComponent(quote);
        const encodedAuthor = compressToEncodedURIComponent(author);

        const url = new URL("/quote", window.location.origin);
        url.searchParams.append("quote", encodedQuote);
        url.searchParams.append("author", encodedAuthor);

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
                    <TextField
                        label="Quote"
                        multiline
                        rows={4}
                        placeholder="Enter your quote"
                        inputRef={quoteInputRef}
                        fullWidth
                        variant="outlined"
                    />

                    <TextField
                        label="Author"
                        type="text"
                        placeholder="Enter author's name"
                        inputRef={authorInputRef}
                        fullWidth
                        variant="outlined"
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={createUrl}
                        endIcon={<ContentCopyIcon />}
                        size="large"
                        fullWidth
                    >
                        Create & Copy URL
                    </Button>

                    {copied && (
                        <Alert severity="success">Copied to clipboard!</Alert>
                    )}

                    <TextField
                        label="Result"
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
                </Box>
            </Container>
        </>
    );
};

export default CreateQuote;
