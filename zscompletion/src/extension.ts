// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {DataReader} from "./datareader";

const reader = new DataReader();
export const outputChannel = vscode.window.createOutputChannel("ZSBC Output",{log: true});
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zsbc" is now active!');
	const outputChannel = vscode.window.createOutputChannel("ZSBC Output",{log: true});
	outputChannel.show();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('zsbc.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from zsbc!');
	});
	context.subscriptions.push(disposable);
	outputChannel.show();
	const logpath:string=vscode.workspace.getConfiguration('zsbc').path;
	reader.loadItemsFromCrafttweakerLog(logpath);
	
	const provider: vscode.CompletionItemProvider<vscode.CompletionItem> = {
		provideCompletionItems(document, position, token, context) {
			var completion:vscode.CompletionItem[]=[];
		  	reader
			.getItems().forEach((value,key,map)=>{completion.push({label:{label:key,detail:" "+value},detail:value,kind:vscode.CompletionItemKind.Value} as vscode.CompletionItem);});
			return completion;
		},
	  };
	
	  const langs = ["zenscript", "javascript", "typescript"];
	  for (const language of langs) {
		context.subscriptions.push(
		  vscode.languages.registerCompletionItemProvider({ language }, provider)
		);
	  }
}

function reloadFromPath() {
	const path = vscode.workspace.getConfiguration("tmmi").path;
	reader.loadItemsFromCrafttweakerLog(path);
  }
// This method is called when your extension is deactivated
export function deactivate() {}
