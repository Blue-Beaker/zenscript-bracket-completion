import * as vscode from 'vscode';
import { readFileSync, existsSync, writeFile, mkdir } from 'fs';
import * as pathlib from "path";
import { outputChannel,workspaceStoragePath } from './extension';

export class DataHandler{
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
                vscode.window.showErrorMessage("File not found at " + path + ".\nCheck your path settings.");
                rej(new Error("File not found at " + path + ".\nCheck your path settings."));
            } else {
                res(readFileSync(path, {encoding:"utf-8"}));
            }
        });
    }
    //Parse a block of our dumped data.
    private parseItemsFromLines(lines:string[]) {
        this.items=new Map();
        for (var i=0;i<lines.length;i++){
            var split=lines[i].split(" = ",2);
            if (split.length>=2){
                this.items.set(split[0],split[1]);
            }
        }
        outputChannel.appendLine("Loaded "+this.items.size+" entries!");
    }
    private findDumpRange(lines:string[]) {
        var startindex:number|undefined=undefined;
        var endindex:number|undefined=undefined;
        for (var i=lines.length-1;i>=0;i--) {
            if(lines[i].indexOf("[ZSBC DUMPER END]")>=0){
                endindex=i;
                outputChannel.appendLine("Found "+lines[i]+" at line "+i);
            }
            if(endindex){
                if(lines[i].indexOf("[ZSBC DUMPER START]")>=0){
                    startindex = i;
                    outputChannel.appendLine("Found "+lines[i]+" at line "+i);
                    return [startindex,endindex];
                }
            }
        }
        return [startindex,endindex];
    }
    //Reload lines from Crafttweaker Log, which has our dumped data in it.
    public async loadItemsFromCrafttweakerLog(path: string) {
        try {
            outputChannel.appendLine("Trying to load from CT log");
            const content = await this.getContent(path);
            const lines = content.split(/\r?\n/);
            var indexes=this.findDumpRange(lines);
            var startindex=indexes[0];
            var endindex=indexes[1];
            if(startindex&&endindex){
                outputChannel.appendLine("Found dumped data in CT log:");
                const datalines=lines.slice(startindex+1,endindex);
                this.parseItemsFromLines(datalines);
                if(workspaceStoragePath){
                    this.saveCache(workspaceStoragePath,datalines);
                }
                return datalines;
            }else{
                vscode.window.showErrorMessage("Can't find dumped data in '"+path+"'! Is ZSBC Dumper working correctly?");
                return false;
            }
        } catch (e) {
            vscode.window.showErrorMessage(String(e));
            return false;
        }
    }

    private addAdditionalListToItems(lines:string[])   {
        var count=0;
        for (var i=0;i<lines.length;i++){
            if(lines[i].trim().startsWith("<")){
                var split=lines[i].split(" = ",2);
                if(!this.items.has(split[0])){
                    this.items.set(split[0],split[1]||"");
                    count++;
                }
            }
        }
        outputChannel.appendLine("Loaded "+count+" additional entries from auxliary list!");
    }
    public async loadAdditionalList(path:string){
        try {
            var path=pathlib.resolve(path);
            outputChannel.appendLine("loading from auxliary list at "+path);
            const content = await this.getContent(path);
            const lines = content.split(/\r?\n/);
            this.addAdditionalListToItems(lines);
            return true;
        } catch (error) {
            outputChannel.error(String(error));
            return false;
        }
    }
    public async saveCache(path:vscode.Uri,lines:string[]){
        try {
            mkdir(path.fsPath,{recursive:true},()=>{});
            var cachepath=pathlib.resolve(path.fsPath,"zsbc_cache.list");
            writeFile(cachepath,lines.join("\n"),()=>{
                outputChannel.info("Saved cache to "+cachepath);
            });
        }catch(e){
            outputChannel.error(String(e));
        }
    }
    public async loadCache(path:vscode.Uri|undefined){
        if(path){
            try {
                var cachepath=pathlib.resolve(path.fsPath,"zsbc_cache.list");
                outputChannel.appendLine("loading from cache at "+cachepath);
                const content = await this.getContent(cachepath);
                const lines = content.split(/\r?\n/);
                this.parseItemsFromLines(lines);
                return true;
            } catch (error) {
                outputChannel.error(String(error));
                return false;
            }
        }else{
            return false;
        }
    }
}