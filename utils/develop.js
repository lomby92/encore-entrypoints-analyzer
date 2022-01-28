const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const EncoreEntrypointsAnalyzerPlugin = require("./index");

const OUTPUT_FOLDER = "build";

if (__dirname.split("/").slice(-1)[0] !== "dev") {
    throw new Error('Expecting to run this script from "dev" folder.');
}

// Create the destination folder
fs.mkdirSync(path.resolve(__dirname, OUTPUT_FOLDER), { recursive: true });

// Create an entrypoints.json file starting from mocked data
const entrypointsJSONContent = {
    entrypoints: {
        common: {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/vendors~common~form-types/date-range.js",
                "/build/vendors~common.js",
                "/build/common~form-types/date-range.js",
                "/build/common.js",
            ],
        },
        "reports/users-and-members": {
            js: ["/build/runtime.js", "/build/vendors~reports/users-and-members.js", "/build/reports/users-and-members.js"],
        },
        "feature/view-configurations": {
            js: [
                "/build/runtime.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/feature/view-configurations.js",
            ],
        },
        "associate-users-to-members": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/associate-users-to-members.js",
            ],
        },
        "contracts-list": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/contracts-list.js",
            ],
        },
        "create-or-edit-members": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/create-or-edit-members.js",
            ],
        },
        "create-members-extra-info": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/create-members-extra-info.js",
            ],
        },
        "edit-feature-integration": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/edit-feature-integration.js",
            ],
        },
        "members-list": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/members-list.js",
            ],
        },
        "import-view": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/import-view.js",
            ],
        },
        "issue-contract-invoice": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/issue-contract-invoice.js",
            ],
        },
        "member-invoices-list": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/member-invoices-list.js",
            ],
        },
        "users-list": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/users-list.js",
            ],
        },
        "form-types/address": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/form-types/address.js",
            ],
        },
        "form-types/date-range": {
            js: [
                "/build/runtime.js",
                "/build/vendors~feature/view-configurations~common~contracts-list~create-members-extra-info~694f031a.js",
                "/build/vendors~common~form-types/date-range.js",
                "/build/common~form-types/date-range.js",
                "/build/form-types/date-range.js",
            ],
        },
        "form-types/markdown-textarea": {
            js: [
                "/build/runtime.js",
                "/build/vendors~associate-users-to-members~common~contracts-list~create-or-edit-members~crea~6cf8bdc9.js",
                "/build/vendors~form-types/markdown-textarea.js",
                "/build/form-types/markdown-textarea.js",
            ],
        },
        "style.vendor": {
            js: ["/build/runtime.js", "/build/vendors~style.vendor.js"],
            css: ["/build/vendors~style.vendor.css", "/build/style.vendor.css"],
        },
        "style.common": {
            js: ["/build/runtime.js"],
            css: ["/build/style.common.css"],
        },
    },
};
fs.writeFileSync(path.resolve(__dirname, OUTPUT_FOLDER, "entrypoints.json"), JSON.stringify(entrypointsJSONContent));

// Create files starting from the entrypoints.json (the content is meaningless)
const generateRandomString = () => crypto.randomBytes(Math.floor(Math.random() * 100)).toString("hex");

const createFoldersIfNeeded = (relativePath) => {
    for (let i = 0; i < relativePath.split("/").length - 1; i++) {
        const folder = path.resolve(
            __dirname,
            relativePath
                .split("/")
                .slice(0, i + 1)
                .join("/")
        );

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
};

for (const entrypoint in entrypointsJSONContent.entrypoints) {
    if (entrypointsJSONContent.entrypoints[entrypoint].js) {
        for (const js of entrypointsJSONContent.entrypoints[entrypoint].js) {
            createFoldersIfNeeded(js.substring(1));
            const jsPath = path.join(__dirname, js);
            if (!fs.existsSync(jsPath)) {
                fs.writeFileSync(jsPath, generateRandomString());
            }
        }
    }

    if (entrypointsJSONContent.entrypoints[entrypoint].css) {
        for (const css of entrypointsJSONContent.entrypoints[entrypoint].css) {
            createFoldersIfNeeded(css.substring(1));
            const cssPath = path.join(__dirname, css);
            if (!fs.existsSync(cssPath)) {
                fs.writeFileSync(cssPath, generateRandomString());
            }
        }
    }
}

// Create a webpack compiler object, it mocks the real file received by the plugin from Webpack
const webpackCompiler = {
    hooks: {
        done: {
            tap: (_, callback) => callback(),
        },
    },
    outputPath: OUTPUT_FOLDER,
};

// Trigger the plugin
new EncoreEntrypointsAnalyzerPlugin().apply(webpackCompiler);

// Serve files to test the HTML page generated
http.createServer((req, res) => {
    fs.readFile(path.join(__dirname, OUTPUT_FOLDER, req.url), (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(8080, () =>
    console.log(`\t\x1b[1m[DEV]\x1b[0m Go to http://localhost:8080/entrypoints-report.html to test the plugin\n`)
);
