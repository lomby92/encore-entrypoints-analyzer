import * as fs from "fs";
// @ts-ignore: Kotatsu does not provide typings
import * as kotatsu from "kotatsu";
import * as path from "path";
import { Compiler, WebpackPluginInstance } from "webpack";
const Graph = require("graphology");

const EXPORTED_GRAPH_PLACEHOLDER = "PLACEHOLDER";
const FILES_OUTPUT_FOLDER = "encore-entrypoints-analyzer";
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Explore entrypoints.json</title>
  </head>
  <body>
    <style>
        html,
        body,
        #sigma-container {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        button[data-role="save-image"] {
            position: absolute;
            bottom: 0;
            right: 0;
            max-width: 100%;
            max-height: 100%;
            margin: 0.5rem;
            padding: 1rem;
            background: #ffffff;
        }
    </style>
    <div id="sigma-container"></div>
    <button type="button" data-role="save-image">Save image</button>
    <script>
        const exportedGraph = '${EXPORTED_GRAPH_PLACEHOLDER}';
    </script>
    <script src="${FILES_OUTPUT_FOLDER}/bundle.js"></script>
  </body>
</html>
`;
const OUTPUT_FILE_NAME = "entrypoints-report.html";

const GRAPH_COLORS = {
    CSS: "#264de4",
    ENTRY: "#e44d26",
    JS: "#dab92d",
};

class EncoreEntrypointsAnalyzerPlugin implements WebpackPluginInstance {
    public apply(compiler: Compiler) {
        compiler.hooks.done.tap("Encore Entrypoints Analyzer Plugin", () => {
            // Read entrypoints.json file created by Symfony Encore
            const entrypointsJson = JSON.parse(
                fs.readFileSync(path.resolve(compiler.outputPath, "entrypoints.json")).toString()
            );

            // List unique JS and CSS chunks
            const jsChunks = new Set<string>();
            const cssChunks = new Set<string>();
            for (const entrypointKey in entrypointsJson.entrypoints) {
                const entrypoint = entrypointsJson.entrypoints[entrypointKey];

                if (entrypoint.js) {
                    entrypoint.js.forEach((jsChunk: string) => jsChunks.add(this.filterChunkName(jsChunk)));
                }

                if (entrypoint.css) {
                    entrypoint.css.forEach((cssChunk: string) => cssChunks.add(this.filterChunkName(cssChunk)));
                }
            }

            const graph = new Graph();

            // Create nodes for each JS/CSS chunk
            jsChunks.forEach((jsChunk) => {
                const jsChunkPath = path.join(compiler.outputPath, "..", "/build", jsChunk);
                const jsFileSize = fs.statSync(jsChunkPath).size;

                graph.addNode(jsChunk, {
                    color: GRAPH_COLORS.JS,
                    label: jsChunk,
                    size: jsFileSize,
                });
            });
            cssChunks.forEach((cssChunk) => {
                const cssChunkPath = path.join(compiler.outputPath, "..", "/build", cssChunk);
                const cssFileSize = fs.statSync(cssChunkPath).size;

                graph.addNode(cssChunk, {
                    color: GRAPH_COLORS.CSS,
                    label: cssChunk,
                    size: cssFileSize,
                });
            });

            // Create a single node for each entrypoint and link them to included chunks
            for (const entrypointKey in entrypointsJson.entrypoints) {
                graph.addNode(entrypointKey, {
                    color: GRAPH_COLORS.ENTRY,
                    label: entrypointKey,
                    size: 20,
                });

                const entrypoint = entrypointsJson.entrypoints[entrypointKey];
                const edgeProperties = { size: 3, type: "arrow" };

                if (entrypoint.js) {
                    entrypoint.js.forEach((jsChunk: string) =>
                        graph.addEdge(this.filterChunkName(jsChunk), entrypointKey, edgeProperties)
                    );
                }

                if (entrypoint.css) {
                    entrypoint.css.forEach((cssChunk: string) =>
                        graph.addEdge(this.filterChunkName(cssChunk), entrypointKey, edgeProperties)
                    );
                }
            }

            // Create a static HTML file
            const htmlContent = HTML_CONTENT.replace(EXPORTED_GRAPH_PLACEHOLDER, JSON.stringify(graph.export()));
            fs.writeFileSync(path.resolve(compiler.outputPath, OUTPUT_FILE_NAME), htmlContent);

            // Build a "frontend app" with Kotatsu starting from frontend.js
            kotatsu.build(
                "front",
                {
                    entry: path.resolve(__dirname, "frontend.js"),
                    output: path.resolve(compiler.outputPath, FILES_OUTPUT_FOLDER),
                    quiet: true,
                    sourceMaps: false,
                },
                () => {
                    console.log(
                        "\x1b[1mEncore Entrypoints Analyzer\x1b[0m saved report to\x1b[1m",
                        path.resolve(compiler.outputPath, FILES_OUTPUT_FOLDER, OUTPUT_FILE_NAME),
                        "\x1b[0m"
                    );
                }
            );
        });
    }

    private filterChunkName(chunkName: string): string {
        return chunkName.replace("/build", "");
    }
}

export = EncoreEntrypointsAnalyzerPlugin;
