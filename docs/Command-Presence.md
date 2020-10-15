## :pencil2: Description

This command will update the bot's presence/activity message.

The message included may have the following templates:

1. `{tickets}`
2. `{guilds}`

Use these to add this information to the presence message.

> **Note**: This will update the presence in all the servers. If your bot is connected to multiple servers, make sure to not set the presence to any sort of personal information.

## :question: Can Be Used By

Can be used only be the owner.

## :balloon: Usage

Run this command with the following message:

``` text
$presence This is my new presence!
```

This will set the bot's presence to: `This is my new presence!`.

``` text
$presence {tickets} tickets in {guilds} servers!
```

This will set the bot's presence to: `2 tickets in 3 servers` if the bot currently has 2 tickets open across all servers and is connected to 3 different servers.

### :pushpin: Arguments

1. **\<text\>**: The text that will be used as the bot's presence.

## :information_source: Other Information

* [ ] The command will work only on guilds.
* [ ] The command is NSFW.
