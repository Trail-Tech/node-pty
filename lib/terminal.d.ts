/// <reference types="node" />
import { Socket } from 'net';
import { EventEmitter } from 'events';
import { ITerminal, IPtyForkOptions } from './interfaces';
export declare abstract class Terminal implements ITerminal {
    protected static readonly DEFAULT_COLS: number;
    protected static readonly DEFAULT_ROWS: number;
    protected socket: Socket;
    protected pid: number;
    protected fd: number;
    protected pty: any;
    protected file: string;
    protected name: string;
    protected cols: number;
    protected rows: number;
    protected readable: boolean;
    protected writable: boolean;
    protected _internalee: EventEmitter;
    constructor(opt?: IPtyForkOptions);
    private _checkType(name, value, type);
    end(data: string): void;
    pipe(dest: any, options: any): any;
    pause(): Socket;
    resume(): Socket;
    setEncoding(encoding: string): void;
    addListener(type: string, listener: (...args: any[]) => any): void;
    on(type: string, listener: (...args: any[]) => any): void;
    emit(event: string, ...args: any[]): any;
    listeners(type: string): Function[];
    removeListener(type: string, listener: (...args: any[]) => any): void;
    removeAllListeners(type: string): void;
    once(type: string, listener: (...args: any[]) => any): void;
    abstract write(data: string): void;
    abstract resize(cols: number, rows: number): void;
    abstract destroy(): void;
    abstract kill(signal?: string): void;
    readonly abstract process: string;
    redraw(): void;
    protected _close(): void;
    protected _parseEnv(env: {
        [key: string]: string;
    }): string[];
}
