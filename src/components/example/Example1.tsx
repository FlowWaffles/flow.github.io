import ExampleContainer from './ExampleContainer.tsx';
import {useState} from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <button  style={{ padding: "1rem", width: "300px", margin: "auto", height:"150px", backgroundColor:"#0378B9FF", borderRadius:"25px" }} onClick={() => setCount(count + 1)}>
            Count: {count}
        </button>
    );
};

const code = 'const Counter = () => {\n' +
    '  const [count, setCount] = useState(0);\n' +
    '\n' +
    '  return (\n' +
    '    <button onClick={() => setCount(count + 1)}>\n' +
    '      Count: {count}\n' +
    '    </button>\n' +
    '  );\n' +
    '};\n'


const Example1 = () => {
    return (
        <div>
            <ExampleContainer code={code} description={"✅ Use useState when:\n" +
                "You want React to re-render the component when the value changes."} children={<Counter/>}/>
        </div>
    );
}

export default Example1;


