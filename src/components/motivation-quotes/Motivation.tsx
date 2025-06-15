import { useEffect, useState } from "react";
import { motivationQuotes } from "./Quotes";
import "./Motivation.css";

const Motivation = () => {
    const [quoteText, setQuoteText] = useState("");
    const [authorText, setAuthorText] = useState("");
    const [fullQuote, setFullQuote] = useState({ quote: "", author: "" });


    useEffect(() => {
        let cancelled = false;

        const typeText = async (fullText: string, setter: React.Dispatch<React.SetStateAction<string>>, optionalSetter?: React.Dispatch<React.SetStateAction<string>>) => {
            setter("");
            if (optionalSetter) {
                optionalSetter("");
            }
            for (let i = 0; i < fullText.length; i++) {
                if (cancelled) return;
                setter((prev) => prev + fullText[i]);
                await new Promise((res) => setTimeout(res, 50));
            }
        };

        const startTyping = async () => {
            while (!cancelled) {
                const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
                const quote = motivationQuotes[randomIndex];
                setFullQuote(quote);
                await typeText('"' + quote.quote + '"', setQuoteText, setAuthorText);
                await typeText('― ' + quote.author, setAuthorText);
                await new Promise((res) => setTimeout(res, 15000));
                if (cancelled) return;
            }
        };

        startTyping();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="motivation-quote">
            <blockquote>
                <p className="motivational-quote-placeholder">"{fullQuote.quote}"</p>
                <p>{quoteText}</p>
                {authorText && (
                    <footer className="motivation-author">
                        <span className="motivational-quote-placeholder"><i>― {fullQuote.author}</i></span>
                        <span><i>{authorText}</i></span>
                    </footer>
                )}
            </blockquote>
        </div>
    );
};

export default Motivation;
