# ExoLite

Exolite is an expansion onto the capabilities of popular package [Express](https://www.npmjs.com/package/express?activeTab=readme), providing a dashboard-style management for web development.

Note: This is still very much in development, and usability and key features are not accessible at this moment.

## Useage

```js
const exolite = require ('exolite');

exolite.listen();
```

When executed, a dashboard will be presented to the host, providing a wide range of features & oversight.

Within this dashboard, the host can create front-end facing pages, & workers, that can act as a HTTP API tool.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 18 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install exolite
```

## Features

  * Any and all features that come with Express
  * Additonal middleware, that acts as a blockade from vulnerabilities, & malicious attacks.
  * User-friendly web-based dashboard to configure routes & environment settings.
  * Request audit log, visible within the web-base dashboard
