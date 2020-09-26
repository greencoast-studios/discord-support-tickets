## :pencil2: Description

This command will set, remove or display the currently set image that will be sent to the newly created ticket channel.

## :question: Can Be Used By

Can be used by members with the **MANAGE_MESSAGES** permission.

## :balloon: Usage

Run this command with the following message:

``` text
$image <subcommand> <image_attachment>
```

### :pushpin: Arguments

1. **\<subcommand\>**: The subcommand to run with this command. May be **set**, **remove** or be *empty*.
   1. **\<set\>**: Update the image that will be used. Include your image as an image attachment.
   2. **\<remove\>**: Remove the image that was saved for this server.
   3. *empty*: If the the command is run with no subcommand, (i.e `$image`) it will send the currently set image as an attachment.

## :information_source: Other Information

* [x] The command will work only on guilds.
* [ ] The command is NSFW.
