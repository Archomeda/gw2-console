import { injectable } from 'tsyringe';
import ICommand from './icommand'
import Commands from '.';

@injectable()
export default class Help implements ICommand {
    constructor(private commands: Commands) { }

    get name() { return 'help'; }

    execute() {
        return `Available commands: ${this.commands.list.map(x => x.name).sort().join(', ')}.`;
    }
}
