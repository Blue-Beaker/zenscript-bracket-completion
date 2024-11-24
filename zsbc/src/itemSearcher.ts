import * as vscode from 'vscode';
import { outputChannel,workspaceStoragePath } from './extension';
var registries:vscode.QuickPickItem[] = [];
export async function setRegistries(registryMap:Map<string,string>){
    registries=[];
    registryMap.forEach((value,key,map)=>{
        registries.push({label:value,description:key});
    });
}
export async function showItemSearcher(){
    var result = await vscode.window.showQuickPick(registries,{title:"Item Searcher",placeHolder:"Pick an item to insert",canPickMany:false});
    if(!result || !result.description){return;}
    var editor = vscode.window.activeTextEditor;
    editor?.insertSnippet(new vscode.SnippetString(result.description));
}