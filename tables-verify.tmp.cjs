const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");

const ROOT = "C:\\Users\\daniel\\Desktop\\projects\\dandev\\cruzcontroltours\\website\\panel-cruzcontroltours";
const rootRequire = createRequire(path.join(ROOT, "package.json"));
const ts = rootRequire("typescript");
const React = rootRequire("react");
const { Provider } = rootRequire("react-redux");
const { configureStore } = rootRequire("@reduxjs/toolkit");

function _jsx(type, props, key) {
  const { children, ...rest } = props || {};
  const cfg = key !== undefined ? { ...rest, key } : rest;
  if (children === undefined) return React.createElement(type, cfg);
  return Array.isArray(children)
    ? React.createElement(type, cfg, ...children)
    : React.createElement(type, cfg, children);
}
const jsxRuntime = { Fragment: React.Fragment, jsx: _jsx, jsxs: _jsx };

const captured = [];
const Dummy = () => null;
const dummyProxy = () => new Proxy({}, { get: () => Dummy });
const serviceStub = () => new Proxy({}, { get: () => async () => [] });

const cache = new Map();
function resolveFile(base) {
  for (const c of [`${base}.ts`, `${base}.tsx`]) {
    try { if (fs.statSync(c).isFile()) return c; } catch {}
  }
  throw new Error("Unresolved: " + base);
}
function loadProject(file) {
  const full = resolveFile(file);
  if (cache.has(full)) return cache.get(full).exports;
  const src = fs.readFileSync(full, "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: full.endsWith(".tsx") ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  cache.set(full, mod);
  const localRequire = (spec) => {
    if (spec === "react") return React;
    if (spec === "react/jsx-runtime" || spec === "react/jsx-dev-runtime") return jsxRuntime;
    if (spec === "@/components/ui/table/data-table") {
      return { DataTable: (props) => { captured.push(props); return null; } };
    }
    if (spec === "@/components/ui/button") {
      return { Button: (props) => React.createElement("button", props) };
    }
    if (spec.startsWith("@/components/ui/")) return dummyProxy();
    if (spec === "@/components/view-dialog") return { ViewDialog: Dummy };
    if (spec.startsWith("@/services/")) return serviceStub();
    if (spec === "@/lib/api-client") return { toErrorMessage: (e) => String((e && e.message) || e) };
    if (spec === "lucide-react") return dummyProxy();
    if (spec === "moment" || spec.startsWith("moment/")) {
      const m = () => ({ locale: () => ({ format: () => "" }) });
      return { __esModule: true, default: m };
    }
    if (spec === "@tanstack/react-table") return {};
    if (spec === "react-hot-toast") return { __esModule: true, default: { success() {}, error() {} } };
    if (spec.startsWith("@/")) return loadProject(path.join(ROOT, "src", spec.slice(2)));
    if (spec.startsWith(".")) {
      if (spec.includes("form-dialog")) return dummyProxy();
      return loadProject(path.resolve(path.dirname(full), spec));
    }
    return rootRequire(spec);
  };
  new Function("require", "module", "exports", "__dirname", "__filename", js)(
    localRequire, mod, mod.exports, path.dirname(full), full,
  );
  return mod.exports;
}

const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
  ?? React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
const DISP_KEY = "H" in internals ? "H" : "ReactCurrentDispatcher";
let ctxMap = new Map();
const dispatcher = {
  useState: (init) => [typeof init === "function" ? init() : init, () => {}],
  useReducer: (_r, init) => [typeof init === "function" ? init() : init, () => {}],
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useRef: (v) => ({ current: v }),
  useContext: (ctx) => (ctxMap.has(ctx) ? ctxMap.get(ctx) : ctx._currentValue),
  useSyncExternalStore: (_sub, getSnap, getServer) => (getServer ? getServer() : getSnap()),
  useEffect: () => {}, useLayoutEffect: () => {}, useInsertionEffect: () => {},
  useDebugValue: () => {}, useDeferredValue: (v) => v,
  useTransition: () => [false, (fn) => fn()],
  useId: () => "mini-1",
  useMemoCache: (size) => new Array(size),
  use: () => { throw new Error("unsupported"); },
  useOptimistic: () => { throw new Error("unsupported"); },
};
function renderNode(node) {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(renderNode).join("");
  const { type, props } = node;
  if (typeof type === "function") {
    const prev = internals[DISP_KEY];
    internals[DISP_KEY] = dispatcher;
    try { return renderNode(type(props)); }
    finally { internals[DISP_KEY] = prev; }
  }
  if (type === Symbol.for("react.fragment") || type === React.Fragment) return renderNode(props.children);
  if (type && typeof type === "object" && (type.$$typeof === Symbol.for("react.provider") || type.$$typeof === Symbol.for("react.context"))) {
    const ctx = type.$$typeof === Symbol.for("react.provider") ? type._context : type;
    const had = ctxMap.has(ctx), prevVal = ctxMap.get(ctx);
    ctxMap.set(ctx, props.value);
    try { return renderNode(props.children); }
    finally { had ? ctxMap.set(ctx, prevVal) : ctxMap.delete(ctx); }
  }
  if (typeof type === "string") return renderNode(props.children);
  throw new Error("Unsupported node");
}
const render = (store, Comp) => {
  ctxMap = new Map();
  renderNode(React.createElement(Provider, { store }, React.createElement(Comp)));
};

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
}

