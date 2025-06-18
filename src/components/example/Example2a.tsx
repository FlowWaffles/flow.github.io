import ExampleContainer from './ExampleContainer.tsx';
import {useEffect, useState} from 'react';


const description = '❌ This example uses useState to update a counter every second,\n' +
    'which causes the component to rerender on every update.'

const Timer = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => prevCount + 1);

        }, 1000);

        return () => clearInterval(interval);
    }, []);
    console.log('Timer:', count);
    return <div>Check console</div>;
};

const code = 'const Timer = () => {\n' +
    '    const [count, setCount] = useState(0);\n' +
    '\n' +
    '    useEffect(() => {\n' +
    '        const interval = setInterval(() => {\n' +
    '            setCount(prevCount => prevCount + 1);\n' +
    '\n' +
    '        }, 1000);\n' +
    '\n' +
    '        return () => clearInterval(interval);\n' +
    '    }, []);\n' +
    '    console.log(\'Timer:\', count);\n' +
    '    return <div>Check console</div>;\n' +
    '};'


const Example2a = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<Timer/>}/>
        </div>
    );
}

export default Example2a;


