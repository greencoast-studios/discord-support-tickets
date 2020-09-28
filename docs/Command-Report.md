## :pencil2: Description

This command will toggle the sending error stacks to the owner. When enabled, the bot will send the error stack to the owner via DM whenever an error happens during command execution.

> **Note**: If enabled, error reporting will be sent to the bot's owner, not the server owner. If your bot instance is in multiple servers, you will receive errors that have been triggered in all those servers (if they have enabled the option). Keep in mind that only the bot's owner can run this command, meaning that you will not need to worry about getting spammed with errors coming from other servers.

> Ideally you shouldn't receive any errors. They only serve as a way to tell when something goes wrong. If you do receive these error reports, please create a [bug report](https://github.com/greencoast-studios/discord-support-tickets/issues).

## :question: Can Be Used By

Can be used only by the owner.

## :balloon: Usage

Run this command with the following message:

``` text
$report <toggle>
```

### :pushpin: Arguments

1. **\<toggle\>**: Whether the error stack report should be enabled or not. Accepted values: `enable` and `disable`.

## :information_source: Other Information

* [ ] The command will work only on guilds.
* [ ] The command is NSFW.
