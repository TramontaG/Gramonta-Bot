import { Args, Module } from '../ModulesRegister';

type Command = (args: Args) => Promise<any>;

class SingleCommandModule extends Module {
	constructor(command: Command, instance: Module) {
		super();
		this.registerPublicMethod({
			name: 'default',
			method: command.bind(instance),
		});
	}
}

export default SingleCommandModule;
