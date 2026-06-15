import { useEffect, useState } from "react";
import { logger } from "../libs/debug_config.mjs";
import { useSearchParams } from "react-router-dom";

const ModeRow = () => {
  const [modes, set_modes] = useState([
    {
      render_id: "0",
      render_display_name: "Loading...",
      render_name: "loading",
    },
  ]);
  const [search_params, set_search_params] = useSearchParams();

  useEffect(() => {
    logger.info_webapp("[ModeRow] - Mounted.");

    fetch("/api/renders")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        set_modes(data.message);
      })
      .catch((error) => {
        logger.error_webapp("[ModeRow] - Error fetching render modes:", error);
      });
  }, []);

  return (
    <div className="row mb-2 align-items-center">
      <label className="col-sm-3 col-form-label" htmlFor="mode-select">
        Mode
      </label>
      <div className="col-sm-9">
        <select
          id="mode-select"
          className="form-select"
          value={search_params.get("mode") || "solid_frame"}
          onChange={(e) => {
            logger.info_webapp(`[ModeRow] - Selected mode: ${e.target.value}`);
            set_search_params({ mode: e.target.value });
          }}>
          {modes.map((opt) => (
            <option key={opt.render_id} value={opt.render_name}>
              {opt.render_display_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ModeRow;
