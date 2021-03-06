"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var path = require("path");
var terminal_1 = require("./terminal");
var utils_1 = require("./utils");
var pty = require(path.join('..', 'build', 'Release', 'pty.node'));
var DEFAULT_FILE = 'sh';
var DEFAULT_NAME = 'xterm';
var UnixTerminal = (function (_super) {
    __extends(UnixTerminal, _super);
    function UnixTerminal(file, args, opt) {
        var _this = _super.call(this, opt) || this;
        if (typeof args === 'string') {
            throw new Error('args as a string is not supported on unix.');
        }
        args = args || [];
        file = file || DEFAULT_FILE;
        opt = opt || {};
        opt.env = opt.env || process.env;
        var cols = opt.cols || terminal_1.Terminal.DEFAULT_COLS;
        var rows = opt.rows || terminal_1.Terminal.DEFAULT_ROWS;
        var uid = opt.uid || -1;
        var gid = opt.gid || -1;
        var env = utils_1.assign({}, opt.env);
        if (opt.env === process.env) {
            _this._sanitizeEnv(env);
        }
        var cwd = opt.cwd || process.cwd();
        var name = opt.name || env.TERM || DEFAULT_NAME;
        env.TERM = name;
        var parsedEnv = _this._parseEnv(env);
        var encoding = (opt.encoding === undefined ? 'utf8' : opt.encoding);
        var onexit = function (code, signal) {
            if (!_this._emittedClose) {
                if (_this._boundClose)
                    return;
                _this._boundClose = true;
                _this.once('close', function () { return _this.emit('exit', code, signal); });
                return;
            }
            _this.emit('exit', code, signal);
        };
        var term = pty.fork(file, args, parsedEnv, cwd, cols, rows, uid, gid, (encoding === 'utf8'), onexit);
        _this.socket = new PipeSocket(term.fd);
        if (encoding !== null) {
            _this.socket.setEncoding(encoding);
        }
        _this.socket.resume();
        _this.socket.on('error', function (err) {
            if (err.code) {
                if (~err.code.indexOf('EAGAIN')) {
                    return;
                }
            }
            _this._close();
            if (!_this._emittedClose) {
                _this._emittedClose = true;
                _this.emit('close');
            }
            if (err.code) {
                if (~err.code.indexOf('errno 5') || ~err.code.indexOf('EIO')) {
                    return;
                }
            }
            if (_this.listeners('error').length < 2) {
                throw err;
            }
        });
        _this.pid = term.pid;
        _this.fd = term.fd;
        _this.pty = term.pty;
        _this.file = file;
        _this.name = name;
        _this.readable = true;
        _this.writable = true;
        _this.socket.on('close', function () {
            if (_this._emittedClose) {
                return;
            }
            _this._emittedClose = true;
            _this._close();
            _this.emit('close');
        });
        return _this;
    }
    UnixTerminal.open = function (opt) {
        var self = Object.create(UnixTerminal.prototype);
        opt = opt || {};
        if (arguments.length > 1) {
            opt = {
                cols: arguments[1],
                rows: arguments[2]
            };
        }
        var cols = opt.cols || terminal_1.Terminal.DEFAULT_COLS;
        var rows = opt.rows || terminal_1.Terminal.DEFAULT_ROWS;
        var encoding = opt.encoding ? 'utf8' : opt.encoding;
        var term = pty.open(cols, rows);
        self.master = new PipeSocket(term.master);
        self.master.setEncoding(encoding);
        self.master.resume();
        self.slave = new PipeSocket(term.slave);
        self.slave.setEncoding(encoding);
        self.slave.resume();
        self.socket = self.master;
        self.pid = null;
        self.fd = term.master;
        self.pty = term.pty;
        self.file = process.argv[0] || 'node';
        self.name = process.env.TERM || '';
        self.readable = true;
        self.writable = true;
        self.socket.on('error', function (err) {
            self._close();
            if (self.listeners('error').length < 2) {
                throw err;
            }
        });
        self.socket.on('close', function () {
            self._close();
        });
        return self;
    };
    ;
    UnixTerminal.prototype.write = function (data) {
        this.socket.write(data);
    };
    UnixTerminal.prototype.destroy = function () {
        var _this = this;
        this._close();
        this.socket.once('close', function () {
            _this.kill('SIGHUP');
        });
        this.socket.destroy();
    };
    UnixTerminal.prototype.kill = function (signal) {
        try {
            process.kill(this.pid, signal || 'SIGHUP');
        }
        catch (e) { }
    };
    Object.defineProperty(UnixTerminal.prototype, "process", {
        get: function () {
            return pty.process(this.fd, this.pty) || this.file;
        },
        enumerable: true,
        configurable: true
    });
    UnixTerminal.prototype.resize = function (cols, rows) {
        pty.resize(this.fd, cols, rows);
    };
    UnixTerminal.prototype._sanitizeEnv = function (env) {
        delete env['TMUX'];
        delete env['TMUX_PANE'];
        delete env['STY'];
        delete env['WINDOW'];
        delete env['WINDOWID'];
        delete env['TERMCAP'];
        delete env['COLUMNS'];
        delete env['LINES'];
    };
    return UnixTerminal;
}(terminal_1.Terminal));
exports.UnixTerminal = UnixTerminal;
var PipeSocket = (function (_super) {
    __extends(PipeSocket, _super);
    function PipeSocket(fd) {
        var _this = this;
        var tty = process.binding('tty_wrap');
        var guessHandleType = tty.guessHandleType;
        tty.guessHandleType = function () { return 'PIPE'; };
        _this = _super.call(this, { fd: fd }) || this;
        tty.guessHandleType = guessHandleType;
        return _this;
    }
    return PipeSocket;
}(net.Socket));
//# sourceMappingURL=unixTerminal.js.map