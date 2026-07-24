(function (global) {
  System.config({
    transpiler: "plugin-typescript",
    typescriptOptions: {
      target: "es5",
      module: "system",
    },
    baseURL: "./node_modules/",
    meta: {
      typescript: {
        exports: "ts",
      },
      "*.css": { loader: "systemjs-plugin-css" },
    },
    map: {
      typescript: "typescript/lib/typescript.js",
    },
    packageConfigPaths: [
      "./node_modules/*/package.json",
      "./node_modules/@grapecity/*/package.json",
    ],
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      "./src": {
        defaultExtension: "js",
      },
      "object-assign": {
        main: "index.js",
      },
      node_modules: {
        defaultExtension: "js",
      },
    },
  });
})(this);
