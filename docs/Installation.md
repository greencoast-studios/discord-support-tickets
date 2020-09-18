You can install and use this bot in two different ways, either directly through Node.js or through the Docker Image.

## :green_book: Direct Node.js Installation

You can install the bot to use it directly with Node.js. We recommend you use the Docker image instead whenever possible.

### :pencil: Requirements

To self-host this bot, you'll need the following:

* [git](https://git-scm.com/)
* [node.js](https://nodejs.org/en/) (Version 12.0.0 or higher)

### :hammer: Installation

First, clone the repository.

``` text
git clone https://github.com/greencoast-studios/discord-support-tickets.git
```

#### :triangular_ruler: Configuration

Then, inside the `config` folder, rename `settings.json.example` to `settings.json` and edit the file with the following information:

| **Key:**        | **Required:** | **Description:**                                                                                                            |
|-----------------|---------------|-----------------------------------------------------------------------------------------------------------------------------|
| `discord_token` | Yes           | The bot's Discord Token. You can acquire one [here](https://discord.com/developers/applications).                           |
| `prefix`        | No            | The bot's prefix. You can still use the bot by mentioning it. If this is not set, the bot will use the default prefix: `$`. |
| `owner_id`      | No            | The bot's owner's ID. If specified, the bot will send error stacks to the owner through DM.                                 |
| `invite_url`    | No            | The bot's invite URL.                                                                                                       |

Your file should have the following shape:

``` json
{
  "discord_token": "TOP_SECRET",
  "prefix": "t!",
  "owner_id": "191330192868769793",
  "invite_url": null
}
```

#### :cd: Installing the Dependencies and Building

To install the dependencies you may use the following command:

``` text
npm ci --only=prod
```

> `npm ci` is used instead of `npm install` to make sure that the installed dependencies are the same version as specified in the `package-lock.json` file.
> The `--only=prod` flag will download only the required dependencies to run the bot.

Next, you will need to build the bot:

``` text
npm run build
```

### :tada: Running the Bot

You're now ready to run the bot, use:

``` text
npm start
```

## :whale: Docker Image Installation

You can use the bot through the Docker image (Recommended).

### :pencil: Requirements

To run the Docker image you will need the following:

* [Docker](https://www.docker.com/)

You will also need to be logged in to the GitHub Package Registry, to do that you may follow [this guide](https://docs.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-docker-for-use-with-github-packages#authenticating-to-github-packages).

### :framed_picture: Running the Image

You can run the image with the following command:

``` text
docker run -it -e DISCORD_TOKEN="YOUR_DISCORD_TOKEN_HERE" docker.pkg.github.com/greencoast-studios/discord_support_tickets/bot
```

#### :floppy_disk: Environment Variables

You may use the following environment variables:

| **Environment Variable:**        | **Required:** | **Description:**                                                                                                            |
|----------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------|
| `DISCORD_TOKEN`                  | Yes           | The bot's Discord Token. You can acquire one [here](https://discord.com/developers/applications).                           |
| `PREFIX`                         | No            | The bot's prefix. You can still use the bot by mentioning it. If this is not set, the bot will use the default prefix: `$`. |
| `OWNER_ID`                       | No            | The bot's owner's ID. If specified, the bot will send error stacks to the owner through DM.                                 |
| `INVITE_URL`                     | No            | The bot's invite URL.                                                                                                       |
