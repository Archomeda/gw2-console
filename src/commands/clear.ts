import { injectable } from 'tsyringe';
import ICommand from './icommand'
import Console from '../console';

@injectable()
export default class Clear implements ICommand {
    constructor(private console: Console) { }

    get name() { return 'clear'; }

    execute() {
        this.console.terminal.clear();
    }
}
