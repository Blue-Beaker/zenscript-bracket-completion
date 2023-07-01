import * as vscode from 'vscode';
import { readFileSync, existsSync } from 'fs';
import * as pathlib from "path";
import { outputChannel } from './extension';

export class DataReader{
    private items:Map<string,string>=new Map();
    public getItems(): Map<string,string> {
        return this.items;
    }
    private getContent(path: string): Promise<string> {
        return new Promise((res, rej) => {
            for (const folder of vscode.workspace.workspaceFolders || []) {
                const fullPath = pathlib.resolve(folder.uri.fsPath, path);
                if (existsSync(fullPath)) {
                    res(readFileSync(fullPath, {encoding:"utf-8"}));
                    return;
                }
            }
            if (!existsSync(path)) {
                vscode.window.showErrorMessage("No crafttweaker log file not found at " + path);
                rej(new Error("notfound"));
            } else {
                res(readFileSync(path, {encoding:"utf-8"}));
            }
        });
    }
    public async loadItemsFromCrafttweakerLog(path: string) {
        try {
            outputChannel.appendLine("ZSBC is loading");
            const content = await this.getContent(path);
            const lines = content.split(/\r?\n/);
            var startindex:number|undefined=undefined;
            var endindex:number|undefined=undefined;
            for (var i=0;i<lines.length;i++) {
                if(lines[i].indexOf("[ZSBC DUMPER START]")>=0){
                    startindex = i;
                }
                if(lines[i].indexOf("[ZSBC DUMPER END]")>=0){
                    endindex=i;
                }
                if(startindex&&endindex){
                    break;
                }
            }
            if(startindex&&endindex){
                outputChannel.appendLine("Found dumped data in crafttweaker log, using that");
                outputChannel.appendLine("Found "+lines[startindex]+" at line "+startindex);
                outputChannel.appendLine("Found "+lines[endindex]+" at line "+endindex);
                this.items=new Map();
                for (var i=startindex+1;i<endindex;i++){
                    var split=lines[i].split(" = ",2);
                    if (split.length>=2){
                        this.items.set(split[0],split[1]);
                    }
                }
                outputChannel.appendLine("Loaded "+this.items.size+" entries!");
            }else{
                vscode.window.showErrorMessage("Can't find dumped data! Is ZSBC Dumper working correctly?" + path);
            }
        } catch (e) {
            outputChannel.error(String(e));
            return [];
        }
    }
}