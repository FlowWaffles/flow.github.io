import ExampleContainer from './ExampleContainer.tsx';
import {useEffect, useRef} from 'react';


const description = "✅ Use useRef when:\n" +
    "You want to persist a value across renders, but changing it should not trigger a re-render.\n" +
    "\n" +
    "Good for DOM references or tracking values (like timeouts, previous values, etc.)"

const Timer = () => {
    const count = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            count.current += 1;
            console.log("Timer:", count.current);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return <div>Check console</div>;
};

const code = 'const Timer = () => {\n' +
    '  const count = useRef(0);\n' +
    '\n' +
    '  useEffect(() => {\n' +
    '    const interval = setInterval(() => {\n' +
    '      count.current += 1;\n' +
    '      console.log("Timer:", count.current);\n' +
    '    }, 1000);\n' +
    '\n' +
    '    return () => clearInterval(interval);\n' +
    '  }, []);\n' +
    '\n' +
    '  return <div>Check console</div>;\n' +
    '};'


const Example2b = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<Timer/>}/>
        </div>
    );
}

export default Example2b;


