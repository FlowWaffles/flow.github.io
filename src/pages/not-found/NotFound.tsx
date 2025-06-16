import './NotFound.css'
import NyanCat from '../../components/cat/NyanCat';

const NotFound = () => {
    return (
        <div className="not-found">
            <NyanCat />
            <h1>404</h1>
            <p><a href="https://flow.fail" aria-label="Home" rel="noreferrer">This</a> is not the page you are looking for.</p>
        </div>
    )
};

export default NotFound;