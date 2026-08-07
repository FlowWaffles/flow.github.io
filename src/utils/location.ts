import { useCallback, useEffect, useMemo, useState } from "react";

type SearchParamsInit =
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams;

type SetSearchParamsOptions = {
    replace?: boolean;
};

const LOCATION_CHANGE_EVENT = "flow:locationchange";

const readLocation = () => ({
    pathname: window.location.pathname,
    search: window.location.search,
});

const toSearchParams = (init: SearchParamsInit): URLSearchParams => {
    if (init instanceof URLSearchParams) {
        return new URLSearchParams(init);
    }

    if (typeof init === "string") {
        return new URLSearchParams(init.startsWith("?") ? init.slice(1) : init);
    }

    if (Array.isArray(init)) {
        return new URLSearchParams(init);
    }

    return new URLSearchParams(Object.entries(init));
};

const dispatchLocationChange = () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
};

export const useCurrentLocation = () => {
    const [location, setLocation] = useState(readLocation);

    useEffect(() => {
        const handleLocationChange = () => {
            setLocation(readLocation());
        };

        window.addEventListener("popstate", handleLocationChange);
        window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);

        return () => {
            window.removeEventListener("popstate", handleLocationChange);
            window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
        };
    }, []);

    return location;
};

export const useUrlSearchParams = (): [
    URLSearchParams,
    (nextInit: SearchParamsInit, options?: SetSearchParamsOptions) => void
] => {
    const { search } = useCurrentLocation();

    const searchParams = useMemo(() => new URLSearchParams(search), [search]);

    const setSearchParams = useCallback(
        (nextInit: SearchParamsInit, options?: SetSearchParamsOptions) => {
            const nextSearchParams = toSearchParams(nextInit);
            const nextSearch = nextSearchParams.toString();
            const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;

            if (options?.replace) {
                window.history.replaceState(window.history.state, "", nextUrl);
            } else {
                window.history.pushState(window.history.state, "", nextUrl);
            }

            dispatchLocationChange();
        },
        []
    );

    return [searchParams, setSearchParams];
};
