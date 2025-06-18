import ExampleContainer from './ExampleContainer.tsx';
import {useState} from 'react';

const description = 'React uses key to identify elements across renders. Changing the key forces React to treat a component as new, thus remounting it.'


const Input = () => {
    const [key, setKey] = useState(0);

    return (
        <>
            <input style={{height: '50px', width: '180px' ,marginBottom:'10px'}} key={key}/>
            <button style={{height: '100px', width: '200px'}} onClick={() => setKey(prev => prev + 1)}>click me</button>
        </>
    );
};

const code = 'const Input = () => {\n' +
    '    const [key, setKey] = useState(0);\n' +
    '\n' +
    '    return (\n' +
    '        <>\n' +
    '            <input key={key}/>\n' +
    '            <button style={{height: \'100px\', width: \'200px\'}} onClick={() => setKey(prev => prev + 1)}>click me</button>\n' +
    '        </>\n' +
    '    );\n' +
    '};\n'


const ExampleTwo = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description} children={<Input/>}/>
        </div>
    );
}

export default ExampleTwo;


