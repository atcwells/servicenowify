# ServiceNow Build Tool
A tool for compiling TypeScript projects to ServiceNow Script Includes

This tool will take a bunch of TypeScript files, compile them, mash all javascript into a single string and uglify it. The resulting code can be imported into a ServiceNow Script Include for use elsewhere in the system. All methods exposed by the main entry point of your TypeScript application will be exposed to the ServiceNow execution context.
