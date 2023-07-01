# ZenScript Bracket Completion

A vscode extension that handles autocompletion for ZenScript bracket handlers for your modded Minecraft instance.

## Features

* Generate data from YOUR Minecraft instance!

    [dumper_112.zs](dumper_112.zs)

* Autocompletion of BracketHandlers

    ![images/completion.png](images/completion.png)
    ![images/completion.gif](images/completion.gif)

* Show hover information for BracketHandlers

    ![images/hover.png](images/hover.png)  
    ![images/hover.gif](images/hover.gif)


## Extension Settings

This extension contributes the following settings:

* `zsbc.alwaysReload`: Prefer reloading from crafttweaker log every time. When set to false, only reload when cache is missing.
* `zsbc.path`: Point to your `crafttweaker.log`. Normally it's directly in your `.minecraft` folder.
* `zsbc.ctapi`: CraftTweaker version to use. Currently does nothing.

## Setup
1. Install Crafttweaker on your Minecraft instance.
2. Copy one `dumper_xxx.zs` script (the one that matchs your Minecraft version) from this repository, to `.minecraft/scripts/` folder. Create the folder if it isn't there.
3. Launch Minecraft with CraftTweaker and the script loaded at least once.
4. Configure `zsbc.path` in VSCode workspace preferences, point it to your `crafttweaker.log`.