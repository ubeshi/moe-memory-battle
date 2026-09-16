import path from "path";

export default {
  mode: "none",
  entry: "./src/server/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.server.json",
          },
        }],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(path.dirname("."), "dist", "server"),
  },
  target: "node",
};
