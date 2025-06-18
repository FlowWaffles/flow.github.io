import {useCallback, useEffect, useMemo, useState} from 'react';
import Example1 from '../../components/example/Example1.tsx';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import './Example.css';
import Example2b from '../../components/example/Example2b.tsx';
import Example2a from '../../components/example/Example2a.tsx';
import Example3 from '../../components/example/Example3.tsx';
import Example4a from '../../components/example/Example4a.tsx';
import Example4b from '../../components/example/Example4b.tsx';
import Example5 from '../../components/example/Example5.tsx';
import {useSearchParams} from 'react-router-dom';

const examples = [
    {id: '1', title: '1', Component: Example1},
    {id: '2a', title: '2a', Component: Example2a},
    {id: '2b', title: '2b', Component: Example2b},
    {id: '3', title: '3', Component: Example3},
    {id: '4a', title: '4a', Component: Example4a},
    {id: '4b', title: '4b', Component: Example4b},
    {id: '5', title: '5', Component: Example5},
];

const Example = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const idFromUrl = searchParams.get('id');

    const initialIndex = useMemo(() => {
        const index = examples.findIndex((ex) => ex.id === idFromUrl);
        return index !== -1 ? index : 0;
    }, [idFromUrl]);

    const [activeIndex, setActiveIndex] = useState(initialIndex);

    const { Component, id } = examples[activeIndex];

    const updateUrl = (id: string) => {
        setSearchParams({ id });
    };

    useEffect(() => {
        updateUrl(id);
    }, [id]);

    const next = () => {
        setActiveIndex((prev) => (prev + 1) % examples.length);
    };

    const prev = () => {
        setActiveIndex((prev) => (prev - 1 + examples.length) % examples.length);
    };

    const refCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) return; // unmounting

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [next, prev]);

    return (
        <div className="examples" ref={refCallback}>
            <div className="example-wrapper">
                <button className="nav-button left" onClick={prev}><PlayArrowRoundedIcon/></button>
                <button className="nav-button right" onClick={next}><PlayArrowRoundedIcon/></button>
                <Component/>
            </div>
        </div>
    );
};

export default Example;
