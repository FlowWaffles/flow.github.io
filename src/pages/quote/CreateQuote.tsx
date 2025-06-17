import { useRef, useState } from "react";
import Header from "../../components/header/Header";
import UniLogo from "../../components/logo/Logo";

const b64EncodeUnicode = (str: string): string => {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
            String.fromCharCode(parseInt(p1, 16))
        )
    );
};

const CreateQuote = () => {
    const quoteInputRef = useRef<HTMLTextAreaElement>(null);
    const authorInputRef = useRef<HTMLInputElement>(null);
    const resultInputRef = useRef<HTMLInputElement>(null);

    const [resultUrl, setResultUrl] = useState("");
    const [copied, setCopied] = useState(false);

    const createUrl = async () => {
        const quote = quoteInputRef.current?.value || "";
        const author = authorInputRef.current?.value || "";

        const encodedQuote = b64EncodeUnicode(quote);
        const encodedAuthor = b64EncodeUnicode(author);
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
    // <UniLogo />
    return (
        <>
            <Header />

            <main style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>
                        Quote:
                        <textarea
                            ref={quoteInputRef}
                            rows={3}
                            style={{ width: "100%", marginTop: "0.5rem" }}
                            placeholder="Enter your quote"
                        />
                    </label>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>
                        Author:
                        <input
                            type="text"
                            ref={authorInputRef}
                            style={{ width: "100%", marginTop: "0.5rem" }}
                            placeholder="Enter author's name"
                        />
                    </label>
                </div>
                <button onClick={createUrl}>CopyUrl</button>
                {copied && (
                    <span style={{ color: "green", marginLeft: "1rem" }}>Copied!</span>
                )}
                <div style={{ marginTop: "1rem" }}>
                    <label>
                        Result:
                        <input
                            type="text"
                            ref={resultInputRef}
                            value={resultUrl}
                            readOnly
                            style={{
                                width: "100%",
                                marginTop: "0.5rem",
                                backgroundColor: "#f0f0f0",
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </label>
                </div>
            </main>
        </>
    );
};

export default CreateQuote;
