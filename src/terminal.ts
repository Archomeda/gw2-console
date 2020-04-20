import './css/terminal-1.0.2.min.css';

class Extension {
    execute?(command: string, args: string[]): string | boolean | Promise<string | boolean>;
    afterExecute?(command: string, args: string[], outputElements: HTMLLIElement[]): void | Promise<void>;
    tabComplete?(prefix: string, index: number): string | boolean | Promise<string | boolean>;
}

export class Terminal {
    private options: { welcome: string, prompt: string, separator: string, theme: string };
    private extensions: Extension[];

    private history: string[];
    private historyPos: number;
    private historyCurrent: string;
    private tabCompletionPrefix = '';
    private tabCompletionIndex = 0;

    private terminalElement: HTMLElement;
    private terminalContainer: HTMLDivElement;
    private terminalInputLine: HTMLTableElement;
    private terminalCmdLine: HTMLInputElement;
    private terminalOutput: HTMLOutputElement;
    private terminalPrompt: HTMLDivElement;
    private terminalBackground: HTMLDivElement;


    constructor(private containerId: string, { welcome = '', prompt = '', separator = '&gt;', theme = 'interlaced' } = {}, ...extensions: Extension[]) {
        this.options = {
            welcome,
            prompt,
            separator,
            theme
        };
        this.extensions = extensions;

        this.history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
        this.historyPos = this.history.length;

        this.initialize();
    }


    public get prompt() {
        return this.options.prompt;
    }

    public set prompt(prompt) {
        this.prompt = prompt;
        this.terminalPrompt.innerHTML = `${prompt}${this.options.separator}`;
    }

    public get theme() {
        return this.options.theme;
    }

    public set theme(theme) {
        this.terminalContainer.classList.remove(`terminal-${this.options.theme}`);
        this.options.theme = theme;
        this.terminalContainer.classList.add(`terminal-${theme}`);
    }

    public write(html: string) {
        if (html) {
            const elements = html.split('\n').map(x => {
                const line = document.createElement('li');
                line.classList.add('terminal-line');
                line.innerHTML = x;
                return line;
            });
            for (const element of elements) {
                this.terminalOutput.insertAdjacentElement('beforeend', element);
            }

            this.terminalCmdLine.scrollIntoView();
            return elements;
        }
        return [];
    }

    public writeLine(html?: string) {
        this.write(`${html ? html : ''}<br/>`);
    }

    public clear() {
        this.terminalOutput.innerHTML = '';
        this.terminalCmdLine.value = '';
        this.terminalBackground.style.minHeight = '';
    }


    private get inputLine() {
        return this.terminalCmdLine.value;
    }

    private set inputLine(val) {
        this.terminalCmdLine.value = val;
    }

    private goToEndOfLine() {
        this.terminalCmdLine.selectionStart = this.terminalCmdLine.value.length;
        this.terminalCmdLine.selectionEnd = this.terminalCmdLine.value.length;
    }


    private initialize() {
        this.inject();
        this.addEvents();
        this.start();
    }

    private inject() {
        // Create terminal and cache DOM nodes;
        this.terminalElement = document.getElementById(this.containerId);
        this.terminalElement.classList.add('terminal', `terminal-${this.options.theme}`);
        this.terminalElement.insertAdjacentHTML('beforeend',
            `<div class="background"><div class="interlace"></div></div>` +
            `<div class="container">` +
            `<output><ul></ul></output>` +
            `<table class="input-line">` +
            `<tr><td nowrap><div class="prompt">${this.options.prompt}${this.options.separator}</div></td><td width="100%"><input class="cmdline" spellcheck="false" autofocus /></td></tr>` +
            `</table>` +
            `</div>`);

        this.terminalContainer = this.terminalElement.querySelector('.container');
        this.terminalInputLine = this.terminalElement.querySelector('.input-line');
        this.terminalCmdLine = this.terminalElement.querySelector('.input-line .cmdline');
        this.terminalOutput = this.terminalElement.querySelector('output ul');
        this.terminalPrompt = this.terminalElement.querySelector('.prompt');
        this.terminalBackground = this.terminalElement.querySelector('.background');
    }

