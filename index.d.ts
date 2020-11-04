export function zip (input: string, output: string, cb?: (err: Error | null) => void): void;
export function zip (input: string, output: string, includeBaseDirectory: boolean, cb?: (err: Error | null) => void): void;

export function zipSync (input: string, output: string, includeBaseDirectory?: boolean): void;

export function unzip (input: string, output: string, cb?: (err: Error | null) => void): void;

export function unzipSync (input: string, output: string): void;
