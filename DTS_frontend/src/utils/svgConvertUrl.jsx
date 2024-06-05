import React, { useState, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import { AiOutlineBulb } from "react-icons/ai";
import dateFormat from "dateformat";

export default function svgConvertUrl(title, owner, createdAt, userColor) {
  const svg = (
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="150">
      <rect x="0" y="0" width="100%" height="100%" fill="#F8FAFB" />
      {/* <rect x="0" y="0" width="100%" height="100%" fill="#111111" /> */}
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex ", alignItems: "center" }}>
            {/* <img src={stickyNoteBase64} width="100px" alt="" style={{ marginRight: "10px" }} /> */}
            <AiOutlineBulb
              style={{ width: "80px", height: "80px", color: userColor }}
            />
            <span
              style={{
                fontSize: `48px`,
                fontWeight: "bold",
                maxWidth: "300px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ fontSize: "30px", marginTop: "10px", display: "flex" }}>
            <span style={{ marginRight: "15px" }}>{owner}</span>
            <span>{dateFormat(createdAt, "mm/dd HH:MM")}</span>
          </div>
        </div>
        
      </foreignObject>
    </svg>
  );
  const svgStringify = ReactDOMServer.renderToString(svg);
  const url =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStringify);

  return url;
}
