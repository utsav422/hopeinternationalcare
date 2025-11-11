export type NextProps<
    P extends Record<string, string> = {},
    SP extends Record<string, string | string[]> = {},
> = {
    params: Promise<P> | P;
    searchParams: Promise<SP> | SP;
};
