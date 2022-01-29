import AbstractGraph, { Attributes } from "graphology-types";
import Sigma from "sigma";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";
const Graph = require("graphology");

const MAX_NODE_SIZE = 25;
const MIN_NODE_SIZE = 4;
const SEMI_TRANSPARENT_GREY = "#f2f2f2";

declare const exportedGraph: string;
if (!exportedGraph) {
    throw new Error("Cannot read the exported graph");
}

// Read JSON graph
const graph: AbstractGraph = (new Graph() as AbstractGraph).import(JSON.parse(exportedGraph));

// Define internal state
interface State {
    clickedNode?: string;
    linkedNeighbors?: Set<string>;
}
const state: State = {};

// Detect min and maz size of nodes, it's required for normalization step
let minNodeSize = Infinity;
let maxNodeSize = 0;
graph.nodes().forEach((node) => {
    const currentNodeSize = parseInt(graph.getNodeAttribute(node, "size"));
    minNodeSize = currentNodeSize < minNodeSize ? currentNodeSize : minNodeSize;
    maxNodeSize = currentNodeSize > maxNodeSize ? currentNodeSize : maxNodeSize;
});

graph.nodes().forEach((node, i) => {
    // Dispose nodes in a circle (following one of Sigma.js examples)
    const angle = (i * 2 * Math.PI) / graph.order;
    graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
    graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));

    // Normalize node sizes with min-max approach, see: https://en.wikipedia.org/wiki/Feature_scaling#Rescaling_(min-max_normalization)
    const originalSize = parseInt(graph.getNodeAttribute(node, "size"));
    const normalizedSize = (originalSize - minNodeSize) / (maxNodeSize - minNodeSize);

    // Scale size in order to have a maximum equal to MAX_NODE_SIZE and a minimum equal to MIN_NODE_SIZE
    const size = Math.max(Math.ceil(normalizedSize * MAX_NODE_SIZE), MIN_NODE_SIZE);
    graph.setNodeAttribute(node, "size", size);

    // Report size in kB into the node label
    const originalLabel = graph.getNodeAttribute(node, "label");
    const kBSize = (originalSize / 1024).toFixed(2);
    graph.setNodeAttribute(node, "label", `${originalLabel} (${kBSize} kB)`);
});

// Define node and edge reducers to show/hide nodes on rendering
const nodeReducer = (node: string, data: Attributes): Partial<NodeDisplayData> => {
    const res = { ...data };

    if (state.linkedNeighbors && !state.linkedNeighbors.has(node) && state.clickedNode !== node) {
        res.color = SEMI_TRANSPARENT_GREY;
        res.label = "";
    }

    return res;
};
const edgeReducer = (edge: string, data: Attributes): Partial<EdgeDisplayData> => {
    const res = { ...data };

    if (state.clickedNode && !graph.hasExtremity(edge, state.clickedNode)) {
        res.color = SEMI_TRANSPARENT_GREY;
    }

    return res;
};

// Create the view on the target HTML container
const container = document.getElementById("sigma-container")!;
const renderer = new Sigma(graph, container, { nodeReducer: nodeReducer, edgeReducer: edgeReducer });

// Register bindings
renderer.on("clickNode", ({ node }) => {
    if (node === state.clickedNode) {
        // Clear the state if clicking the previously clicked node
        state.clickedNode = undefined;
        state.linkedNeighbors = undefined;
    } else {
        state.clickedNode = node;
        state.linkedNeighbors = new Set(graph.neighbors(node));
    }

    // Trigger rendering
    renderer.refresh();
});

// Bindings for saving the graph as an image
const saveButton = document.querySelector<HTMLButtonElement>("button[data-role='save-image']")!;
saveButton.addEventListener("click", () => {
    const pixelRatio = window.devicePixelRatio || 1;
    const { width, height } = renderer.getDimensions();

    // Force the Sigma view to refresh, it's required to properly show all layers in the saved image
    renderer.refresh();

    // Create a temporary canvas, on which all layers will be drawn
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", (width * pixelRatio).toString());
    canvas.setAttribute("height", (height * pixelRatio).toString());
    const ctx = canvas.getContext("2d")!;

    // Draw a white background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio);

    // Render all layers of the Sigma-Graph in to the canvas
    Object.keys(renderer.getCanvases()).forEach((id) => {
        ctx.drawImage(
            renderer.getCanvases()[id],
            0,
            0,
            width * pixelRatio,
            height * pixelRatio,
            0,
            0,
            width * pixelRatio,
            height * pixelRatio
        );
    });

    // Create a temporary anchor to save the image from the canvas
    const link = document.createElement("a");
    link.download = "entrypoints-report.png";
    link.href = canvas.toDataURL();
    link.click();

    // Cleanup temporary DOM elements
    link.remove();
    canvas.remove();
});
