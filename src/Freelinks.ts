import { Plugin, TAbstractFile, TFile } from 'obsidian';
import { FreelinksSettingsTab} from './FreelinksSettingsTab';

interface FreelinksSettings {
	deleteVoidLinks: boolean;
}

const DEFAULT_SETTINGS: FreelinksSettings = {
	deleteVoidLinks: false,
};

export class Freelinks extends Plugin {
	settings: FreelinksSettings;
	private lock = false;
	private store: Map<string, string>;
	private linkMatch = /\[\[(.+?)\]\]/gm;

	async onload() {
		await this.loadSettings();

		const filenames = this.app.vault
			.getMarkdownFiles()
			.map(file => ([file.basename, file.path] as [string, string]));

		this.store = new Map(filenames);

		this.registerEvent(this.app.vault.on('create', this.handleCreate, this));
		this.registerEvent(this.app.vault.on('rename', this.handleRename, this));
		this.registerEvent(this.app.vault.on('delete', this.handleDelete, this));
		this.registerEvent(this.app.vault.on('modify', this.handleModify, this));
		this.registerEvent(this.app.workspace.on('file-open', this.handleOpenFile, this));

		this.addSettingTab(new FreelinksSettingsTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private isFile(item: TAbstractFile): item is TFile {
		return 'basename' in item;
	}

	private handleCreate(file: TAbstractFile): void {
		if (!this.isFile(file)) { return }

		this.store.set(file.basename, file.path);
	}

	private handleDelete(file: TAbstractFile): void {
		if (!this.isFile(file)) { return }
		
		this.store.delete(file.basename);
	}

	private handleRename(file: TAbstractFile, oldPath: string): void {
		if (!this.isFile(file)) { return }

		for (const [basename, path] of this.store.entries()) {
			if (path === oldPath) {
				this.store.delete(basename);
				this.store.set(file.basename, file.path);

				break;
			}
		}
	}

	private async handleModify(file: TAbstractFile): Promise<void> {
		if (!this.isFile(file)) { return }
		if (this.lock) { return }

		this.lock = true;
		await this.parseFile(file);
		this.lock = false;
	}

	private async handleOpenFile(file: TFile | null): Promise<void> {
		if (!file) { return }

		await this.parseFile(file);
	}

	private buildTitleMatch(str: string): RegExp {
		return new RegExp(`(?<!\\[)\\b${str}\\b(?![\\w\\s]*[\\]])`, 'g');
	}

	private async parseFile(file: TFile): Promise<void> {
		let fileContents = await this.app.vault.read(file);

		for (const basename of this.store.keys()) {
			if (basename === file.basename) { continue }

			fileContents = fileContents.replaceAll(this.buildTitleMatch(basename), `[[${basename}]]`);
		}

		if (this.settings.deleteVoidLinks) {
			[...fileContents.matchAll(this.linkMatch)].forEach(([link, word]) => {
				if (!this.store.has(word)) {
					fileContents = fileContents.replaceAll(link, word);
				}
			});
		}

		await this.app.vault.modify(file, fileContents);
	}
}
