import AceEditor from "react-ace";

export const addSelectionClient = (id, name) => {
  const userslist = document.querySelector("#users");
  const usericon = document.createElement("li");
  usericon.classList.add(`u-${id}`);
  usericon.innerHTML = name;
  userslist.appendChild(usericon);

  const color = idToColor(id);
  const styleTag = document.createElement("style");
  styleTag.id = `style-${id}`;
  styleTag.innerHTML = `
              .u-${id} { background-color: ${color}; }
              .ace_marker-layer .u-${id} { opacity: 0.35; }
              .ace_marker-layer .u-${id}.empty { background-color: transparent; }
              .ace_marker-layer .u-${id}.cursor { opacity: 1; background-color: transparent; }
              .ace_marker-layer .u-${id}.cursor.left { border-left: 2px solid ${color} }
              .ace_marker-layer .u-${id}.cursor.right { border-right: 2px solid ${color} }
          `;
  document.querySelector("head").appendChild(styleTag);
};

const anchorMap = {};
export const setAnchorSelectionClient = (
  ed: AceEditor["editor"],
  id,
  anchor
) => {
  const session = ed.getSession();
  const doc = session.getDocument();
  const selection = ed.getSelection();

  if (id in anchorMap) {
    anchorMap[id].forEach((id) => {
      ed.session.removeMarker(id);
    });
    delete anchorMap[id];
  }

  // Whether or not the cursor is actually at the beginning
  // or end of the selection
  let emptyClass = "";
  let stindex = anchor.stindex;
  const edindex = anchor.edindex;

  // Add selection
  let stPos, edPos, range;
  anchorMap[id] = [];

  if (stindex !== edindex) {
    stPos = doc.indexToPosition(stindex);
    edPos = doc.indexToPosition(edindex);
    range = selection.getRange();
    range.start = stPos;
    range.end = edPos;

    anchorMap[id].push(session.addMarker(range, `u-${id}`));
  }

  if (stindex === edindex) {
    stindex = Math.max(0, stindex - 1);
    emptyClass = "empty";
  }

  // Add cursor
  const index = anchor.prefixed ? stindex : edindex;
  stPos = doc.indexToPosition(index + (anchor.prefixed ? 0 : -1));
  edPos = doc.indexToPosition(index + (anchor.prefixed ? 1 : 0));
  range = ed.selection.getRange();
  range.start = stPos;
  range.end = edPos;

  anchorMap[id].push(
    session.addMarker(
      range,
      `u-${id} ${emptyClass} cursor ${anchor.prefixed ? "left" : "right"}`
    )
  );
};

export const removeIdSelectionClient = (ed: AceEditor["editor"], id) => {
  document.querySelector(`#users li.u-${id}`).remove();
  document.querySelector(`#style-${id}`).remove();
  if (id in anchorMap) {
    anchorMap[id].forEach((m) => ed.getSession().removeMarker(m));
    delete anchorMap[id];
  }
};

export const idToColor = (id) => {
  let total = 0;
  for (let c of id) total += c.charCodeAt(0);

  let hex = total.toString(16);
  while (hex.length < 3) hex += hex[hex.length - 1];
  hex = hex.substr(0, 3);

  let color = "#";
  for (let c of hex) color += `${c}0`;

  return color;
};

export const clearAllSelectionClient = (ed: AceEditor["editor"]) => {
  for (let key in anchorMap) removeIdSelectionClient(ed, key);
};
