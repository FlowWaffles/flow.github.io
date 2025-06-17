import { useSearchParams } from "react-router-dom";
import type { Quote } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";

const b64DecodeUnicode = (str: string): string => {
    return decodeURIComponent(
        atob(str)
            .split('')
            .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
    );
};

const DisplayCustomQuote = () => {
    const [searchParams] = useSearchParams();

    const quoteParam = searchParams.get('quote');
    const quote = quoteParam ? b64DecodeUnicode(quoteParam) : "";
    const authorParam = searchParams.get('author')
    const author = authorParam ? b64DecodeUnicode(authorParam) : "";
    const customQuote: Quote = {
        quote: quote,
        author: author
    }


    return (
        <div className="quote-centered">
            <QuoteTypewriter
                quote={customQuote}
                onComplete={() => { }}
            />
        </div>
    )
};

export default DisplayCustomQuote;