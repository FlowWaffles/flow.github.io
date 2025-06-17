import { useSearchParams } from "react-router-dom";
import { decompressFromEncodedURIComponent } from "lz-string";
import type { Quote } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";

const DisplayCustomQuote = () => {
    const [searchParams] = useSearchParams();

    const quoteParam = searchParams.get("quote");
    const authorParam = searchParams.get("author");

    const quote = quoteParam ? decompressFromEncodedURIComponent(quoteParam) ?? "" : "";
    const author = authorParam ? decompressFromEncodedURIComponent(authorParam) ?? "" : "";

    const customQuote: Quote = {
        quote,
        author
    };

    return (
        <div className="quote-centered">
            <QuoteTypewriter
                quote={customQuote}
                onComplete={() => { }}
            />
        </div>
    );
};

export default DisplayCustomQuote;
