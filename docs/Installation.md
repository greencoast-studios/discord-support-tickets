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

You may also download a zip of the repo. Typically, the `master` branch will contain working versions of the bot. If you want, you can also head over to the [releases page](https://github.com/greencoast-studios/discord-support-tickets/releases) and download the zip corresponding to the latest version.

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
npm ci
```

> `npm ci` is used instead of `npm install` to make sure that the installed dependencies are the same version as specified in the `package-lock.json` file.
> This will still install development dependencies which are necessary to build.

Next, you will need to build the bot:

``` text
npm run build
```

### :tada: Running the Bot

You're now ready to run the bot, use:

``` text
npm start
```

### :arrows_counterclockwise: Updating the Bot

If you downloaded the bot through `git`, run the following command:

``` text
git pull origin master
```

If you downloaded the bot from the [releases page](https://github.com/greencoast-studios/discord-support-tickets/releases), you'll need to download the latest zip containing the bot's source code, extract it and overwrite it to the folder where your bot is installed.

In the case that a new dependency was added, you may want to do the following:

1. Remove the `node_modules` folder.
2. Run `npm ci` or `npm install`.

This will ensure that the correct dependencies are installed.

Lastly, you'll need to re-build the bot:

``` text
npm run build
```

After that, your bot will be updated.

## :whale: Docker Image Installation

You can use the bot through the Docker image (Recommended).

### :pencil: Requirements

To run the Docker image you will need the following:

* [Docker](https://www.docker.com/)

### :framed_picture: Running the Image

You can run the image with the following command:

``` text
docker run -it -e DISCORD_TOKEN="YOUR_DISCORD_TOKEN_HERE" -v "local/folder/for/data":"/opt/app/data" -v "local/folder/for/log":"/opt/app/log" greencoast/discord-support-tickets:latest
```

### :open_file_folder: Volumes

You may use the following volumes:

| **Volume:**     | **Description:**                                                                               |
|-----------------|------------------------------------------------------------------------------------------------|
| `/opt/app/data` | Volume where the persistent data will be saved, such as guild information database and images. |
| `/opt/app/log`  | Volume where the support channel logs will be saved.                                           |

#### :floppy_disk: Environment Variables

You may use the following environment variables:

| **Environment Variable:**        | **Required:** | **Description:**                                                                                                            |
|----------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------|
| `DISCORD_TOKEN`                  | Yes           | The bot's Discord Token. You can acquire one [here](https://discord.com/developers/applications).                           |
| `PREFIX`                         | No            | The bot's prefix. You can still use the bot by mentioning it. If this is not set, the bot will use the default prefix: `$`. |
| `OWNER_ID`                       | No            | The bot's owner's ID. If specified and logging is enabled, the bot will send error stacks to the owner through DM.          |
| `INVITE_URL`                     | No            | The bot's invite URL.                                                                                                       |

### :arrows_counterclockwise: Updating the Bot

Updating the bot when running from Docker is much easier, run the following command: 

``` text
docker pull greencoast/discord-support-tickets:latest
```

Then, run the following command to get a list of the running containers:

``` text
docker ps
```

Look for the ID of the container that is running the bot's image, then stop and remove it:

``` text
docker stop [container_id]
docker rm [container_id]
```

Lastly, start a new container with the same command that was used previously to initialize the container.
