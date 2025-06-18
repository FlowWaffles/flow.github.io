import React from 'react';
import {CodeBlock, dracula} from 'react-code-blocks';

interface ExampleProps {
    code?: string,
    description: string,
    children?: React.ReactNode,
}

const ExampleContainer = ({code, description, children}: ExampleProps) => {
    return (
        <div className="">
            <p className="description">{description}</p>
            <div className="example-container">
                {code &&
                    <div className="example">
                        <div className="code">
                            <CodeBlock
                                text={code}
                                language={'typescript'}
                                showLineNumbers={true}
                                startingLineNumber={1}
                                theme={dracula}
                            />
                        </div>
                    </div>
                }
                {children &&
                    <div className="example-output">
                        <h2>Result:</h2>
                        {children}
                    </div>
                }
            </div>
        </div>
    );
}

export default React.memo(ExampleContainer);