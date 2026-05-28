/**
 * Generic Swagger UI conditional visibility plugin.
 *
 * OpenAPI-driven cascading selectors (any depth) for path, query, and header
 * parameters, with optional request-body schema/example resolution.
 *
 * @param {object} [userConfig] - Optional overrides (extension names, keyJoin, etc.)
 * @returns {object} Swagger UI plugin definition
 */
function GenericConditionalVisibilityPlugin(userConfig) {
  const DEFAULTS = {
    extensionNames: {
      conditional: "x-conditional",
      enumMap: "x-conditional-enum-map",
      schemaMap: "x-conditional-schema-map",
      exampleMap: "x-conditional-example-map",
      visibility: "x-visibility",
    },
    keyJoin: "|",
    leafKeyOnly: false,
    pluginKey: "genericConditionalVisibility",
    stylesId: "swagger-ui-gcv-styles",
  };

  const cfg = Object.assign({}, DEFAULTS, userConfig || {});
  if (userConfig && userConfig.extensionNames) {
    cfg.extensionNames = Object.assign({}, DEFAULTS.extensionNames, userConfig.extensionNames);
  }

  const PLUGIN_KEY = cfg.pluginKey;
  const SET_SELECTION = PLUGIN_KEY + "/setSelection";
  const EXT = cfg.extensionNames;

  const MODES = {
    CASCADE_BOUND_BODY: "cascade-bound-body",
    CASCADE_ONLY: "cascade-only",
    BODY_BOUND: "body-bound",
  };

  function pathMethodKey(path, method) {
    return path + "::" + String(method).toLowerCase();
  }

  function getSpec(system) {
    const ss = system.specSelectors;
    if (!ss || !ss.specJson) return null;
    const spec = ss.specJson();
    if (!spec) return null;
    return spec.toJS ? spec.toJS() : spec;
  }

  function normalizeMode(conditional) {
    const mode =
      conditional.mode ||
      conditional["and-visibility"] ||
      conditional.andVisibility ||
      MODES.CASCADE_BOUND_BODY;
    if (mode === "vendor-device-bound") return MODES.CASCADE_BOUND_BODY;
    return mode;
  }

  function supportsBody(mode) {
    return mode === MODES.CASCADE_BOUND_BODY || mode === MODES.BODY_BOUND;
  }

  function supportsCascade(mode) {
    return (
      mode === MODES.CASCADE_BOUND_BODY ||
      mode === MODES.CASCADE_ONLY ||
      mode === MODES.BODY_BOUND
    );
  }

  /**
   * @returns {Array<{name:string, in:string}>}
   */
  function parseSelectorDefs(conditional) {
    const raw = conditional.selectors || conditional.selector;
    if (!raw) return [];

    if (typeof raw === "string") {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, in: "path" }));
    }

    if (Array.isArray(raw)) {
      return raw.map((item) => {
        if (typeof item === "string") return { name: item, in: "path" };
        if (item && typeof item === "object") {
          return {
            name: item.name || item.param || item.key,
            in: (item.in || item.location || "path").toLowerCase(),
          };
        }
        return null;
      }).filter(Boolean);
    }

    return [];
  }

  function whenFromVisibility(vis) {
    if (!vis) return null;
    if (vis.when && typeof vis.when === "object") return vis.when;
    const keys = Object.keys(vis).filter((k) => k !== "description");
    if (keys.length === 0) return null;
    const when = {};
    keys.forEach((k) => {
      when[k] = vis[k];
    });
    return when;
  }

  function buildEnumTreeFromSchemas(spec, selectorDefs) {
    const schemas = (spec.components && spec.components.schemas) || {};
    const names = selectorDefs.map((s) => s.name);
    const tree = {};

    Object.keys(schemas).forEach((schemaName) => {
      const vis = schemas[schemaName][EXT.visibility];
      const when = whenFromVisibility(vis);
      if (!when) return;

      let node = tree;
      for (let i = 0; i < names.length; i++) {
        const key = names[i];
        const val = when[key];
        if (val == null || val === "") return;
        const strVal = String(val);
        if (i === names.length - 1) {
          if (!node[key]) node[key] = {};
          node[key][strVal] = node[key][strVal] || true;
        } else {
          if (!node[key]) node[key] = {};
          if (!node[key][strVal]) node[key][strVal] = {};
          node = node[key][strVal];
        }
      }
    });

    return tree;
  }

  function navigateEnumTree(tree, selectorDefs, selection, targetIndex) {
    if (!tree || targetIndex < 0) return null;
    let node = tree;
    for (let i = 0; i < targetIndex; i++) {
      const def = selectorDefs[i];
      const val = selection[def.name];
      if (!val || !node[def.name] || node[def.name][val] == null) return null;
      node = node[def.name][val];
    }
    return node;
  }

  function optionsFromNode(node, selectorName) {
    if (!node) return [];
    const branch = node[selectorName];
    if (Array.isArray(branch)) return branch.map(String).sort();
    if (branch && typeof branch === "object") {
      return Object.keys(branch).sort();
    }
    return [];
  }

  function getOptionsForSelector(meta, selection, index) {
    const def = meta.selectorDefs[index];
    if (!def) return [];

    const node = navigateEnumTree(meta.enumTree, meta.selectorDefs, selection, index);
    let options = optionsFromNode(node, def.name);

    if (options.length === 0 && meta.schemaMap) {
      const prefix = selectionKey(selection, meta.selectorDefs.slice(0, index), meta);
      const candidates = new Set();
      Object.keys(meta.schemaMap).forEach((mapKey) => {
        if (prefix && !mapKey.startsWith(prefix)) return;
        const parts = mapKey.split(meta.keyJoin);
        const next = parts[index];
        if (next) candidates.add(next);
      });
      options = Array.from(candidates).sort();
    }

    return options;
  }

  function selectionKey(selection, selectorDefs, meta) {
    const conditional = meta.conditional || {};
    const join = conditional.keyJoin || meta.keyJoin || cfg.keyJoin;
    const leafOnly =
      conditional.leafKeyOnly != null ? conditional.leafKeyOnly : meta.leafKeyOnly;

    if (leafOnly && selectorDefs.length) {
      const last = selectorDefs[selectorDefs.length - 1].name;
      return selection[last] ? String(selection[last]) : "";
    }

    return selectorDefs
      .map((d) => selection[d.name])
      .filter((v) => v != null && v !== "")
      .map(String)
      .join(join);
  }

  function getOperationMeta(spec, path, method) {
    if (!spec || !spec.paths || !path || !method) return null;
    const pathItem = spec.paths[path];
    if (!pathItem) return null;
    const op = pathItem[String(method).toLowerCase()];
    if (!op || !op[EXT.conditional]) return null;

    const conditional = op[EXT.conditional];
    const mode = normalizeMode(conditional);
    const selectorDefs = parseSelectorDefs(conditional);
    if (!selectorDefs.length && !supportsBody(mode)) return null;

    const enumTree =
      op[EXT.enumMap] ||
      buildEnumTreeFromSchemas(spec, selectorDefs) ||
      {};

    return {
      conditional,
      mode,
      selectorDefs,
      enumTree,
      schemaMap: op[EXT.schemaMap] || {},
      exampleMap: op[EXT.exampleMap] || {},
      schemas: (spec.components && spec.components.schemas) || {},
      keyJoin: conditional.keyJoin || cfg.keyJoin,
      leafKeyOnly:
        conditional.leafKeyOnly != null ? conditional.leafKeyOnly : cfg.leafKeyOnly,
    };
  }

  function pathMethodFromList(pathMethod) {
    if (pathMethod == null) return [null, null];
    if (typeof pathMethod.get === "function" && pathMethod.size >= 2) {
      return [pathMethod.get(0), pathMethod.get(1)];
    }
    if (Array.isArray(pathMethod) && pathMethod.length >= 2) {
      return [pathMethod[0], pathMethod[1]];
    }
    if (typeof pathMethod.toJS === "function") {
      const arr = pathMethod.toJS();
      if (Array.isArray(arr) && arr.length >= 2) return [arr[0], arr[1]];
    }
    return [null, null];
  }

  function resolvePathMethod(props) {
    const fromPathMethod = pathMethodFromList(props.pathMethod);
    if (fromPathMethod[0] && fromPathMethod[1]) return fromPathMethod;

    if (props.operation) {
      const op = props.operation;
      const path = op.get ? op.get("path") : op.path;
      const method = op.get ? op.get("method") : op.method;
      if (path && method) return [path, method];
    }

    if (props.specPath) {
      const arr = props.specPath.toJS ? props.specPath.toJS() : props.specPath;
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length - 1; i++) {
          if (typeof arr[i] === "string" && arr[i].charAt(0) === "/") {
            return [arr[i], arr[i + 1]];
          }
        }
      }
    }

    return [null, null];
  }

  function getMetaForProps(system, props) {
    const [path, method] = resolvePathMethod(props);
    return getOperationMeta(getSpec(system), path, method);
  }

  function asPathMethod(system, path, method) {
    if (system && system.Im && system.Im.fromJS) {
      return system.Im.fromJS([path, method]);
    }
    return [path, method];
  }

  function paramValueForUpstream(value) {
    return value === "" || value == null ? null : value;
  }

  function paramIn(rawParam) {
    if (!rawParam) return "path";
    return (rawParam.get ? rawParam.get("in") : rawParam.in) || "path";
  }

  function paramName(rawParam) {
    if (!rawParam) return "";
    return rawParam.get ? rawParam.get("name") : rawParam.name;
  }

  function findSelectorDef(meta, rawParam) {
    const name = paramName(rawParam);
    const loc = paramIn(rawParam);
    return meta.selectorDefs.find((d) => d.name === name && d.in === loc);
  }

  function readParamValue(props, paramName, paramInLoc) {
    const { specSelectors, pathMethod, rawParam, param } = props;
    if (!specSelectors || !pathMethod) return "";
    const identity = rawParam || param;
    if (!identity) return "";
    try {
      const meta =
        specSelectors.parameterWithMetaByIdentity(pathMethod, identity) || null;
      if (!meta || !meta.get) return "";
      const v = meta.get("value");
      return v == null || v === undefined ? "" : String(v);
    } catch (_e) {
      return "";
    }
  }

  function getParamValue(system, path, method, paramName, paramInLoc) {
    const ss = system.specSelectors;
    if (!ss || !ss.parameterValues || !path || !method) return "";
    try {
      const values = ss.parameterValues(asPathMethod(system, path, method));
      if (!values) return "";

      const scopedKey = paramInLoc + "." + paramName;
      if (values.get && typeof values.find !== "function") {
        const scoped = values.get(scopedKey);
        if (scoped != null && scoped !== "") return String(scoped);
        const direct = values.get(paramName);
        return direct == null ? "" : String(direct);
      }

      const entry = values.find((p) => {
        const n = p && (p.get ? p.get("name") : p.name);
        const loc = p && (p.get ? p.get("in") : p.in);
        return n === paramName && (loc || "path") === paramInLoc;
      });
      if (!entry) return "";
      const v = entry.get ? entry.get("value") : entry.value;
      return v == null ? "" : String(v);
    } catch (_e) {
      return "";
    }
  }

  function writeParam(props, path, method, selectorDef, value) {
    const rawParam = props.rawParam || props.param;
    const upstream = paramValueForUpstream(value);
    if (props.onChange && rawParam) {
      props.onChange(rawParam, upstream, false);
      return;
    }
    const { specActions, pathMethod } = props;
    if (specActions && specActions.changeParamByIdentity && pathMethod && rawParam) {
      specActions.changeParamByIdentity(pathMethod, rawParam, upstream, false);
      return;
    }
    if (specActions && specActions.changeParam && path && method) {
      specActions.changeParam(path, method, selectorDef.name, selectorDef.in, upstream, false);
    }
  }

  function clearParam(props, path, method, selectorDef) {
    writeParam(props, path, method, selectorDef, null);
  }

  function mergeSelection(system, path, method, meta, base) {
    const sel = Object.assign({}, base || {});
    meta.selectorDefs.forEach((def) => {
      if (!sel[def.name]) {
        sel[def.name] = getParamValue(system, path, method, def.name, def.in);
      }
    });
    return sel;
  }

  function getSelectionState(system, path, method, meta) {
    const actions = system[PLUGIN_KEY + "Actions"] || system.genericConditionalVisibilityActions;
    const selectors = system[PLUGIN_KEY + "Selectors"] || system.genericConditionalVisibilitySelectors;
    let sel =
      selectors && selectors.getSelection ? selectors.getSelection(path, method) : {};
    if (!sel || typeof sel !== "object") sel = {};
    return mergeSelection(system, path, method, meta, sel);
  }

  function isSelectionComplete(meta, selection) {
    return meta.selectorDefs.every((d) => {
      const v = selection[d.name];
      return v != null && v !== "";
    });
  }

  function firstMissingSelector(meta, selection) {
    for (let i = 0; i < meta.selectorDefs.length; i++) {
      const d = meta.selectorDefs[i];
      if (!selection[d.name]) return { def: d, index: i };
    }
    return null;
  }

  function selectionGateMessage(meta, selection) {
    const missing = firstMissingSelector(meta, selection);
    if (!missing) return "";
    if (missing.index === 0) {
      return (
        "Select " +
        meta.selectorDefs.map((d) => d.name + " (" + d.in + ")").join(", ") +
        " to show request body schema and example."
      );
    }
    const need = meta.selectorDefs
      .slice(missing.index)
      .map((d) => d.name)
      .join(", ");
    return "Select " + need + " to show request body schema and example.";
  }

  function resolvedSchema(meta, selection, system) {
    const key = selectionKey(selection, meta.selectorDefs, meta);
    const schemaName = meta.schemaMap[key];
    if (!schemaName || !meta.schemas) return null;
    const js = meta.schemas[schemaName];
    if (!js || !system.Im) return null;
    return system.Im.fromJS(js);
  }

  function resolvedSchemaSpecPath(system, meta, selection) {
    const key = selectionKey(selection, meta.selectorDefs, meta);
    const schemaName = meta.schemaMap[key];
    if (!schemaName || !system.Im) return null;
    return system.Im.fromJS(["components", "schemas", schemaName]);
  }

  function exampleString(meta, selection) {
    const key = selectionKey(selection, meta.selectorDefs, meta);
    const example = meta.exampleMap[key];
    if (example == null) return "";
    return typeof example === "string" ? example : JSON.stringify(example, null, 2);
  }

  function clearRequestBody(system, path, method) {
    if (!system.oas3Actions || !system.oas3Actions.setRequestBodyValue) return;
    system.oas3Actions.setRequestBodyValue({
      pathMethod: asPathMethod(system, path, method),
      value: undefined,
    });
  }

  function applyExample(system, path, method, meta, selection) {
    const text = exampleString(meta, selection);
    if (!text || !system.oas3Actions || !system.oas3Actions.setRequestBodyValue) return;
    system.oas3Actions.setRequestBodyValue({
      pathMethod: asPathMethod(system, path, method),
      value: text,
    });
  }

  function filterRequestBody(requestBody, meta, selection, system) {
    if (!requestBody || !requestBody.get || !meta) return requestBody;
    const resolved = resolvedSchema(meta, selection, system);
    if (!resolved) return requestBody;
    const content = requestBody.get("content");
    if (!content || !content.size) return requestBody;
    const contentType = content.keySeq().first();
    return requestBody.setIn(["content", contentType, "schema"], resolved);
  }

  function rebuildExampleProp(props, exampleText, system) {
    if (!exampleText || !props.example) return props.example;
    const React = system.React;
    try {
      return React.cloneElement(props.example, {}, exampleText);
    } catch (_e) {
      return props.example;
    }
  }

  function filterSchemaProp(schema, meta, selection, system) {
    const resolved = resolvedSchema(meta, selection, system);
    return resolved || schema;
  }

  function actions(system) {
    return system[PLUGIN_KEY + "Actions"] || system.genericConditionalVisibilityActions;
  }

  function selectorsApi(system) {
    return system[PLUGIN_KEY + "Selectors"] || system.genericConditionalVisibilitySelectors;
  }

  function setSelection(system, path, method, selection) {
    const a = actions(system);
    if (a && a.setSelection) a.setSelection(path, method, selection);
  }

  function ResolvedSchemaPanel({ meta, selection, React }) {
    const key = selectionKey(selection, meta.selectorDefs, meta);
    const schemaName = meta.schemaMap[key];
    const schema = schemaName ? meta.schemas[schemaName] : null;

    if (!isSelectionComplete(meta, selection)) {
      const missing = firstMissingSelector(meta, selection);
      return React.createElement(
        "div",
        { className: "gcv-panel gcv-panel--empty" },
        React.createElement("strong", null, "Resolved payload schema"),
        React.createElement(
          "p",
          null,
          missing
            ? "Select " + missing.def.name + " (" + missing.def.in + ") next."
            : "Complete all selectors."
        )
      );
    }

    if (!schema) {
      return React.createElement(
        "div",
        { className: "gcv-panel gcv-panel--empty" },
        React.createElement("p", null, "No schema mapped for key: ", key || "(empty)")
      );
    }

    const required = new Set(schema.required || []);
    const properties = schema.properties || {};
    const rows = Object.keys(properties).map((name) => {
      const def = properties[name] || {};
      const type = def.type || (def.$ref ? String(def.$ref).split("/").pop() : "object");
      return React.createElement(
        "div",
        { key: name, className: "gcv-prop" },
        React.createElement("span", { className: "gcv-prop__name" }, name, required.has(name) ? "*" : ""),
        React.createElement("span", { className: "gcv-prop__type" }, " " + type)
      );
    });

    return React.createElement(
      "div",
      { className: "gcv-panel" },
      React.createElement("strong", null, "Resolved schema: ", schemaName),
      React.createElement(
        "div",
        { className: "gcv-prop__key" },
        "Key: ",
        key
      ),
      React.createElement("div", { className: "gcv-props" }, rows)
    );
  }

  function ConditionalParamRow(Original, system) {
    const React = system.React;

    return class GcvParameterRow extends React.Component {
      componentDidMount() {
        this._storeUnsub = system.getStore().subscribe(() => this.forceUpdate());
      }

      componentWillUnmount() {
        if (this._storeUnsub) this._storeUnsub();
      }

      render() {
        const props = this.props;
        const meta = getMetaForProps(system, props);
        if (!meta || !supportsCascade(meta.mode)) {
          return React.createElement(Original, props);
        }

        const rawParam = props.rawParam || props.param;
        const selDef = findSelectorDef(meta, rawParam);
        if (!selDef) {
          return React.createElement(Original, props);
        }

        const [path, method] = resolvePathMethod(props);
        const selIndex = meta.selectorDefs.findIndex(
          (d) => d.name === selDef.name && d.in === selDef.in
        );
        const selection = getSelectionState(system, path, method, meta);
        const current =
          selection[selDef.name] ||
          readParamValue(props, selDef.name, selDef.in) ||
          getParamValue(system, path, method, selDef.name, selDef.in);

        let parentReady = true;
        for (let i = 0; i < selIndex; i++) {
          if (!selection[meta.selectorDefs[i].name]) parentReady = false;
        }

        const options = parentReady ? getOptionsForSelector(meta, selection, selIndex) : [];
        const label = selDef.name + " *";

        const priorNames = meta.selectorDefs.slice(0, selIndex).map((d) => d.name);
        const placeholder =
          selIndex === 0
            ? "-- select " + selDef.name + " --"
            : parentReady
              ? "-- select " + selDef.name + " --"
              : "-- complete " + priorNames.join(", ") + " first --";

        return React.createElement(
          "tr",
          {
            className: "parameters gcv-param-row",
            "data-param-name": selDef.name,
            "data-param-in": selDef.in,
          },
          React.createElement("td", { className: "col parameters-col_name" }, label),
          React.createElement(
            "td",
            { className: "col parameters-col_description" },
            React.createElement(
              "select",
              {
                className: "gcv-native-select",
                value: current || "",
                disabled: !parentReady || options.length === 0,
                onChange: (e) => {
                  const v = e.target.value;
                  const next = Object.assign({}, selection);
                  next[selDef.name] = v;
                  meta.selectorDefs.slice(selIndex + 1).forEach((d) => {
                    next[d.name] = "";
                    clearParam(props, path, method, d);
                  });
                  setSelection(system, path, method, next);
                  writeParam(props, path, method, selDef, v);
                  if (supportsBody(meta.mode)) {
                    clearRequestBody(system, path, method);
                    if (isSelectionComplete(meta, next)) {
                      applyExample(system, path, method, meta, next);
                    }
                  }
                },
              },
              React.createElement("option", { value: "" }, placeholder),
              options.map((o) => React.createElement("option", { key: o, value: o }, o))
            ),
            React.createElement("div", { className: "gcv-hint" }, "(" + selDef.in + ")")
          )
        );
      }
    };
  }

  function ConditionalOperationWrapper(Original, system) {
    const React = system.React;
    return class GcvOperation extends React.Component {
      componentDidMount() {
        this._storeUnsub = system.getStore().subscribe(() => this.forceUpdate());
      }

      componentWillUnmount() {
        if (this._storeUnsub) this._storeUnsub();
      }

      render() {
        const props = this.props;
        const meta = getMetaForProps(system, props);
        if (!meta || !supportsCascade(meta.mode)) {
          return React.createElement(Original, props);
        }

        const [path, method] = resolvePathMethod(props);
        const selection = getSelectionState(system, path, method, meta);

        return React.createElement(
          "div",
          { className: "gcv-operation" },
          React.createElement(
            "div",
            { className: "gcv-selectors gcv-selectors--banner" },
            React.createElement(
              "div",
              { className: "gcv-selectors__title" },
              "Conditional parameters ",
              React.createElement("span", { className: "gcv-badge" }, EXT.conditional)
            ),
            React.createElement(ResolvedSchemaPanel, { meta, selection, React })
          ),
          React.createElement(Original, props)
        );
      }
    };
  }

  function ConditionalRequestBodyWrapper(Original, system) {
    const React = system.React;
    return class GcvRequestBody extends React.Component {
      componentDidMount() {
        this._storeUnsub = system.getStore().subscribe(() => this.forceUpdate());
        this.syncRequestBodyState();
      }

      componentDidUpdate() {
        this.syncRequestBodyState();
      }

      componentWillUnmount() {
        if (this._storeUnsub) this._storeUnsub();
      }

      syncRequestBodyState() {
        const [path, method] = resolvePathMethod(this.props);
        const meta = getOperationMeta(getSpec(system), path, method);
        if (!meta || !supportsBody(meta.mode)) return;
        if (isSelectionComplete(meta, getSelectionState(system, path, method, meta))) return;
        const oas3 = system.oas3Selectors;
        if (!oas3 || !oas3.requestBodyValue) return;
        const current = oas3.requestBodyValue(path, method);
        if (current != null && current !== "") {
          clearRequestBody(system, path, method);
        }
      }

      render() {
        const props = this.props;
        const meta = getMetaForProps(system, props);
        if (!meta || !supportsBody(meta.mode)) {
          return React.createElement(Original, props);
        }

        const [path, method] = resolvePathMethod(props);
        const selection = getSelectionState(system, path, method, meta);
        const complete = isSelectionComplete(meta, selection);

        if (!complete) {
          return React.createElement(
            "div",
            { className: "gcv-request-body-gate" },
            React.createElement(
              "div",
              { className: "gcv-panel gcv-panel--empty" },
              React.createElement("p", null, selectionGateMessage(meta, selection))
            )
          );
        }

        const filteredBody = filterRequestBody(props.requestBody, meta, selection, system);
        return React.createElement(Original, Object.assign({}, props, { requestBody: filteredBody }));
      }
    };
  }

  function ConditionalModelExampleWrapper(Original, system) {
    const React = system.React;
    return class GcvModelExample extends React.Component {
      componentDidMount() {
        this._storeUnsub = system.getStore().subscribe(() => this.forceUpdate());
      }

      componentWillUnmount() {
        if (this._storeUnsub) this._storeUnsub();
      }

      render() {
        const props = this.props;
        const meta = getMetaForProps(system, props);
        if (!meta || !supportsBody(meta.mode)) {
          return React.createElement(Original, props);
        }

        const [path, method] = resolvePathMethod(props);
        const selection = getSelectionState(system, path, method, meta);
        const complete = isSelectionComplete(meta, selection);

        if (!complete) {
          return React.createElement(
            "div",
            { className: "gcv-panel gcv-panel--empty" },
            React.createElement("p", null, selectionGateMessage(meta, selection))
          );
        }

        const key = selectionKey(selection, meta.selectorDefs, meta);
        const nextSchema = filterSchemaProp(props.schema, meta, selection, system);
        const nextSpecPath = resolvedSchemaSpecPath(system, meta, selection) || props.specPath;
        const exampleText = exampleString(meta, selection);

        return React.createElement(
          Original,
          Object.assign({}, props, {
            key: key,
            schema: nextSchema,
            specPath: nextSpecPath,
            example: rebuildExampleProp(props, exampleText, system),
          })
        );
      }
    };
  }

  const pluginSlice = {
    reducers: {
      [SET_SELECTION]: (state, action) => {
        const p = action.payload;
        const sel = p.selection || {};
        const plain = {};
        Object.keys(sel).forEach((k) => {
          plain[k] = sel[k];
        });
        return state.set(pathMethodKey(p.path, p.method), plain);
      },
    },
    actions: {
      setSelection(path, method, selection) {
        return { type: SET_SELECTION, payload: { path, method, selection } };
      },
    },
    selectors: {
      getSelection: (state, path, method) => {
        const v = state.get(pathMethodKey(path, method));
        if (!v) return {};
        return v.toJS ? v.toJS() : v;
      },
    },
  };

  return {
    statePlugins: {
      [PLUGIN_KEY]: pluginSlice,
      genericConditionalVisibility: pluginSlice,
    },
    wrapComponents: {
      parameterRow: ConditionalParamRow,
      operation: ConditionalOperationWrapper,
      RequestBody: ConditionalRequestBodyWrapper,
      modelExample: ConditionalModelExampleWrapper,
    },
    afterLoad() {
      injectStyles(cfg.stylesId);
    },
  };
}

