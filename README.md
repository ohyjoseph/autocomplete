## Alation Code Project

### Getting Started

1. Install [Yarn](https://yarnpkg.com/) package + [Node.js](https://nodejs.org/) v6.5 or newer.
2. Run `yarn install`
3. Run `yarn start`

This command will build the app from the source files (`/src`) into the output
`/build` folder. As soon as the initial build completes, it will start the
Node.js server (`node build/server.js`) and [Browsersync](https://browsersync.io/)
with [HMR](https://webpack.github.io/docs/hot-module-replacement) on top of it.

> [http://localhost:3000/](http://localhost:3000/) — Node.js server (`build/server.js`)
  with Browsersync and HMR enabled<br>
> [http://localhost:3000/graphql](http://localhost:3000/graphql) — GraphQL server and IDE<br>
> [http://localhost:3001/](http://localhost:3001/) — Browsersync control panel (UI)

Now you can open your web app in a browser, on mobile devices and start
hacking. Whenever you modify any of the source files inside the `/src` folder,
the module bundler ([Webpack](http://webpack.github.io/)) will recompile the
app on the fly and refresh all the connected browsers.

To check the source code for syntax errors and potential issues run:

```shell
$ yarn run lint
```

To launch unit tests:

```shell
$ yarn run test          # Run unit tests with Mocha
$ yarn run test:watch    # Launch unit test runner and start watching for changes
```

By default, [Mocha](https://mochajs.org/) test runner is looking for test files
matching the `src/**/*.test.js` pattern. Take a look at `src/components/Layout/Layout.test.js`
as an example.


### Starter Code

The main route is at `src/routes/suggest/Suggest.js`.  The auto-complete suggestions are rendered in a component located at `src/components/SuggestionList/`.  The starter code for suggestion and parsing is at `src/suggestion/`.  Some tests are provided, and some are suggested but not yet implemented in `src/suggestion/core.test.js`.


### Tools

This application is based on the [React Starter Kit](https://github.com/kriasoft/react-starter-kit).

### Resources

  * [Getting Started with React.js](http://facebook.github.io/react/)
  * [React.js Questions on StackOverflow](http://stackoverflow.com/questions/tagged/reactjs)
  * [Enzyme — JavaScript Testing utilities for React](http://airbnb.io/enzyme/)
  * [Flow — A static type checker for JavaScript](http://flowtype.org/)
  * [Learn ES6](https://babeljs.io/docs/learn-es6/), [ES6 Features](https://github.com/lukehoban/es6features#readme)


### License

Copyright © 2014-present Kriasoft, LLC. This source code is licensed under the MIT
license found in the [LICENSE.txt](https://github.com/kriasoft/react-starter-kit/blob/master/LICENSE.txt)
file. The documentation to the project is licensed under the
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) license.
