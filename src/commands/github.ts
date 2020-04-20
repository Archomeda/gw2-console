import { injectable } from 'tsyringe';
import ICommand from './icommand'

@injectable()
export default class Github implements ICommand {
    get name() { return 'github'; }

    execute() {
        return `The GitHub repository can be found at <a href='https://github.com/Archomeda/gw2-console' target='_blank'>github.com/Archomeda/gw2-console</a>.`;
    }
}
