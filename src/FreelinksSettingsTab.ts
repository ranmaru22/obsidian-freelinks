import { PluginSettingTab, App, Setting } from 'obsidian';
import { Freelinks } from './Freelinks';

export class FreelinksSettingsTab extends PluginSettingTab {
	plugin: Freelinks;

	constructor(app: App, plugin: Freelinks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Freelinks' });

		new Setting(containerEl)
			.setName('Delete links to non-existing files')
			.setDesc("When this is set, all links that point to files which don't exist, will be automatically deleted.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.deleteVoidLinks)
				.onChange(async value => {
					this.plugin.settings.deleteVoidLinks = value;
					await this.plugin.saveSettings();
				}));
	}
}
