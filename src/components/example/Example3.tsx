import ExampleContainer from './ExampleContainer.tsx';
import { useState, useEffect } from "react";

const description = "✅ Use useEffect for:\n" +
    "Side effects: data fetching, subscriptions, timers, logging, DOM updates."



const RandomJoke = () => {
    const [joke, setJoke] = useState<string>("");

    useEffect(() => {
        let cancelled = false;

        fetch("https://official-joke-api.appspot.com/random_joke")
            .then(res => res.json())
            .then(data => {
                if (!cancelled) setJoke(`${data.setup} - ${data.punchline}`);
            });

        return () => {
            cancelled = true; // cleanup to prevent state update after unmount
        };
    }, []); // empty array = run once on mount

    return <div>{joke || "Loading joke..."}</div>;
};


const code = 'const RandomJoke = () => {\n' +
    '  const [joke, setJoke] = useState<string>("");\n' +
    '\n' +
    '  useEffect(() => {\n' +
    '    let cancelled = false;\n' +
    '\n' +
    '    fetch("https://official-joke-api.appspot.com/random_joke")\n' +
    '      .then(res => res.json())\n' +
    '      .then(data => {\n' +
    '        if (!cancelled) setJoke(`${data.setup} - ${data.punchline}`);\n' +
    '      });\n' +
    '\n' +
    '    return () => {\n' +
    '      cancelled = true; // cleanup to prevent state update after unmount\n' +
    '    };\n' +
    '  }, []); // empty array = run once on mount\n' +
    '\n' +
    '  return <div>{joke || "Loading joke..."}</div>;\n' +
    '};\n' +
    '\n' +
    'export default RandomJoke;'


const Example3 = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<RandomJoke/>}/>
        </div>
    );
}

export default Example3;


