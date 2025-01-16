# mobile-payments-sdk-react-native

asd3

## Installation

```sh
npm install mobile-payments-sdk-react-native
```

## Usage

The `example` directory has an example of an application using the wrapper.
The `src` directory is the wrapper itself; most users shouldn't need to change
those files. See [Contributing](#Contributing) if you think you'd like to---you
can make your own change, of course, but please consider sharing with others!

### Configuring Before Use

In the example, the application id is embedded in Android's MainApplication.kt
and iOS's Config.m; update those to your correct value before running.

The authorization token and location id are similarly hardcoded: you will need
to write a "real" way to get those depending on your application's specifics,
but for the example we embed it in [SplashScreen.tsx](example/src/Screens/SplashScreen.tsx).

### Running

```sh
yarn example start
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
