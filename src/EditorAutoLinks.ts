import {
	ViewUpdate,
	PluginValue,
	EditorView,
	ViewPlugin,
	WidgetType,
	Decoration,
	DecorationSet,
	PluginSpec,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';


export class Freelink extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("span");
		div.classList.add('cm-hmd-internal-link');
		div.innerText = "👉";
		return div;
	}
}

class EditorAutoLinks implements PluginValue {
	decorations: DecorationSet;
	store?: Map<string, string>;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() { }

	private buildDecorations(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from, to, enter(node) {
					if (node.type.name.startsWith('list')) {
						console.log(node.type.name);
						builder.add(node.from - 2, node.from - 1, Decoration.replace({ widget: new Freelink() }));
					}
				}
			})
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<EditorAutoLinks> = {
  decorations: (value: EditorAutoLinks) => value.decorations,
};

export const editorAutoLinks = ViewPlugin.fromClass(
	EditorAutoLinks,
	pluginSpec
);
