#priority -65535
#sideonly client
import crafttweaker.api.game.MCGame;
import crafttweaker.api.item.IItemStack;
import crafttweaker.api.tag.TagManager;

// This script is designed to use with the "ZenScript Brackets Completion" VSCode extension. 
// It dumps all items, fluids, and ore dicts in crafttweaker.log file with the format for the extension.
// This version is for Crafttweaker on MC1.16.x. The 'crafttweaker.log' is in '.minecraft/logs/' in this version.
// Currently dumpable: Items, Blocks, Fluids, DirectionAxises, Entitytypes, EntityClassifications, Effects, Potions, VillagerPofessions
// Dumpable Tags: Items, Blocks, Fluids, Entitytypes


function dumpToString(dict as string[string]) as string{
    var dumpstr="";
    for str1,str2 in dict{
        dumpstr+=(str1+' = '+str2+'\n');
    }
    return dumpstr;
}
//Dumper HEAD MARK
var printstr="[ZSBC DUMPER START]\n";


//For the following sections, you can disable each section by simply commenting it out.

//Dump Items
val items={} as string[string];
val itemDefinitionList = game.items;
for item in itemDefinitionList{
    items[item.commandString]=item.displayName;
}
printstr+="[ITEMS]\n"+dumpToString(items)+"[ITEMS END]\n";

//Dump Fluids
val fluids={} as string[string];
val fluidDefinitionList = game.fluids;
for fluid in fluidDefinitionList{
    fluids[fluid.commandString]=fluid.makeStack(1000).registryName;
}
printstr+="[FLUIDS]\n"+dumpToString(fluids)+"[FLUIDS END]\n";

//Dump Blocks
val blocks={} as string[string];
val blockDefinitionList = game.blocks;
for block in blockDefinitionList{
    blocks[block.commandString]=game.localize(block.translationKey);
}
printstr+="[BLOCKS]\n"+dumpToString(blocks)+"[BLOCKS END]\n";

//Dump Blockstates  Disabled due to huge lag
// val blockstates={} as string[string];
// val blockstateDefinitionList = game.blockStates;
// for blockstate in blockstateDefinitionList{
//     blockstates[blockstate.commandString]=game.localize(blockstate.block.translationKey);
// }
// printstr+="[BLOCKSTATES]\n"+dumpToString(blockstates)+"[BLOCKSTATES END]\n";

//Dump DirectionAxis
val directionaxises={} as string[string];
val directionaxisDefinitionList = game.directionAxises;
for directionaxis in directionaxisDefinitionList{
    directionaxises[directionaxis.commandString]=directionaxis.name;
}
printstr+="[DIRECTIONAXIS]\n"+dumpToString(directionaxises)+"[DIRECTIONAXIS END]\n";

//Dump EntityTypes
val entitytypes={} as string[string];
val entitytypeDefinitionList = game.entityTypes;
for entitytype in entitytypeDefinitionList{
    entitytypes[entitytype.commandString]=entitytype.name;
}
printstr+="[ENTITYTYPES]\n"+dumpToString(entitytypes)+"[ENTITYTYPES END]\n";

//Dump EntityClassifications
val entityclassifications={} as string[string];
val entityclassificationDefinitionList = game.entityClassifications;
for entityclassification in entityclassificationDefinitionList{
    entityclassifications[entityclassification.commandString]=entityclassification.name;
}
printstr+="[ENTITYCLASSIFICATIONS]\n"+dumpToString(entityclassifications)+"[ENTITYCLASSIFICATIONS END]\n";

//Dump Effects
val effects={} as string[string];
val effectDefinitionList = game.effects;
for effect in effectDefinitionList{
    effects[effect.commandString]=game.localize(effect.name);
}
printstr+="[EFFECTS]\n"+dumpToString(effects)+"[EFFECTS END]\n";

//Dump Potions
val potions={} as string[string];
val potionDefinitionList = game.potions;
for potion in potionDefinitionList{
    potions[potion.commandString]=potion.getNamePrefixed("");
}
printstr+="[POTIONS]\n"+dumpToString(potions)+"[POTIONS END]\n";

//Dump VillagerProfessions
val villagerprofessions={} as string[string];
val villagerprofessionDefinitionList = game.villagerProfessions;
for villagerprofession in villagerprofessionDefinitionList{
    villagerprofessions[villagerprofession.commandString]=villagerprofession.name;
}
printstr+="[VILLAGERPROFESSIONS]\n"+dumpToString(villagerprofessions)+"[VILLAGERPROFESSIONS END]\n";

//Dump Enchantments Disabled due to not able to get command string
// val enchantments={} as string[string];
// val enchantmentDefinitionList = game.enchantments;
// for enchantment in enchantmentDefinitionList{
//     enchantments[enchantment.name]=enchantment.name;
// }
// printstr+="[ENCHANTMENTS]\n"+dumpToString(enchantments)+"[ENCHANTMENTS END]\n";


import crafttweaker.api.item.MCItemDefinition;
import crafttweaker.api.tag.TagManagerItem;

//Dump Item Tags
val itemtags={} as string[string];
val itemTagsList = <tag:items:minecraft:planks>.manager.getAllTags();
for tag in itemTagsList{
    var labelstrI=" Item Tag: ";
    for item in tag.getElements(){
        labelstrI+=(item.getDefaultInstance().displayName+", ");
    }
    itemtags[tag.commandString]=labelstrI;
}
printstr+="[ITEM TAGS]\n"+dumpToString(itemtags)+"[ITEM TAGS END]\n";

//Dump Block Tags
val blocktags={} as string[string];
val blockTagsList = <tag:blocks:minecraft:planks>.manager.getAllTags();
for tag in blockTagsList{
    var labelstrB=" Block Tag: ";
    for block in tag.getElements(){
        labelstrB+=(game.localize(block.translationKey)+", ");
    }
    blocktags[tag.commandString]=labelstrB;
}
printstr+="[BLOCK TAGS]\n"+dumpToString(blocktags)+"[BLOCK TAGS END]\n";


//Dump Fluid Tags
val fluidtags={} as string[string];
val fluidTagsList = <tag:fluids:minecraft:water>.manager.getAllTags();
for tag in fluidTagsList{
    var labelstrF=" Fluid Tag: ";
    for fluid in tag.getElements(){
        labelstrF+=(fluid.makeStack(1000).registryName);
        labelstrF+=", ";
    }
    fluidtags[tag.commandString]=labelstrF;
}
printstr+="[FLUID TAGS]\n"+dumpToString(fluidtags)+"[FLUID TAGS END]\n";


//Dump Entitytype Tags
val entitytypetags={} as string[string];
val entitytypeTagsList = <tag:entity_types:minecraft:arrows>.manager.getAllTags();
for tag in entitytypeTagsList{
    var labelstrE=" Entitytype Tag: ";
    for entitytype in tag.getElements(){
        labelstrE+=(entitytype.name+", ");
    }
    entitytypetags[tag.commandString]=labelstrE;
}
printstr+="[ENTITYTYPE TAGS]\n"+dumpToString(entitytypetags)+"[ENTITYTYPE TAGS END]\n";


printstr+="[ZSBC DUMPER END]";
print(printstr);