    private addEvents() {
        // Hackery to resize the interlace background image as the container grows.
        this.terminalOutput.addEventListener('DOMSubtreeModified', () => {
            // Works best with the scroll into view wrapped in a setTimeout.
            setTimeout(() => this.terminalCmdLine.scrollIntoView(), 0);
        }, false);

        // Focus input
        window.addEventListener('click', () => {
            this.terminalCmdLine.focus();
            this.terminalCmdLine.selectionStart = this.terminalCmdLine.value.length;
            this.terminalCmdLine.selectionEnd = this.terminalCmdLine.value.length;
        }, false);
        this.terminalInputLine.addEventListener('click', e => {
            this.terminalCmdLine.focus();
            e.stopPropagation();
        }, false);
        this.terminalOutput.addEventListener('click', e => e.stopPropagation(), false);

        // Handle up/down key presses for shell history and enter for new command
        this.terminalCmdLine.addEventListener('keydown', e => this.handleInputKeyDown(e), false);
        window.addEventListener('keydown', e => {
            if (document.activeElement !== this.terminalCmdLine) {
                this.terminalCmdLine.focus();
                e.stopPropagation();
                e.preventDefault();
            }
        }, false);
    }

    private start() {
        if (this.options.welcome) {
            this.write(this.options.welcome);
        }
    }


    private async processCommand() {
        const line = this.inputLine;
        this.resetTabCompletion();

        if (line) {
            this.addHistory(line);
        }

        // Duplicate current input and append to output section
        const lineElement = this.terminalCmdLine.parentNode.parentNode.parentNode.parentNode.cloneNode(true) as HTMLElement;
        lineElement.removeAttribute('id');
        lineElement.classList.add('line');
        const inputElement = lineElement.querySelector<HTMLInputElement>('input.cmdline');
        inputElement.autofocus = false;
        inputElement.readOnly = true;
        inputElement.insertAdjacentHTML('beforebegin', inputElement.value);
        inputElement.parentNode.removeChild(inputElement);
        this.terminalOutput.appendChild(lineElement);

        // Hide command line until we're done processing input
        this.terminalInputLine.classList.add('hidden');

        // Clear / set up line for next input
        this.inputLine = '';

        // Parse out command, ergs and trim off whitespace
        let cmd: string;
        let args: string[];
        if (line && line.trim()) {
            args = line.split(' ').filter(x => x);
            cmd = args[0];
            args = args.slice(1);
        }

        if (cmd) {
            let response: string | undefined;
            for (const extension of this.extensions) {
                if (extension.execute) {
                    const result = await Promise.resolve(extension.execute(cmd, args));
                    if (result !== false) {
                        response = result.toString();
                        break;
                    }
                }
            }
            if (response === undefined) {
                response = `${cmd}: command not found`;
            }
            const responseElements = this.write(response);
            if (response === undefined) {
                return;
            }

            // Additional "after execute" handler for post-processing command output
            for (const extension of this.extensions) {
                if (extension.afterExecute) {
                    await Promise.resolve(extension.afterExecute(cmd, args, responseElements));
                }
            }
        }

        // Show the command line
        this.terminalInputLine.classList.remove('hidden');
    }

    private async processTabCompletion() {
        const command = this.inputLine;
        if (command === '' || command.includes(' ')) {
            return;
        }

        this.tabCompletionPrefix = this.tabCompletionPrefix || command;

        for (const extension of this.extensions) {
            if (extension.tabComplete) {
                const result = await Promise.resolve(extension.tabComplete(this.tabCompletionPrefix, this.tabCompletionIndex));
                if (result !== false) {
                    this.inputLine = result.toString();
                    break;
                }
            }
        }

        this.tabCompletionIndex++;
    }

    private resetTabCompletion() {
        this.tabCompletionPrefix = '';
        this.tabCompletionIndex = 0;
    }

    private addHistory(entry: string) {
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        this.history.push(entry);
        localStorage['history'] = JSON.stringify(this.history);
        this.historyPos = this.history.length;
    }


    private async handleInputKeyDown(e: KeyboardEvent) {
        if (e.keyCode == 13) {
            // Enter
            await this.processCommand();
        } else if (e.keyCode == 9) {
            // Tab
            e.preventDefault();
            await this.processTabCompletion();
        } else if (e.keyCode == 27) {
            // Escape
            this.inputLine = '';
            e.stopPropagation();
            e.preventDefault();
        } else if (e.keyCode == 38 || e.keyCode == 40) {
            // Up/down arrow key
            if (this.history.length > 0) {
                let pos = this.historyPos;
                if (pos === this.history.length) {
                    this.historyCurrent = this.inputLine;
                }
                if (e.keyCode == 38) {
                    // Up arrow key
                    pos -= pos > 0 ? 1 : 0;
                } else if (e.keyCode == 40) {
                    // Down arrow key
                    pos += pos < this.history.length ? 1 : 0;
                }

                this.inputLine = this.history[pos] ?? this.historyCurrent;
                this.historyPos = pos;
                this.goToEndOfLine();
                e.preventDefault();
            }
        } else if ((e.keyCode >= 32 && e.keyCode <= 126) || (e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 27)) {
            // Reset tab completion if keypress is valid English character
            // or backspace/delete/escape
            this.resetTabCompletion();
        }
    }
}

export default Terminal;
