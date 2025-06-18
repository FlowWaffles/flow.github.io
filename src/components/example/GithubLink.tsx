import ExampleContainer from './ExampleContainer.tsx';

const Component = () => {
    return (
        <>
            <a
                href="https://github.com/typescript-cheatsheets/react#reacttypescript-cheatsheets"
                style={{
                    color: 'black'
                }}
            > https://github.com/typescript-cheatsheets/react#reacttypescript-cheatsheets</a><img
            src="../assets/nyanCat.gif"
            alt=""
            style={{
                width: '200px'
            }}/>
        </>
    )
};

const GithubLink = () => {
    return (
        <div>
            <ExampleContainer description={'React TypeScript Cheatsheet'} children={<Component/>}/>
        </div>
    );
}

export default GithubLink;