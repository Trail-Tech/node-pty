"use strict";
var os = require("os");
var Terminal;
if (os.platform() === 'win32') {
    Terminal = require('./windowsTerminal').WindowsTerminal;
}
else {
    Terminal = require('./unixTerminal').UnixTerminal;
}
function fork(file, args, opt) {
    return new Terminal(file, args, opt);
}
exports.fork = fork;
;
function spawn(file, args, opt) {
    return new Terminal(file, args, opt);
}
exports.spawn = spawn;
;
function createTerminal(file, args, opt) {
    return new Terminal(file, args, opt);
}
exports.createTerminal = createTerminal;
;
function open(opt) {
    return Terminal.open(opt);
}
exports.open = open;
//# sourceMappingURL=index.js.map