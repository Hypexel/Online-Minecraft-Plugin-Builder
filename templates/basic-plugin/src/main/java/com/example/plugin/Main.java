package com.example.plugin;


import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.Bukkit;


public final class Main extends JavaPlugin {
@Override
public void onEnable() {
getLogger().info("Web IDE example plugin enabled!");
// example command registration
this.getCommand("webhello").setExecutor((sender, command, label, args) -> {
sender.sendMessage("Hello from Web IDE plugin!");
return true;
});
}


@Override
public void onDisable() {
getLogger().info("Web IDE example plugin disabled!");
}
}
