# ServiceNow Build Tool

##A tool for compiling TypeScript projects to ServiceNow Script Includes

This tool will take a bunch of TypeScript files, compile them, mash all javascript into a single string and uglify it. The resulting code can be imported into a ServiceNow Script Include for use elsewhere in the system. All methods exposed by the main entry point of your TypeScript application will be exposed to the ServiceNow execution context.

###Jobs:

1. **Compile**
The tool starts by running tsc (TypeScript compiler) against all available '.ts' files.

2. **Browserify**
The tool will take the single file specified in the package.json as 'main', and produce a public function for each method provided. This becomes the available API within ServiceNow

3. **Fix block scoping issue**
ServiceNow has a specific issue where it doesn't hoist a function properly, so we simply have to replace 'function e(...' with 'e = function(...' in the code. _Not your code, it's the functions Browserify creates that cause the problem. Your code is not modified._

4. **Uglify**
We run this job just to compress everything into the smallest space. The result will be placed in the './dist/deploy.js' file.

5. **Clean**
Finally we clean up all the compiled '.js' files.

###Setup:

1. Run the following at the command prompt:

  `npm install -save servicenowify`

2. Add the following to the 'scripts' section of your package.json:

  `"build": "build_servicenow_server"`

3. Run the following at the command prompt:

  `npm run build`

###Example workflow:

You as a developer will write TypeScript files, all within the 'server' directory (currently). You are able to specify the resulting name of the API added to global namespace with the package.json option 'umd_name'. you will build the project, and import the resulting code into a Script Include. From a different script, it is now possible to call your code using the namespace provided by the umd_name.

###Options:
To configure the buildtool, a section should be added to your package.json like this:

```json
   "servicenowify": {
     "name": "OPSD_DBScan",
     "sourcedir": "/server",
     "distdir": "/dist",
     "distfile": "deploy.js",
     "jobs": [
       "compile",
       "browserify",
       "fix_block_scoping",
       "uglify",
       "clean"
     ]
   }
```

###Questions:

1. Is it possible to specify the build order, or the jobs run?

This project was built to support a certain build team. If you'd like different choices, you'll need to fork the project, change the code and do it yourself, currently I can't support this.

2. What about a JavaScript project, rather than TypeScript?

See 1. It would not be hard to edit the 'build_server.js' file to just have the jobs you want, until I implement the ability to specify build jobs.