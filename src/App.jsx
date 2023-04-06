import React from "react";
import "./App.css";
import useResizeHandle from "./useResizeHandle";

function App() {
  const container = React.useRef(null);
  const { dragging, getDragHandlers } = useResizeHandle(container, {
    minWidth: "100px",
  });

  return (
    <div className="App">
      <div className="frame" ref={container}>
        <button
          className="drag-handle"
          style={{
            ...(dragging && { boxShadow: "0 4px 20px 0 rgba(0 0 0 / 0.36)" }),
          }}
          {...getDragHandlers()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          </svg>
        </button>
      </div>
      <p>
        จาก demo ข้างบน ตัวปุ่มลากรองรับการใช้เม้าส์และการสัมผัส <br /> โจทย์คือ
        ทำให้รองรับการใช้คีย์บอร์ดด้วยลูกศรซ้าย-ขวา ได้เวลาปุ่มถูกโฟกัส
      </p>
    </div>
  );
}

export default App;