function injectStyles(stylesId) {
  if (typeof document === "undefined") return;
  if (document.getElementById(stylesId)) return;
  const style = document.createElement("style");
  style.id = stylesId;
  style.textContent =
    ".gcv-selectors--banner{margin:8px 0;padding:10px 12px;border:1px solid #61affe;border-radius:4px;background:rgba(97,175,254,.08)}" +
    ".gcv-selectors__title{font-weight:600;margin-bottom:8px;font-size:13px}" +
    ".gcv-badge{font-size:10px;padding:2px 6px;border-radius:3px;background:rgba(97,175,254,.25);color:#4990e2}" +
    ".gcv-native-select{min-width:280px;padding:6px 8px;font-size:14px;border:1px solid #d8dde7;border-radius:4px}" +
    ".gcv-hint{font-size:11px;color:#888;margin-top:4px}" +
    ".gcv-panel{margin-top:8px;padding:10px;border:1px solid #e8e8e8;border-radius:4px;background:#fafafa;font-size:13px}" +
    ".gcv-panel--empty p{margin:4px 0;color:#666;font-style:italic}" +
    ".gcv-prop__key{font-size:11px;color:#888;margin-bottom:6px;font-family:monospace}" +
    ".gcv-prop{padding:4px 0;border-bottom:1px solid #eee}.gcv-prop__name{color:#4990e2;font-family:monospace;font-weight:600}" +
    ".gcv-prop__type{color:#888;font-size:12px;margin-left:6px}";
  document.head.appendChild(style);
}
