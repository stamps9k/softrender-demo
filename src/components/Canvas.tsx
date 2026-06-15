import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { logger } from "../libs/debug_config.mjs";
import init, {
  WasmRenderer,
  solid_frame,
  render_test_triangle,
} from "softrender";

import RenderForm from "./RenderForm";

const CANVAS_WIDTH = 736;
const CANVAS_HEIGHT = 480;

const Canvas = () => {
  // #region --- State and refs ------------------------------------------------
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const button_ref = useRef<HTMLButtonElement>(null);
  const animation_frame_ref = useRef<number | null>(null);
  const renderer_ref = useRef<WasmRenderer | null>(null);
  const wasm_ready_ref = useRef(false);
  const [error, set_error] = useState<Error | null>(null);
  const [search_params, set_search_params] = useSearchParams();
  // #endregion ----------------------------------------------------------------

  // #region --- WASM init -----------------------------------------------------
  useEffect(() => {
    logger.info_webapp("[Canvas] - Mounted.");

    async function initialise() {
      await init();
      wasm_ready_ref.current = true;
      logger.info_webapp("[Canvas] - WASM initialised.");
    }

    initialise().catch((e) =>
      set_error(e instanceof Error ? e : new Error(String(e))),
    );

    return () => {
      logger.info_webapp("[Canvas] - Unmounted.");
      stop_loop();
    };
  }, []);
  // #endregion ----------------------------------------------------------------

  // #region --- Error handling ------------------------------------------------
  useEffect(() => {
    if (!error) return;
    logger.warn_webapp("[Canvas] - Surfacing error to user via toast", {
      message: error.message,
    });
    toast.error(
      <span>
        Error:
        <br />
        {error.message}
      </span>,
    );
  }, [error]);
  // #endregion ----------------------------------------------------------------

  // #region --- Loop control --------------------------------------------------
  function stop_loop() {
    if (animation_frame_ref.current !== null) {
      cancelAnimationFrame(animation_frame_ref.current);
      animation_frame_ref.current = null;
    }
  }

  function start(selected_mode: string) {
    if (!wasm_ready_ref.current) return;

    const canvas = canvas_ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      set_error(new Error("2D context not supported"));
      return;
    }

    stop_loop();

    try {
      if (selected_mode === "renderer") {
        renderer_ref.current = new WasmRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      function frame(timestamp: number) {
        let pixels: Uint8Array | Uint8ClampedArray;

        try {
          if (selected_mode === "renderer" && renderer_ref.current) {
            //pixels = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT * 4); // Placeholder for renderer output
            pixels = renderer_ref.current.render_frame(timestamp);
          } else if (selected_mode === "test-triangle") {
            pixels = render_test_triangle(CANVAS_WIDTH, CANVAS_HEIGHT);
          } else {
            pixels = solid_frame(CANVAS_WIDTH, CANVAS_HEIGHT);
          }

          const image_data = new ImageData(
            new Uint8ClampedArray(pixels),
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
          );

          /*
					const image_data = new ImageData(
            pixels.buffer,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
          );
					*/

          ctx!.putImageData(image_data, 0, 0);
        } catch (e) {
          set_error(e instanceof Error ? e : new Error(String(e)));
          return;
        }

        animation_frame_ref.current = requestAnimationFrame(frame);
      }

      animation_frame_ref.current = requestAnimationFrame(frame);
    } catch (e) {
      set_error(e instanceof Error ? e : new Error(String(e)));
    }
  }
  // #endregion ----------------------------------------------------------------

  // #region --- Handlers ------------------------------------------------------
  function handle_mode_change(new_mode: string) {
    set_search_params({ mode: new_mode });
  }

  function handle_start() {
    start(search_params.get("mode") || "solid_frame");
  }
  // #endregion ----------------------------------------------------------------

  // #region --- Render --------------------------------------------------------
  return (
    <div className="d-flex flex-column align-items-center">
      <h1 className="mb-3">Softrender Demo</h1>
      <RenderForm />
      <canvas
        ref={canvas_ref}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border"
      />
      <div className="btn-group w-100">
        <button
          id="fullscreen-btn"
          className="btn btn-secondary w-50"
          ref={button_ref}
          onClick={() => start(search_params.get("mode") || "solid-frame")}>
          <i className="bi bi-play-fill" /> Render
        </button>
      </div>
      <ToastContainer />
    </div>
  );
  // #endregion ----------------------------------------------------------------
};

export default Canvas;
