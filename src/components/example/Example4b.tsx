import ExampleContainer from './ExampleContainer.tsx';
import {memo, useState} from 'react';

const description = '✅ Use useCallback for:\n' +
    'Memoizing a function to avoid unnecessary re-creation on every render.\n' +
    '\n' +
    'Especially useful when passing functions to child components or dependencies of other hooks.'


const Child = memo(({onClick}: { onClick: () => void }) => {
    console.log('Child render');
    return <button style={{height: '100px', width: '200px'}} onClick={onClick}>Click</button>;
});

const Parent = () => {
    const [count, setCount] = useState(0);

    // Without useCallback: function is re-created → child re-renders unnecessarily
    // const increment = useCallback(() => setCount((c) => c + 1), []);
    // vs:
    const increment = () => setCount((c) => c + 1);

    return (
        <>
            <div>Count: {count}</div>
            <Child onClick={increment}/>
        </>
    );
};

const code = 'const Child = memo(({onClick}: { onClick: () => void }) => {\n' +
    '    console.log(\'Child render\');\n' +
    '    return <button style={{height: \'100px\', width: \'200px\'}} onClick={onClick}>Click</button>;\n' +
    '});\n' +
    '\n' +
    'const Parent = () => {\n' +
    '    const [count, setCount] = useState(0);\n' +
    '\n' +
    '    // Without useCallback: function is re-created → child re-renders unnecessarily\n' +
    '    // const increment = useCallback(() => setCount((c) => c + 1), []);\n' +
    '    // vs:\n' +
    '    const increment = () => setCount((c) => c + 1);\n' +
    '\n' +
    '    return (\n' +
    '        <>\n' +
    '            <div>Count: {count}</div>\n' +
    '            <Child onClick={increment}/>\n' +
    '        </>\n' +
    '    );\n' +
    '};'


const Example4b = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<Parent/>}/>
        </div>
    );
}

export default Example4b;


