This section explains the development process for this project.

## :scroll: Scripts

The `package.json` file of this project contains the following scripts:

### npm test

This script will start `jest` in `watchAll` mode, it means that it won't close after all tests have been run. This is ideal to have open during development.

Notice that any `console.log` won't display anything.

### npm run test:showlogs

This script will do the same as `npm test` but with the difference that `console.log` statements will indeed display.

### npm run test:once

This script will start `jest` in normal mode, which means that it will close after all tests have been run. This one is ideal for CI.

### npm run test:once-showlogs

This script will do the same as `npm run test:once` with the exception that `console.log`'s will be displayed.

### npm run build

This script will execute `babel` to compile the code inside the `src` folder and output it into the `build` folder.

### npm start

This script will start the bot in its regular way. It requires to have built the project first. This script is ideal to run the bot in production.

### npm run debug

This script will start the bot in the same way as `npm start` does with the exception that it appends the `--debug` flag, which is used to display debug level logs from Discord.js.

### npm run dev

This script will start the bot with `nodemon` reload-on-save and `babel-node` to transpile on the fly. This script is ideal to be used when developing the bot.

### npm run lint:errors-only

This script will run `eslint` to check the code style on the `src` and `test` folders. It will only trigger a failed check if there's at least one error level linting error.

### npm run lint

This script works similarly to `npm run lint:errors-only` except that will trigger a failed check even for warn level linting errors.
