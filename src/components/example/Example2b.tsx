import ExampleContainer from './ExampleContainer.tsx';
import {useEffect, useRef, useState} from 'react';


const description = '✅ Use useRef when:\n' +
    'You want to persist a value across renders, but changing it should not trigger a re-render.\n' +
    '\n' +
    'Good for DOM references or tracking values (like timeouts, previous values, etc.)'

const Timer = () => {
    const count = useRef(0);
    const [count2, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            count.current += 1;
            console.log('Timer:', count.current);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    console.log('Timer example rendered');
    return (
        <>
            <div>Check console</div>
            <button style={{
                padding: '1rem',
                width: '300px',
                margin: 'auto',
                height: '150px',
                backgroundColor: '#0378B9FF',
                borderRadius: '25px'
            }} onClick={() => setCount(count2 + 1)}>
                Count: {count2}
            </button>
        </>
    );
};

const code = 'const Timer = () => {\n' +
    '    const count = useRef(0);\n' +
    '    const [count2, setCount] = useState(0);\n' +
    '\n' +
    '    useEffect(() => {\n' +
    '        const interval = setInterval(() => {\n' +
    '            count.current += 1;\n' +
    '            console.log(\'Timer:\', count.current);\n' +
    '        }, 1000);\n' +
    '\n' +
    '        return () => clearInterval(interval);\n' +
    '    }, []);\n' +
    '\n' +
    '    console.log(\'Timer example rendered\');\n' +
    '    return (\n' +
    '        <>\n' +
    '            <div>Check console</div>\n' +
    '            <button onClick={() => setCount(count2 + 1)}>\n' +
    '                Count: {count2}\n' +
    '            </button>\n' +
    '        </>\n' +
    '    );\n' +
    '};'

const Example2b = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<Timer/>}/>
        </div>
    );
}

export default Example2b;


