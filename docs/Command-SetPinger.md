## :pencil2: Description

This command will update the message that will be sent to the newly created ticket channel. It should generally be set to a message that pings the staff role.

The message included may have the following templates:

1. `{user_mention}`
2. `{staff_mention}`

Use these to add this information to the pinger message.

> **Note**: this message will be set only for the current guild.

## :question: Can Be Used By

Can be used by any member with the `MANAGE_MESSAGES` permission.

## :balloon: Usage

Run this command with the following message:

``` text
$setpinger This is my new pinger message!
```

The bot will now send `This is my new pinger message!` every time a new ticket is created.

``` text
$presence hey {user_mention}, {staff_mention} will be there shortly!
```

This will set the bot's pinger message to: `hey @user, @staff will be there shortly!`.

### :pushpin: Arguments

1. **\<text\>**: the text that will be used as the bot's pinger message for this guild.

## :information_source: Other Information

* [x] The command will work only on guilds.
* [ ] The command is NSFW.
