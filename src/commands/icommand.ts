export default interface ICommand {
    readonly name: string;
    execute(args: string[]): void | string | Promise<void | string>;
}
