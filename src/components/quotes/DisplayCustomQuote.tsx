import { useSearchParams } from "react-router-dom";
import type { Quote } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";

const UnicodeDecodeB64 = (encoded: string) => {
    return decodeURIComponent(atob(encoded));
}

const DisplayCustomQuote = () => {
    const [searchParams] = useSearchParams();

    const quoteParam = searchParams.get('quote');
    const quote = quoteParam ? UnicodeDecodeB64(quoteParam) : "";
    const authorParam = searchParams.get('author')
    const author = authorParam ? UnicodeDecodeB64(authorParam) : "";
    const customQuote: Quote = {
        quote: quote,
        author: author
    }


    return (
        <div className="quote-container">
            <QuoteTypewriter
                quote={customQuote}
                onComplete={() => { }}
            />
        </div>
    )
};

export default DisplayCustomQuote;