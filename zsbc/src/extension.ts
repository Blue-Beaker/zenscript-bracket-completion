// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataHandler } from "./datareader";
import * as itemSearcher from "./itemSearcher";

export var workspaceStoragePath: vscode.Uri | undefined;
export const outputChannel = vscode.window.createOutputChannel("Zenscript Bracket Completion", { log: true });
const reader = new DataHandler();
// The extension will activate on "properties","toml","json","mcfunction","zenscript", "javascript", "typescript" languages.
export function activate(context: vscode.ExtensionContext) {
	outputChannel.show(true);
	workspaceStoragePath = context.storageUri;

	context.subscriptions.push(vscode.commands.registerCommand('zsbc.reload', () => {
		doReloadFromPath();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('zsbc.search', () => {
		itemSearcher.showItemSearcher();
	}));
	initReload();
	/**Autocompletion providers */ 
	const completionProviderZS: vscode.CompletionItemProvider<vscode.CompletionItem> = {
		provideCompletionItems(document, position, token, context) {
			var configuration = vscode.workspace.getConfiguration("zsbc");
			if (configuration.onlyCompleteBrackets) {
				var range = document.getWordRangeAtPosition(position, /<[\w\-:\.]+>?/);
			} else {
				var range = document.getWordRangeAtPosition(position, /<?[\w\-:\.]+>?/);
			}
			if (!range) { outputChannel.appendLine(String(range)); return; }
			var matchrange = range?.with(undefined, position);
			outputChannel.appendLine("Finding completion entries for " + document.getText(matchrange));
			var completion: vscode.CompletionItem[] = [];
			reader
				.getItems().forEach((value, key, map) => {
					if (!configuration.completionSuggestAllItems) {
						var match = document.getText(matchrange);
						if ((configuration.completionSuggestWithStart && !key.startsWith(match)) || key.indexOf(match.slice(1)) === -1) { return; }
					}
					completion.push({ label: { label: key, detail: " " + value }, detail: value, kind: vscode.CompletionItemKind.Value, range: range } as vscode.CompletionItem);
				});
			return completion;
		},
	};
	const completionProvider: vscode.CompletionItemProvider<vscode.CompletionItem> = {
		provideCompletionItems(document, position, token, context) {
			var configuration = vscode.workspace.getConfiguration("zsbc");
			var range = document.getWordRangeAtPosition(position, /<?[\w\-:\.]+>?/);
			if (!range) { return; }
			var matchrange = range?.with(undefined, position);
			outputChannel.appendLine("Finding completion entries for " + document.getText(matchrange));
			var completion: vscode.CompletionItem[] = [];
			reader
				.getItems().forEach((value, key, map) => {
					var id = (key.match(/<(.*)>/) || "")[1];
					var nbt = (key.match(/withTag\((.*)\)/) || "")[1];
					key = id + (nbt || "");
					if (!configuration.completionSuggestAllItems) {
						var match = document.getText(matchrange);
						if ((configuration.completionSuggestWithStart && !key.startsWith(match)) || key.indexOf(match.slice(1)) === -1) { return; }
					}
					completion.push({ label: { label: key, detail: " " + value }, detail: value, kind: vscode.CompletionItemKind.Value, range: range } as vscode.CompletionItem);
				});
			return completion;
		},
	};
	/**Hover providers */ 
	const hoverProviderZS: vscode.HoverProvider = {
		provideHover(document, position, token) {
			var range = document.getWordRangeAtPosition(position, /<[\w\-:\.]+>(\.withTag\(.*\))?/);
			if (!range) { return; }
			var str = document.getText(range).replace(":0", "");
			var result = reader.getItems().get(str);
			if (!result) { return; }
			return new vscode.Hover(result, range);
		},
	};
	const hoverProvider: vscode.HoverProvider = {
		provideHover(document, position, token) {
			var range = document.getWordRangeAtPosition(position, /[\w\-:\.]+(@[0-9]+)?/);
			if (!range) { return; }
			var str = document.getText(range).replace("@", ":").replace(":0", "");
			var result = reader.getItems().get("<" + str + ">");
			if (!result) { return; }
			return new vscode.Hover(result, range);
		},
	};
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider("zenscript", completionProviderZS),
		vscode.languages.registerHoverProvider("zenscript", hoverProviderZS),
	);
	const langs = ["properties", "toml", "json", "mcfunction", "javascript", "ini"];
	for (const language of langs) {
		context.subscriptions.push(
			vscode.languages.registerCompletionItemProvider({ language }, completionProvider),
			vscode.languages.registerHoverProvider({ language }, hoverProvider)
		);
	};
}
/**Try to find crafttweaker log in the workspace when it's not configured. */
async function findCrafttweakerLog() {
	var ctLogs = await vscode.workspace.findFiles('**/crafttweaker.log', null, 1);
	if (ctLogs.length > 0) {
		return ctLogs[0].fsPath;
	}
	else {
		return null;
	}
}
/**Reload crafttweaker log. */
async function reloadFromPath() {
	const path = vscode.workspace.getConfiguration("zsbc").path;
	if (path.length > 0) {
		return await reader.loadItemsFromCrafttweakerLog(path);
	} else {
		outputChannel.info("No path for crafttweaker.log configured, checking default paths for it");
		var path2 = await findCrafttweakerLog();
		if(path2!==null){
			outputChannel.info("Found crafttweaker.log at "+path2);
			return await reader.loadItemsFromCrafttweakerLog(path2);
		}
	}
	return false;
}

async function loadFromCache() {
	return await reader.loadCache(workspaceStoragePath);
}

async function initReload() {
	var result;
	if (vscode.workspace.getConfiguration("zsbc").alwaysReload) {
		result = await tryReloadFirst();
	} else {
		result = await tryLoadCacheFirst();
	}
	await postReload();
	return result;
}
async function doReloadFromPath() {
	await reloadFromPath();
	await postReload();
}

async function postReload() {
	await tryLoadAdditionalList();
	await itemSearcher.setRegistries(reader.getItems());
}
async function tryLoadCacheFirst() {
	if (!await loadFromCache()) {
		outputChannel.info("Can't load cache, loading from CT log");
		return await reloadFromPath();
	}
}
async function tryReloadFirst() {
	if (!await reloadFromPath()) {
		outputChannel.info("Can't load from CT log, loading cache");
		return await loadFromCache();
	}
}
async function tryLoadAdditionalList() {
	var additionalPath = vscode.workspace.getConfiguration("zsbc").additional_path;
	if (additionalPath.length > 0) {
		outputChannel.appendLine("Loading additional entries from " + additionalPath);
		if (!await reader.loadAdditionalList(additionalPath)) {
			vscode.window.showErrorMessage("Can't load additional data in '" + additionalPath + "'!");
			return false;
		}
		return true;
	}
}
// This method is called when your extension is deactivated
export function deactivate() { }
