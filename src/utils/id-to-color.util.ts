export const idToColor = (id: string) => {
  let total = 0;
  for (let c of id) total += c.charCodeAt(0);

  let hex = total.toString(16);
  while (hex.length < 3) hex += hex[hex.length - 1];
  hex = hex.substr(0, 3);

  let color = "#";
  for (let c of hex) color += `${c}0`;

  return color;
};
