import { useEffect, useRef, useState } from "react";
import "./IdleScreensaver.css";

const IDLE_TIMEOUT_MS = 10000;

function IdleScreensaver({ children }) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      setIsIdle(false);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIMEOUT_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, {
        passive: true,
      });
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, []);

  return (
    <>
      {children}

      {isIdle && (
        <div
          className="cpms-idle-screensaver"
          role="presentation"
          onClick={() => setIsIdle(false)}
        >
          <div className="cpms-idle-glow cpms-idle-glow-one" />
          <div className="cpms-idle-glow cpms-idle-glow-two" />

          <div className="cpms-idle-content">
            <div className="cpms-idle-logo">C</div>

            <div className="cpms-idle-brand">CPMS</div>

            <h1>
              Construction Project
              <br />
              Management System
            </h1>

            <p>Skyward Engineering (Pvt) Ltd</p>

            <div className="cpms-idle-divider" />

            <span>
              Move the mouse, tap, or press any key to continue
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default IdleScreensaver;
