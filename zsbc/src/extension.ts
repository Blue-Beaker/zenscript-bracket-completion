// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {DataHandler} from "./datareader";

export var workspaceStoragePath:vscode.Uri|undefined;
export const outputChannel = vscode.window.createOutputChannel("Zenscript Bracket Completion",{log: true});
const reader = new DataHandler();
// The extension will activate on "properties","toml","json","mcfunction","zenscript", "javascript", "typescript" languages.
export function activate(context: vscode.ExtensionContext) {
	outputChannel.show(true);
	workspaceStoragePath=context.storageUri;
	
	context.subscriptions.push(vscode.commands.registerCommand('zsbc.reload', () => {
		doReloadFromPath();
	}));
	initReload();
	// Autocompletion provider
	const completionProvider: vscode.CompletionItemProvider<vscode.CompletionItem> = {
		provideCompletionItems(document, position, token, context) {
			var configuration=vscode.workspace.getConfiguration("zsbc");
			var range=document.getWordRangeAtPosition(position,/[<>\w\-:]+/);
			if(configuration.onlyCompleteBrackets && !document.getText(range).startsWith("<")){
				return undefined;
			}
			var completion:vscode.CompletionItem[]=[];
		  	reader
			.getItems().forEach((value,key,map)=>{
				if(!configuration.completionSuggestAllItems){
					var match=document.getText(range);
					if((configuration.completionSuggestWithStart&&!key.startsWith(match))||key.indexOf(match.slice(1))===-1){return;}
				}
				completion.push({label:{label:key,detail:" "+value},detail:value,kind:vscode.CompletionItemKind.Value,range:range} as vscode.CompletionItem);
			});
			return completion;
		},
	  };
	  const hoverProvider: vscode.HoverProvider = {
		provideHover(document, position, token) {
			var range=document.getWordRangeAtPosition(position,/[\w\-:]+/);
			var str = document.getText(range);
			var result=reader.getItems().get("<"+str+">");
			return new vscode.Hover(result||"",range);
		},
	  };

	  const langs = ["properties","toml","json","mcfunction","zenscript", "javascript"];
	  for (const language of langs) {
		context.subscriptions.push(
		  vscode.languages.registerCompletionItemProvider({ language }, completionProvider),
		  vscode.languages.registerHoverProvider({ language }, hoverProvider)
		);
	  };


}
async function reloadFromPath() {
	const path = vscode.workspace.getConfiguration("zsbc").path;
	if (path.length>0){
		return await reader.loadItemsFromCrafttweakerLog(path);
	}
	return false;
}

async function loadFromCache() {
	return await reader.loadCache(workspaceStoragePath);
}

async function initReload() {
	var result;
	if(vscode.workspace.getConfiguration("zsbc").alwaysReload){
		result=await tryReloadFirst();
	}else{
		result=await tryLoadCacheFirst();
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
}
async function tryLoadCacheFirst(){
	if(!await loadFromCache()){
		outputChannel.info("Can't load cache, loading from CT log");
		return await reloadFromPath();
	}
}
async function tryReloadFirst() {
	if(!await reloadFromPath()){
		outputChannel.info("Can't load from CT log, loading cache");
		return await loadFromCache();
	}
}
async function tryLoadAdditionalList() {
	var additionalPath=vscode.workspace.getConfiguration("zsbc").additional_path;
	if(additionalPath.length>0){
		outputChannel.appendLine("Loading additional entries from "+additionalPath);
		if(!await reader.loadAdditionalList(additionalPath)){
			vscode.window.showErrorMessage("Can't load additional data in '"+additionalPath+"'!");
			return false;
		}
		return true;
	}
}
// This method is called when your extension is deactivated
export function deactivate() {}
