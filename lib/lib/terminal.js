/**
 * Copyright (c) 2012-2015, Christopher Jeffrey (MIT License)
 * Copyright (c) 2016, Daniel Imms (MIT License).
 */
"use strict";
var events_1 = require("events");
var Terminal = (function () {
    function Terminal() {
        // for 'close'
        this._internalee = new events_1.EventEmitter();
    }
    /** See net.Socket.end */
    Terminal.prototype.end = function (data) {
        this.socket.end(data);
    };
    /** See stream.Readable.pipe */
    Terminal.prototype.pipe = function (dest, options) {
        return this.socket.pipe(dest, options);
    };
    /** See net.Socket.pause */
    Terminal.prototype.pause = function () {
        return this.socket.pause();
    };
    /** See net.Socket.resume */
    Terminal.prototype.resume = function () {
        // TODO: Type with Socket
        return this.socket.resume();
    };
    /** See net.Socket.setEncoding */
    Terminal.prototype.setEncoding = function (encoding) {
        if (this.socket._decoder) {
            delete this.socket._decoder;
        }
        if (encoding) {
            this.socket.setEncoding(encoding);
        }
    };
    Terminal.prototype.addListener = function (type, listener) { this.on(type, listener); };
    Terminal.prototype.on = function (type, listener) {
        if (type === 'close') {
            this._internalee.on('close', listener);
            return;
        }
        this.socket.on(type, listener);
    };
    Terminal.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (event === 'close') {
            return this._internalee.emit.apply(this._internalee, arguments);
        }
        return this.socket.emit.apply(this.socket, arguments);
    };
    Terminal.prototype.listeners = function (type) {
        return this.socket.listeners(type);
    };
    Terminal.prototype.removeListener = function (type, listener) {
        this.socket.removeListener(type, listener);
    };
    Terminal.prototype.removeAllListeners = function (type) {
        this.socket.removeAllListeners(type);
    };
    Terminal.prototype.once = function (type, listener) {
        this.socket.once(type, listener);
    };
    // TODO: Should this be in the API?
    Terminal.prototype.redraw = function () {
        var _this = this;
        var cols = this.cols;
        var rows = this.rows;
        // We could just send SIGWINCH, but most programs will  ignore it if the
        // size hasn't actually changed.
        this.resize(cols + 1, rows + 1);
        setTimeout(function () { return _this.resize(cols, rows); }, 30);
    };
    Terminal.prototype._close = function () {
        this.socket.writable = false;
        this.socket.readable = false;
        this.write = function () { };
        this.end = function () { };
        this.writable = false;
        this.readable = false;
    };
    Terminal.prototype._parseEnv = function (env) {
        var keys = Object.keys(env || {});
        var pairs = [];
        for (var i = 0; i < keys.length; i++) {
            pairs.push(keys[i] + '=' + env[keys[i]]);
        }
        return pairs;
    };
    return Terminal;
}());
Terminal.DEFAULT_COLS = 80;
Terminal.DEFAULT_ROWS = 24;
exports.Terminal = Terminal;
//# sourceMappingURL=terminal.js.map 
//# sourceMappingURL=terminal.js.map