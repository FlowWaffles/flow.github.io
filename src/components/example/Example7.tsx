import ExampleContainer from './ExampleContainer.tsx';

const description = '❌ Pitfall 1: Updating state inside useEffect without dependencies'


const code = 'useEffect(() => {\n' +
    '  setCount(count + 1); // Infinite loop!\n' +
    '});'


const Example7 = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description}/>
        </div>
    );
}

export default Example7;


