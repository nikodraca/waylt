# songstat.us

http://songstat.us/

## Getting Started

### Development

#### Run server

1. Install packages: `yarn`
2. Update your `.env` to specify your `AUTH_ENDPOINT`. This is the service we have to exchange a Slack auth code for an access token.
3. Run `yarn watch` to compile TypeScript and `yarn start` to run

### Run client

1. `cd src/client`
2. Install packages: `yarn`
3. Run `yarn start`

### Distribution

1. Run `yarn electron:build` to compile
2. Run `yarn electron:dist` to create `.dmg` file.

### Debugging with build

There are cases where you want to debug the production build since the behavior can differ slightly. To do this, first create the `.dmg` (Refer to `Distribution` instructions above) and run the application. Then do the following:

1. `lldb /Applications/slackify-mac.app`
2. `run --remote-debugging-port=8315`
3. Open http://localhost:8315/

You should now see the electron logs in the terminal, and the React logs in the local debugger.
