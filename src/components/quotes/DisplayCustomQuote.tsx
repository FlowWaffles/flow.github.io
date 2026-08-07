import { decompressFromEncodedURIComponent } from "lz-string";
import type { Quote } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";
import { useUrlSearchParams } from "../../utils/location";

const DisplayCustomQuote = () => {
    const [searchParams] = useUrlSearchParams();

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
