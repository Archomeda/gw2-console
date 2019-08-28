(function (global) {
    let Terminal;
    Terminal = Terminal || function(containerID, options) {
        if (!containerID) return;

        const defaults = {
            welcome: '',
            prompt: '',
            separator: '&gt;',
            theme: 'interlaced'
        };

        options = options || defaults;
        options.welcome = options.welcome || defaults.welcome;
        options.prompt = options.prompt || defaults.prompt;
        options.separator = options.separator || defaults.separator;
        options.theme = options.theme || defaults.theme;

        const extensions = Array.prototype.slice.call(arguments, 2);

        const _history = localStorage.history ? JSON.parse(localStorage.history) : [];
        let _histpos = _history.length;
        let _histtemp = '';

        let _tabCompletionPrefix = '';
        let _tabCompletionIndex = 0;

        // Create terminal and cache DOM nodes;
        const _terminal = document.getElementById(containerID);
        _terminal.classList.add('terminal');
        _terminal.classList.add('terminal-' + options.theme);
        _terminal.insertAdjacentHTML('beforeEnd', [
            '<div class="background"><div class="interlace"></div></div>',
            '<div class="container">',
            '<output></output>',
            '<table class="input-line">',
            '<tr><td nowrap><div class="prompt">' + options.prompt + options.separator + '</div></td><td width="100%"><input class="cmdline" spellcheck="false" autofocus /></td></tr>',
            '</table>',
            '</div>'].join(''));
        const _container = _terminal.querySelector('.container');
        const _inputLine = _container.querySelector('.input-line');
        const _cmdLine = _container.querySelector('.input-line .cmdline');
        const _output = _container.querySelector('output');
        const _prompt = _container.querySelector('.prompt');
        const _background = document.querySelector('.background');

        // Hackery to resize the interlace background image as the container grows.
        _output.addEventListener('DOMSubtreeModified', function() {
        // Works best with the scroll into view wrapped in a setTimeout.
            setTimeout(function() {
                _cmdLine.scrollIntoView();
            }, 0);
        }, false);

        if (options.welcome) {
            output(options.welcome);
        }

        window.addEventListener('click', function() {
            _cmdLine.focus();
        }, false);

        _output.addEventListener('click', function(e) {
            _cmdLine.focus();
            e.stopPropagation();
        }, false);

        // Always force text cursor to end of input line.
        _cmdLine.addEventListener('click', inputTextClick, false);
        _inputLine.addEventListener('click', function() {
            _cmdLine.focus();
        }, false);

        // Handle up/down key presses for shell history and enter for new command.
        _cmdLine.addEventListener('keyup', historyHandler, false);
        _cmdLine.addEventListener('keydown', handleKeyDown, false);

        window.addEventListener('keyup', function(e) {
            _cmdLine.focus();
            e.stopPropagation();
            e.preventDefault();
        }, false);

        function inputTextClick(e) {
            this.value = this.value;
        }

        function historyHandler(e) {
        // Clear command-line on Escape key.
            if (e.keyCode == 27) {
                this.value = '';
                e.stopPropagation();
                e.preventDefault();
            }

            if (_history.length && (e.keyCode == 38 || e.keyCode == 40)) {
                if (_history[_histpos]) {
                    _history[_histpos] = this.value;
                }
                else {
                    _histtemp = this.value;
                }

                if (e.keyCode == 38) {
                    // Up arrow key.
                    _histpos--;
                    if (_histpos < 0) {
                        _histpos = 0;
                    }
                }
                else if (e.keyCode == 40) {
                    // Down arrow key.
                    _histpos++;
                    if (_histpos > _history.length) {
                        _histpos = _history.length;
                    }
                }

                this.value = _history[_histpos] ? _history[_histpos] : _histtemp;

                // Move cursor to end of input.
                this.value = this.value;
            }
        }

        function resetTabCompletion() {
            _tabCompletionPrefix = null;
            _tabCompletionIndex = 0;
        }

        async function handleKeyDown(e) {
            if (e.keyCode == 13) await processNewCommand.bind(this)(e);
            else if (e.keyCode == 9) await handleTabCompletion.bind(this)(e);
            // Reset tab completion if keypress is valid English character
            // or backspace/delete/escape
            else if ((e.keyCode >= 32 && e.keyCode <= 126) ||
                     (e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 27)) {
                resetTabCompletion(e);
            }
        }

        async function handleTabCompletion(e) {
            if (e.keyCode != 9) return;

            e.preventDefault();
            const command = this.value;
            if (command === '' || command.includes(' ')) return;

            _tabCompletionPrefix = _tabCompletionPrefix || command;

            let response = false;
            for (let index in extensions) {
                let ext = extensions[index];
                if (ext.tabComplete) response = ext.tabComplete(_tabCompletionPrefix, _tabCompletionIndex);
                if (response && response.then) {
                    response = await response;
                }
                if (response !== false) break;
            }
            if (response !== false) {
                this.value = response;
            }
            _tabCompletionIndex++;
        }

        async function processNewCommand(e) {
        // Only handle the Enter key.
            if (e.keyCode != 13) return;

            const cmdline = this.value;
            resetTabCompletion();

            // Save shell history.
            if (cmdline) {
                _history[_history.length] = cmdline;
                localStorage['history'] = JSON.stringify(_history);
                _histpos = _history.length;
            }

            // Duplicate current input and append to output section.
            const line = this.parentNode.parentNode.parentNode.parentNode.cloneNode(true);
            line.removeAttribute('id');
            line.classList.add('line');
            const input = line.querySelector('input.cmdline');
            input.autofocus = false;
            input.readOnly = true;
            input.insertAdjacentHTML('beforebegin', input.value);
            input.parentNode.removeChild(input);
            _output.appendChild(line);

            // Hide command line until we're done processing input.
            _inputLine.classList.add('hidden');

            // Clear/setup line for next input.
            this.value = '';

            // Parse out command, args, and trim off whitespace.
            let cmd;
            let args;
            if (cmdline && cmdline.trim()) {
                args = cmdline.split(' ').filter(function(val) {
                    return val;
                });
                cmd = args[0];
                args = args.splice(1); // Remove cmd from arg list.
            }

            if (cmd) {
                let response = false;
                for (const index in extensions) {
                    const ext = extensions[index];
                    if (ext.execute) response = ext.execute(cmd, args);
                    if (response && response.then) {
                        response = await response;
                    }
                    if (response !== false) break;
                }
                if (response === false) response = cmd + ': command not found';
                output(response);
                // Additional "after execute" handler for post-processing command output.
                for (const index in extensions) {
                    const ext = extensions[index];
                    if (ext.afterExecute) response = ext.afterExecute(cmd, args);
                    if (response && response.then) {
                        await response;
                    }
                }
            }

            // Show the command line.
            _inputLine.classList.remove('hidden');
        }

        function clear() {
            _output.innerHTML = '';
            _cmdLine.value = '';
            _background.style.minHeight = '';
        }

        function output(html) {
            if (html) {
                html = html.split('\n').map((line) => (`<li class='terminal-line'>${line}</li>`)).join('');
                _output.insertAdjacentHTML('beforeEnd', html);
            }
            _cmdLine.scrollIntoView();
        }

        function outputLine(html) {
            output(`${html ? html : ''}<br/>`);
        }

        return {
            clear: clear,
            write: output,
            writeLine: outputLine,
            setPrompt: function(prompt) { _prompt.innerHTML = prompt + options.separator; },
            getPrompt: function() { return _prompt.innerHTML.replace(new RegExp(options.separator + '$'), ''); },
            setTheme: function(theme) { _terminal.classList.remove('terminal-' + options.theme); options.theme = theme; _terminal.classList.add('terminal-' + options.theme); },
            getTheme: function() { return options.theme; }
        };
    };

    // node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Terminal;

        // web browsers
    } else {
        const oldTerminal = global.Terminal;
        Terminal.noConflict = function () {
            global.Terminal = oldTerminal;
            return Terminal;
        };
        global.Terminal = Terminal;
    }

})(this);
