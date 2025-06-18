import ExampleContainer from './ExampleContainer.tsx';

const description = 'Exampleception: example for conditional rendering'

const code = 'const ExampleContainer= ({code, description, children}: ExampleProps) => {\n' +
    '    return (\n' +
    '        <div className="">\n' +
    '            <p className="description">{description}</p>\n' +
    '            <div className="example-container">\n' +
    '                <div className="example">\n' +
    '                    <div className="code">\n' +
    '                        <CodeBlock\n' +
    '                            text={code}\n' +
    '                            language={\'typescript\'}\n' +
    '                            showLineNumbers={true}\n' +
    '                            startingLineNumber={1}\n' +
    '                            theme={dracula}\n' +
    '                        />\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                {children &&\n' +
    '                    <div className="example-output">\n' +
    '                        <h2>Result:</h2>\n' +
    '                        {children}\n' +
    '                    </div>\n' +
    '                }\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    );\n' +
    '}'

const Example6 = () => {
    return (
        <div>
            <ExampleContainer code={code} description={description}/>
        </div>
    );
}

export default Example6;

