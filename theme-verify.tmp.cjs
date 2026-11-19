const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");

const ROOT = "C:\\Users\\daniel\\Desktop\\projects\\dandev\\cruzcontroltours\\website\\panel-cruzcontroltours";
const rootRequire = createRequire(path.join(ROOT, "package.json"));
const ts = rootRequire("typescript");
const React = rootRequire("react");

let mockTheme = { resolvedTheme: "light", calls: [] };
const MoonSentinel = () => null;
const SunSentinel = () => null;
const ButtonStub = (props) => React.createElement("button", props);

function loadToggle() {
  const full = path.join(ROOT, "src/components/layouts/ThemeToggle/theme-toggle.tsx");
  const src = fs.readFileSync(full, "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (spec) => {
    if (spec === "react") return React;
    if (spec === "react/jsx-runtime" || spec === "react/jsx-dev-runtime") {
      const j = (type, props, key) => {
        const { children, ...rest } = props || {};
        const cfg = key !== undefined ? { ...rest, key } : rest;
        if (children === undefined) return React.createElement(type, cfg);
        return Array.isArray(children)
          ? React.createElement(type, cfg, ...children)
          : React.createElement(type, cfg, children);
      };
      return { Fragment: React.Fragment, jsx: j, jsxs: j };
    }
    if (spec === "next-themes") {
      return { useTheme: () => ({ resolvedTheme: mockTheme.resolvedTheme, setTheme: (t) => mockTheme.calls.push(t) }) };
    }
    if (spec === "@radix-ui/react-icons") return { MoonIcon: MoonSentinel, SunIcon: SunSentinel };
    if (spec === "@/components/ui/button") return { Button: ButtonStub };
    return rootRequire(spec);
  };
  const mod = { exports: {} };
  new Function("require", "module", "exports", js)(localRequire, mod, mod.exports);
  return mod.exports.default;
}

const ThemeToggle = loadToggle();

function render(resolvedTheme) {
  mockTheme = { resolvedTheme, calls: [] };
  const tree = ThemeToggle();
  const buttonEl = tree.props.children;
  const renderedButton = ButtonStub(buttonEl.props);
  const iconEl = renderedButton.props.children;
  renderedButton.props.onClick();
  return { iconType: iconEl.type, calls: mockTheme.calls, label: renderedButton.props["aria-label"] };
}

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
}

const light = render("light");
check("T1 light shows moon", light.iconType === MoonSentinel);
check("T2 light click sets dark", light.calls.length === 1 && light.calls[0] === "dark", JSON.stringify(light.calls));
check("T3 light label", light.label === "Cambiar a modo oscuro");

const dark = render("dark");
check("T4 dark shows sun", dark.iconType === SunSentinel);
check("T5 dark click sets light", dark.calls.length === 1 && dark.calls[0] === "light", JSON.stringify(dark.calls));
check("T6 dark label", dark.label === "Cambiar a modo claro");

const unknown = render(undefined);
check("T7 unknown shows moon", unknown.iconType === MoonSentinel);
check("T8 unknown click sets dark", unknown.calls.length === 1 && unknown.calls[0] === "dark", JSON.stringify(unknown.calls));

console.log(`\nTOTAL pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