const TABLES = [
  { key: "bookings", table: "features/booking/components/booking-table/booking-table", slice: "lib/store/bookingsSlice", fetch: "fetchBookings" },
  { key: "categories", table: "features/category/components/category-table/category-table", slice: "lib/store/categoriesSlice", fetch: "fetchCategories" },
  { key: "customers", table: "features/customer/components/customer-table/customer-table", slice: "lib/store/customersSlice", fetch: "fetchCustomers" },
  { key: "faqs", table: "features/faq/components/faq-table/faq-table", slice: "lib/store/faqsSlice", fetch: "fetchFaqs" },
  { key: "protocols", table: "features/protocol/components/protocol-table/protocol-table", slice: "lib/store/protocolsSlice", fetch: "fetchProtocols" },
  { key: "reviews", table: "features/review/components/review-table/review-table", slice: "lib/store/reviewsSlice", fetch: "fetchReviews" },
  { key: "tours", table: "features/tour/components/tour-table/tour-table", slice: "lib/store/toursSlice", fetch: "fetchTours" },
];

(async () => {
  for (const t of TABLES) {
    captured.length = 0;
    const Comp = loadProject(path.join(ROOT, "src", t.table)).default;
    const sliceMod = loadProject(path.join(ROOT, "src", t.slice));
    const toursMod = loadProject(path.join(ROOT, "src", "lib/store/toursSlice"));
    const store = configureStore({
      reducer: { [t.key]: sliceMod.default, tours: toursMod.default },
    });
    await store.dispatch(sliceMod[t.fetch]());
    render(store, Comp);
    const props = captured[0];
    const ids = (props ? props.columns : []).map((c) => c.accessorKey ?? c.id);
    check(`${t.key} filterColumn exists`, !!props && ids.includes(props.filterColumn), `filter=${props && props.filterColumn} ids=[${ids}]`);
  }

  for (const p of [
    "src/features/departure",
    "src/app/panel/salidas",
    "src/services/departure-service.ts",
    "src/lib/store/departuresSlice.ts",
  ]) {
    check(`gone ${p}`, !fs.existsSync(path.join(ROOT, p)));
  }
  const storeSrc = fs.readFileSync(path.join(ROOT, "src/lib/store/store.ts"), "utf8");
  const navSrc = fs.readFileSync(path.join(ROOT, "src/constants/data.ts"), "utf8");
  check("store clean", !/departure/i.test(storeSrc));
  check("nav clean", !/departure/i.test(navSrc) && !/salidas/i.test(navSrc));

  console.log(`\nTOTAL pass=${pass} fail=${fail}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR", e); process.exit(2); });
