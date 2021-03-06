import AceEditor from "react-ace";
import { idToColor } from "~/utils/id-to-color.util";

export type AceAnchor = {
  start: {
    row: number;
    column: number;
  };
  end: {
    row: number;
    column: number;
  };
  isBackwards: boolean;
};

export const addSelectionClient = (id: string) => {
  const color = idToColor(id);
  const styleTag = document.createElement("style");
  styleTag.id = `style-${id}`;
  styleTag.innerHTML = `
    .u-${id} { background-color: ${color}; }
    .ace_marker-layer .u-${id} { opacity: 0.75; }
    .ace_marker-layer .u-${id}.empty { background-color: transparent; }
    .ace_marker-layer .u-${id}.cursor { opacity: 1; background-color: transparent; }
    .ace_marker-layer .u-${id}.cursor.left { border-left: 2px solid ${color} }
    .ace_marker-layer .u-${id}.cursor.right { border-right: 2px solid ${color} }
  `;
  document.querySelector("head").appendChild(styleTag);
};

const anchorMap: {
  [id: string]: number[];
} = {};

export const setAnchorSelectionClient = (
  ed: AceEditor["editor"],
  id: string,
  anchor: AceAnchor
) => {
  const session = ed.getSession();
  // const doc = session.getDocument();
  const selection = ed.getSelection();

  if (id in anchorMap) {
    anchorMap[id].forEach((id) => {
      ed.session.removeMarker(id);
    });
    delete anchorMap[id];
  }

  // let emptyClass = "";

  anchorMap[id] = [];

  const range = selection.getRange();
  range.start = anchor.start;
  range.end = anchor.end;

  anchorMap[id].push(session.addMarker(range, `u-${id}`, "text"));

  // if (!range.isMultiLine && range.start.column === range.end.column) {
  //   emptyClass = "empty";
  // }

  // Add cursor
  // const index = anchor.prefixed ? stindex : edindex;
  // range = ed.selection.getRange();
  // range.start = stPos;
  // range.end = edPos;

  // anchorMap[id].push(
  //   session.addMarker(
  //     range,
  //     `u-${id} ${emptyClass} cursor ${anchor.isBackwards ? "left" : "right"}`,
  //     "text"
  //   )
  // );
};

export const removeIdSelectionClient = (ed: AceEditor["editor"], id) => {
  document.querySelector(`#style-${id}`).remove();
  if (ed != null) {
    if (id in anchorMap) {
      anchorMap[id].forEach((m) => ed.getSession().removeMarker(m));
      delete anchorMap[id];
    }
  }
};

export const clearAllSelectionClient = (ed?: AceEditor["editor"]) => {
  for (let key in anchorMap) removeIdSelectionClient(ed, key);
};
