/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
export function mapToObject(map: Map<string, any>) {
    const obj: { [key: string]: any } = {};
    for (let [key, value] of map) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
}
