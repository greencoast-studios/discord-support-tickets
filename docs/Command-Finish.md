## :pencil2: Description

This command will finish the ticket of the channel it was executed in. In other words, it will delete the channel and save a log of the conversation (if enabled) to a text file in the bot's `log` directory.

**This command can only be executed from a ticket channel.**

## :question: Can Be Used By

Can be used by anyone that has access to the channel it was executed in. This has the following implications:

1. It can be run by anyone anywhere. It will, however, do nothing if it wasn't run in a ticket channel.
2. If it's run from a ticket channel, everyone who has access to it can execute it. This implicitly means that only the staff role and the ticket requester can use it.

## :balloon: Usage

Run this command with the following message:

``` text
$finish
```

## :information_source: Other Information

* [x] The command will work only on guilds.
* [ ] The command is NSFW.
