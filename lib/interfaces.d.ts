export declare type ProcessEnv = {
    [key: string]: string;
};
export interface ITerminal {
    process: string;
    write(data: string): void;
    resize(cols: number, rows: number): void;
    destroy(): void;
    kill(signal?: string): void;
    setEncoding(encoding: string): void;
    resume(): void;
    pause(): void;
}
export interface IPtyForkOptions {
    name?: string;
    cols?: number;
    rows?: number;
    cwd?: string;
    env?: ProcessEnv;
    uid?: number;
    gid?: number;
    encoding?: string;
}
export interface IPtyOpenOptions {
    cols?: number;
    rows?: number;
    encoding?: string;
}
