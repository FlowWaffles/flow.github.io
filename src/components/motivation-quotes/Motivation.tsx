import { useEffect, useState } from "react";
import { motivationQuotes } from "./Quotes";
import "./Motivation.css";

const Motivation = () => {
    const [quoteText, setQuoteText] = useState("");
    const [authorText, setAuthorText] = useState("");
    const [fullQuote, setFullQuote] = useState({ quote: "", author: "" });
    const [typeNext, setTypeNext] = useState(false);

    useEffect(() => {
        if (!typeNext) return;
        setTypeNext(false);
        setQuoteText("");
        setAuthorText("");
        setFullQuote({ quote: "", author: "" });
        const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
        setFullQuote(motivationQuotes[randomIndex]);
    }, [typeNext]);

    useEffect(() => {
        setTypeNext(true);
    }, []);

    useEffect(() => {
        typeQuote();
    }, [fullQuote]);


    const typeQuote = () => {

        if (!fullQuote.quote || !fullQuote.author) return;

        let index = -1;

        const interval = setInterval(() => {
            setQuoteText((prev) => prev + fullQuote.quote[index]);
            index++;

            if (index === fullQuote.quote.length - 1) {
                clearInterval(interval);
                typeAuthor();
            }
        }, 30);
    };

    const typeAuthor = () => {

        if (!fullQuote.quote || !fullQuote.author) return;

        let index = -1;

        const interval = setInterval(() => {
            setAuthorText((prev) => prev + fullQuote.author[index]);
            index++;

            if (index === fullQuote.author.length - 1) {
                clearInterval(interval);

                setTimeout(() => {
                    setTypeNext(true);
                }, 10000);
            }
        }, 30);
    };

    return (
        <div className="motivation-quote">
            <blockquote>
                <p className="motivational-quote-placeholder">{fullQuote.quote}</p>
                <p>{quoteText}</p>
                {authorText && (
                    <footer className="motivation-author">
                        <span className="motivational-quote-placeholder">{fullQuote.author}</span>
                        <span>{authorText}</span>
                    </footer>
                )}
            </blockquote>
        </div>
    );
};

export default Motivation;
