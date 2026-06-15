import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { logger } from "../libs/debug_config.mjs";

const ShaderConfigRows = () => {
  // #region --- State and refs ------------------------------------------------
  const [all_shader_configs, set_all_shader_configs] = useState<
    Record<string, Array<Record<string, string>>>
  >({});
  const [shader_configs, set_shader_configs] = useState<
    Array<Record<string, string>>
  >([]);
  const [options_map, set_options_map] = useState<
    Record<string, Array<string>>
  >({});
  const [search_params] = useSearchParams();
  // #endregion ----------------------------------------------------------------

  // #region --- Page load processing ------------------------------------------
  useEffect(() => {
    logger.info_webapp("[ShaderConfigRows] - Mounted.");

    logger.verbose_webapp("[ShaderConfigRows] - Fetching all configurations.");
    const fetch_all = async () => {
      const results = await fetch_config_items();
      const cached_configurations = parse_configs(results);
      set_all_shader_configs(cached_configurations);
      logger.verbose_webapp("[ShaderConfigRows] - All configurations cached.", {
        count: Object.keys(cached_configurations).length,
      });
    };
    fetch_all();

    return () => {
      logger.info_webapp("[ShaderConfigRows] - Unmounted.");
    };
  }, []);
  // #endregion ----------------------------------------------------------------

  // #region --- Search Params processing --------------------------------------
  useEffect(() => {
    if (Object.keys(all_shader_configs).length === 0) {
      logger.verbose_webapp(
        "[ShaderConfigRows] - Cache not yet populated, skipping resolution.",
      );
      return;
    }

    const shader_set_name = search_params.get("shader-set") ?? "scatter-fade";
    logger.verbose_webapp(
      "[ShaderConfigRows] - Resolving shader configs from cache",
      { shader_set_name },
    );

    if (all_shader_configs[shader_set_name] !== undefined) {
      logger.verbose_webapp("[ShaderConfigRows] - Shader configs found", {
        shader_set_name,
        count: all_shader_configs[shader_set_name].length,
      });
      set_shader_configs(all_shader_configs[shader_set_name]);
    } else {
      logger.warn_webapp(
        "[ShaderConfigRows] - No shader configs found for shader set",
        { shader_set_name },
      );
      set_shader_configs([]);
    }
  }, [all_shader_configs, search_params]);
  // #endregion ----------------------------------------------------------------

  // #region --- Shader configuration processing -------------------------------
  useEffect(() => {
    if (shader_configs.length === 0) {
      logger.verbose_webapp(
        "[ShaderConfigRows] - No shader configs to fetch options for, skipping.",
      );
      return;
    }
    logger.verbose_webapp(
      "[ShaderConfigRows] - Fetching options for shader configs",
      { count: shader_configs.length },
    );

    const fetch_all = async () => {
      const results: Record<string, Array<string>> = {};
      for (var shader_config of shader_configs) {
        switch (shader_config["config_type_name"]) {
          case "SELECTION":
            const options = await fetch_options(
              shader_config["shader_config_id"],
            );
            const shader_config_id =
              shader_config["shader_config_id"].toString();
            var all_options: Array<string> = [];
            for (const option of options) {
              all_options.push(option["config_value"]);
            }
            results[shader_config_id] = all_options;
            break;
          default:
            if (
              search_params.get(shader_config["shader_config_name"]) == null
            ) {
              search_params.set(
                shader_config["shader_config_name"],
                shader_config["shader_config_default_value"],
              );
            }
            break;
        }
      }
      set_options_map(results);
      logger.verbose_webapp("[ShaderConfigRows] - Options map built", {
        keys: Object.keys(results),
      });
    };

    fetch_all();
  }, [shader_configs]);
  // #endregion ----------------------------------------------------------------

  // #region --- API calls -----------------------------------------------------
  async function fetch_config_items(): Promise<Array<Record<string, string>>> {
    try {
      logger.verbose_webapp(
        "[ShaderConfigRows] - Fetching shader config items",
      );
      const result = await fetch("/api/shader-configs");
      const data = await result.json();
      logger.verbose_webapp(
        "[ShaderConfigRows] - Shader config items fetched",
        { count: data.message.length },
      );
      return data.message;
    } catch (e) {
      logger.error_webapp(
        "[ShaderConfigRows] - Failed to fetch shader config items",
        { error: e },
      );
      return [];
    }
  }

  async function fetch_options(
    shader_config_id: string,
  ): Promise<Array<Record<string, string>>> {
    try {
      logger.verbose_webapp("[ShaderConfigRows] - Fetching options", {
        shader_config_id,
      });
      const response = await fetch(
        "/api/shader-config-selection-items?shader_config_id=" +
          shader_config_id,
      );
      const data = await response.json();
      logger.verbose_webapp("[ShaderConfigRows] - Options fetched", {
        shader_config_id,
        count: data.message.length,
      });
      return data.message;
    } catch (e) {
      logger.error_webapp(
        "[ShaderConfigRows] - Failed to fetch shader config options",
        { error: e },
      );
      return [];
    }
  }

  function parse_configs(
    configs: Array<Record<string, string>>,
  ): Record<string, Array<Record<string, string>>> {
    var results: Record<string, Array<Record<string, string>>> = {};

    for (const shader_config of configs) {
      const shader_name = shader_config["shader_set_name"];
      delete shader_config["shader_set_name"];

      if (results[shader_name] === undefined) {
        results[shader_name] = [shader_config];
      } else {
        results[shader_name].push(shader_config);
      }
    }

    return results;
  }
  // #endregion ----------------------------------------------------------------

  // #region --- Render page ---------------------------------------------------
  return shader_configs.map((config_item, index) => {
    switch (config_item.config_type_name) {
      case "FREE_TEXT":
        return (
          <div
            key={index.toString()}
            id={index.toString()}
            className="ms-auto text-start py-1 row">
            <div id="configLabel" className="col-3">
              <label htmlFor="config">{config_item.shader_config_name}:</label>
            </div>
            <div id="configElement" className="col-1">
              <input
                key={config_item.shader_config_id}
                id={config_item.shader_config_display_name}
                name={config_item.shader_config_name}
                type="text"
                pattern={config_item.shader_config_validation_expression}
                onInvalid={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity(
                    "Field must match format: " +
                      config_item.shader_config_validation_expression,
                  )
                }
                onInput={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity("")
                }
                defaultValue={
                  search_params.get(config_item.shader_config_name) ?? undefined
                }
              />
            </div>
          </div>
        );
      case "SELECTION":
        return (
          <div
            key={index.toString()}
            id={index.toString()}
            className="ms-auto text-start py-1 row">
            <div id="configLabel" className="col-3">
              <label htmlFor="config">
                {config_item.shader_config_display_name}:
              </label>
            </div>
            <div id="configElement" className="col-1">
              <select
                key={options_map[config_item.shader_config_id]?.join(",")}
                id={config_item.shader_config_name}
                name={config_item.shader_config_name}
                defaultValue={
                  search_params.get(config_item.shader_config_name) ?? undefined
                }>
                {options_map[config_item.shader_config_id]?.map(
                  (config_option, index) => {
                    return (
                      <option key={index} value={config_option}>
                        {config_option}
                      </option>
                    );
                  },
                )}
              </select>
            </div>
          </div>
        );
      default:
        logger.warn_webapp(
          "[ShaderConfigRows] - Unknown config type encountered",
          { config_type: config_item.config_type_name },
        );
        return null;
    }
  });
  // #endregion ----------------------------------------------------------------
};

export default ShaderConfigRows;
