#priority -65535
#sideonly client

// This script is designed to use with the "ZenScript Brackets Completion" VSCode extension. 
// It dumps all items, fluids, and ore dicts in crafttweaker.log file with the format for the extension.
// This version is for Crafttweaker 1.12.x.

import crafttweaker.item.IItemStack;
import crafttweaker.item.IItemDefinition;
import crafttweaker.liquid.ILiquidDefinition;
import crafttweaker.item.IIngredient;
import crafttweaker.game.IGame;
import crafttweaker.oredict.IOreDict;
import crafttweaker.oredict.IOreDictEntry;

function dumpToString(dict as string[string]) as string{
    var dumpstr="";
    for str1,str2 in dict{
        dumpstr+=(str1~' = '~str2~'\n');
    }
    return dumpstr;
}

//Dumper HEAD MARK
var printstr="[ZSBC DUMPER START]\n";

//Dump Items
val items={} as string[string];
val itemDefinitionList = game.items as IItemDefinition[];
for itemDef in itemDefinitionList{
    val subItems = itemDef.subItems as IItemStack[];
    for item in subItems {
        items[item.commandString]=item.displayName;
    }
}
printstr~="[ITEMS]\n"~dumpToString(items)~"[ITEMS END]\n";

//Dump Fluids
var fluids={} as string[string];
val fluidDefinitionList=game.liquids as ILiquidDefinition[];
for fluidDef in fluidDefinitionList{
    fluids[(fluidDef*1).commandString]=fluidDef.displayName;
}
printstr~="[FLUIDS]\n"~dumpToString(fluids)~"[FLUIDS END]\n";

//Dump OreDicts
var oredicts={} as string[string];
val oredictEntryList=oreDict.entries as IOreDictEntry[];
for oredictEntry in oredictEntryList{
    oredicts[(oredictEntry).commandString]="OreDict: "~oredictEntry.name;
}
printstr~="[ORE_DICTS]\n"~dumpToString(oredicts)~"[ORE_DICTS END]\n";

//Dumper END MARK
printstr~="[ZSBC DUMPER END]";
print(printstr);