type SampleObject<T extends string> = {
    [key in T]?: any;
} & {
    [key: string]: any;
}

export const filterProperty = <T extends string>(
    object: SampleObject<T>, 
    property: keyof SampleObject<T>
) => {
    return Object.keys(object)
    .filter((key: keyof SampleObject<"">) => key !== property)
    .reduce((obj: SampleObject<T>, key: string) => {
        return {
            ...obj,
            [key]: object[key]
        } as SampleObject<"">
    }, {} as SampleObject<"">);
}
