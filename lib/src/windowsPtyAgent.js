"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var path = require("path");
var pty = require(path.join('..', 'build', 'Release', 'pty.node'));
var WindowsPtyAgent = (function () {
    function WindowsPtyAgent(file, args, env, cwd, cols, rows, debug) {
        var _this = this;
        cwd = path.resolve(cwd);
        var commandLine = argsToCommandLine(file, args);
        var term = pty.startProcess(file, commandLine, env, cwd, cols, rows, debug);
        this._pid = term.pid;
        this._innerPid = term.innerPid;
        this._innerPidHandle = term.innerPidHandle;
        this._fd = term.fd;
        this._pty = term.pty;
        this._outSocket = new net.Socket();
        this._outSocket.setEncoding('utf8');
        this._outSocket.connect(term.conout, function () {
            _this._outSocket.emit('ready_datapipe');
        });
        this._inSocket = new net.Socket();
        this._inSocket.setEncoding('utf8');
        this._inSocket.connect(term.conin);
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
    Object.defineProperty(WindowsPtyAgent.prototype, "fd", {
        get: function () { return this._fd; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "innerPid", {
        get: function () { return this._innerPid; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowsPtyAgent.prototype, "pty", {
        get: function () { return this._pty; },
        enumerable: true,
        configurable: true
    });
    WindowsPtyAgent.prototype.resize = function (cols, rows) {
        pty.resize(this._pid, cols, rows);
    };
    WindowsPtyAgent.prototype.kill = function () {
        this._inSocket.readable = false;
        this._inSocket.writable = false;
        this._outSocket.readable = false;
        this._outSocket.writable = false;
        pty.kill(this._pid, this._innerPidHandle);
    };
    return WindowsPtyAgent;
}());
exports.WindowsPtyAgent = WindowsPtyAgent;
function argsToCommandLine(file, args) {
    if (isCommandLine(args)) {
        if (args.length === 0) {
            return file;
        }
        return file + " " + args;
    }
    var argv = [file];
    Array.prototype.push.apply(argv, args);
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
exports.argsToCommandLine = argsToCommandLine;
function isCommandLine(args) {
    return typeof args === 'string';
}
function repeatText(text, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += text;
    }
    return result;
}
//# sourceMappingURL=windowsPtyAgent.js.map