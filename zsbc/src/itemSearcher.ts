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
    var result = await vscode.window.showQuickPick(registries,{title:"Item Searcher",placeHolder:"Pick an item to insert",matchOnDescription:true,canPickMany:false});
    if(!result || !result.description){return;}
    var editor = vscode.window.activeTextEditor;
    editor?.insertSnippet(new vscode.SnippetString(result.description));
}
export async function showItemSearcherMulti(){
    var result = await vscode.window.showQuickPick(registries,{title:"Item Searcher",placeHolder:"Pick an item to insert",matchOnDescription:true,canPickMany:true});
    if(result===null || result?.length===0){return;}
    var editor = vscode.window.activeTextEditor;

    var items:string[] = [];
    result?.forEach((item)=>{
        if(item.description){
            items.push(item.description);
        }
    });
    editor?.insertSnippet(new vscode.SnippetString(items.join(",\n")));
}