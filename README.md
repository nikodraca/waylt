# waylt

### What Are You Listening To

http://waylt.app/

## Getting Started

### Development

1. Install packages: `yarn`
2. Update your `.env` to specify your `AUTH_ENDPOINT`. This is the service we have to exchange a Slack auth code for an access token.
3. Run `yarn electron:dev` to start the Electron and React appss

### Distribution

1. Run `yarn electron:build` to compile
2. Run `yarn electron:dist` to create `.dmg` file.

### Deploy

1. Bump the package version in `package.json`
2. First run the build command (see `Distribution`)
3. Run `yarn electron:deploy`. Make sure you have an `electron-builder.yml` file locally that looks like this:

```yml
appId: com.example.waylt
publish:
  provider: github
  token: <GH_TOKEN>
extends: null
files:
  - ./build/**/*
  - ./node_modules/**/*
  - ./package.json
directories:
  buildResources: assets
```

### Debugging with build

There are cases where you want to debug the production build since the behavior can differ slightly. To do this, first create the `.dmg` (Refer to `Distribution` instructions above) and run the application. Then do the following:

1. `lldb /Applications/slackify-mac.app`
2. `run --remote-debugging-port=8315`
3. Open http://localhost:8315/

You should now see the electron logs in the terminal, and the React logs in the local debugger.
