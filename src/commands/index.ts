import { container, InjectionToken } from 'tsyringe';
import ICommand from './icommand';

export class Commands {
    private tokens: { [key: string]: InjectionToken<ICommand> } = {};

    get list(): ICommand[] {
        return Object.values(this.tokens).map(x => container.resolve(x));
    }

    get(id: string): ICommand | undefined {
        const token = this.tokens[id];
        if (token) {
            return container.resolve<ICommand>(token);
        }
    }

    add(commandToken: InjectionToken<ICommand>) {
        const command = container.resolve(commandToken);
        this.tokens[command.name] = commandToken;
    }
}

export default Commands;
