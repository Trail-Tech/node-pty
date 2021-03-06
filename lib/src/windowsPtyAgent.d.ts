/// <reference types="node" />
import * as net from 'net';
import { ArgvOrCommandLine } from './types';
export declare class WindowsPtyAgent {
    private _inSocket;
    private _outSocket;
    private _pid;
    private _innerPid;
    private _innerPidHandle;
    private _fd;
    private _pty;
    readonly inSocket: net.Socket;
    readonly outSocket: net.Socket;
    readonly fd: any;
    readonly innerPid: number;
    readonly pty: number;
    constructor(file: string, args: ArgvOrCommandLine, env: string[], cwd: string, cols: number, rows: number, debug: boolean);
    resize(cols: number, rows: number): void;
    kill(): void;
}
export declare function argsToCommandLine(file: string, args: ArgvOrCommandLine): string;
