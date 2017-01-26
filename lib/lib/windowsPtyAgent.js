/**
 * Copyright (c) 2012-2015, Christopher Jeffrey, Peter Sunde (MIT License)
 * Copyright (c) 2016, Daniel Imms (MIT License).
 */
"use strict";
var net = require("net");
var path = require("path");
var pty;
try {
    pty = require(path.join('..', 'build', 'Release', 'pty.node'));
}
catch (e) {
    pty = require(path.join('..', 'build', 'Debug', 'pty.node'));
}
;
/**
 * Agent. Internal class.
 *
 * Everytime a new pseudo terminal is created it is contained
 * within agent.exe. When this process is started there are two
 * available named pipes (control and data socket).
 */
var WindowsPtyAgent = (function () {
    function WindowsPtyAgent(file, args, env, cwd, cols, rows, debug) {
        var _this = this;
        // Sanitize input variable.
        cwd = path.resolve(cwd);
        // Compose command line
        var cmdline = [file];
        Array.prototype.push.apply(cmdline, args);
        var cmdlineFlat = argvToCommandLine(cmdline);
        // Open pty session.
        var term = pty.startProcess(file, cmdlineFlat, env, cwd, cols, rows, debug);
        // Terminal pid.
        this._pid = term.pid;
        // Not available on windows.
        this._fd = term.fd;
        // Generated incremental number that has no real purpose besides  using it
        // as a terminal id.
        this._pty = term.pty;
        // Create terminal pipe IPC channel and forward to a local unix socket.
        this._outSocket = new net.Socket();
        this._outSocket.setEncoding('utf8');
        this._outSocket.connect(term.conout, function () {
            // TODO: Emit event on agent instead of socket?
            // Emit ready event.
            _this._outSocket.emit('ready_datapipe');
        });
        this._inSocket = new net.Socket();
        this._inSocket.setEncoding('utf8');
        this._inSocket.connect(term.conin);
        // TODO: Wait for ready event?
    }
    Object.defineProperty(WindowsPtyAgent.prototype, "inSocket", {
        get: function () { return this._inSocket; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "outSocket", {
        get: function () { return this._outSocket; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "pid", {
        get: function () { return this._pid; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "fd", {
        get: function () { return this._fd; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "pty", {
        get: function () { return this._pty; },
        enumerable: true,
        configurable: true
    });
    WindowsPtyAgent.prototype.resize = function (cols, rows) {
        pty.resize(this.pid, cols, rows);
    };
    WindowsPtyAgent.prototype.kill = function () {
        pty.kill(this.pid);
    };
    return WindowsPtyAgent;
}());
exports.WindowsPtyAgent = WindowsPtyAgent;
// Convert argc/argv into a Win32 command-line following the escaping convention
// documented on MSDN (e.g. see CommandLineToArgvW documentation). Copied from
// winpty project.
function argvToCommandLine(argv) {
    var result = '';
    for (var argIndex = 0; argIndex < argv.length; argIndex++) {
        if (argIndex > 0) {
            result += ' ';
        }
        var arg = argv[argIndex];
        var quote = arg.indexOf(' ') !== -1 ||
            arg.indexOf('\t') !== -1 ||
            arg === '';
        if (quote) {
            result += '\"';
        }
        var bsCount = 0;
        for (var i = 0; i < arg.length; i++) {
            var p = arg[i];
            if (p === '\\') {
                bsCount++;
            }
            else if (p === '"') {
                result += repeatText('\\', bsCount * 2 + 1);
                result += '"';
                bsCount = 0;
            }
            else {
                result += repeatText('\\', bsCount);
                bsCount = 0;
                result += p;
            }
        }
        if (quote) {
            result += repeatText('\\', bsCount * 2);
            result += '\"';
        }
        else {
            result += repeatText('\\', bsCount);
        }
    }
    return result;
}
exports.argvToCommandLine = argvToCommandLine;
function repeatText(text, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += text;
    }
    return result;
}
//# sourceMappingURL=windowsPtyAgent.js.map 
//# sourceMappingURL=windowsPtyAgent.js.map