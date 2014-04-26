DataTorrent Console (Angular)
=============================

Open-source, web-based user interface for use with [DataTorrent](http://datatorrent.com), a stream-processing platform for developing real-time, big data applications in Hadoop.
Built with Angular.


## Setting up dev environment

### Installing Current Dependencies
Uses the `bower.json` and `package.json` files:

    npm install .
    bower install .

### Spin up dev server
Use the `serve` grunt task:

    grunt serve

Add the `--force` flag to this command to prevent jshint errors and other failures from stopping the watch commands:

    grunt serve --force



## Working with Dependencies

### Installing a bower package
To use a package from bower, first run the bower install command:

    bower install PACKAGE_NAME[#VERSION_TAG] [--save]

Then, use grunt to automatically inject this package into index.html:

    grunt bower-install

### Updating packages

    bower update [PACKAGE_NAME]

### Uninstalling a package

    bower uninstall [PACKAGE_NAME] --save



## Creating custom components
One of the goals of this project is to use as many open-source components as possible, however the need for some custom components may be unavoidable at times. Even then, it may be prudent to publish a custom component to bower separately and then use it as a dependency in this project. Barring that, the easiest way to create custom components is via the yeoman-angular generator. This requires the `yo` executable, installed by running the following (may need to run as root):

    npm install yo -g

To install the yeoman-angular generator, run:

    npm install -g generator-angular


### Controllers
To create a custom controller, run:

    yo angular:controller controller-name

This will create `/app/scripts/controllers/controller-name.js` and `/test/spec/controllers/controller-name.js`. Note that the actual name of the injectable will be converted to CamelCase and will add "Ctrl" at the end, so `my-controller-name` will become `MyControllerNameCtrl` in the code.

### Directives
To create a custom directive, run:

    yo angular:directive DIRECTIVE-NAME

By convention, names should be all lower-case with dashes, eg. ng-navbar. This will place a new file into `/app/scripts/directives/` and will also add the appropriate script to `/app/index.html`.




## Styles
This project uses the [LESS CSS pre-processor](http://lesscss.org/) to organize its styling. A "manifest" file is located at `app/styles/main.less`, which @imports all style dependencies (eg. from a bower component) and custom DataTorrent UI component styles (eg. `/app/styles/navbar.less`).

### Variables & Mixins
Whenever possible, custom DataTorrent UI component styles should use variables and mixins from the Twitter Bootstrap library. This makes theming/skinning as easy as overriding these variables. When additional variables are required specifically for DataTorrent UI components, they should be declared in `/app/styles/main.less` with appropriate defaults.

### Themes
A "theme" is really just a file that overrides Twitter Bootstrap and other DataTorrent-UI-specific variables (defined in `/app/styles/main.less`). To create a new theme, create a `.less` file inside `/app/styles/themes/` directory, then run:

    grunt serve --theme=[YOUR_THEME_FILENAME_NO_EXTENSION]

### Theme Overrides
On rare occasion, it is useful to have a final theme-agnostic file to place important overrides. These should be placed into `/app/styles/theme-overrides.less`. The only use-case for this as of this writing is to override the path to Twitter Bootstrap fonts (`@icon-font-path`) from the theme file, which often has the default value set.






