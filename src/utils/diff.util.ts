export function getDiff(base: any, object: any) {
  const result = [];

  if (base == null || object == null) {
    result.push({
      path: [""],
      value: object,
    });
    return result;
  }

  const diffDict = keyChanges(base, object);

  for (const key of Object.keys(diffDict)) {
    const value = diffDict[key];
    result.push({
      path: key.split("."),
      value,
    });
  }

  return result;
}

function getKey(key) {
  if (isNaN(Number(key))) {
    return key;
  } else {
    return Number(key);
  }
}

export function applyDiff(obj: any, diffs) {
  let result = obj;
  for (const diff of diffs) {
    if (diff.path[0] === "") {
      result = diff.value;
      return result;
    } else {
      let parent = result;
      let path: string[] = diff.path.slice(0);
      while (path[1] != null) {
        const key = path.shift();
        parent = parent[getKey(key)];
      }
      const key = path[0];
      if (diff.value.type === "+" || diff.value.type === "e") {
        parent[getKey(key)] = diff.value.value;
      } else {
        delete parent[getKey(key)];
      }
    }
  }
  return result;
}

function keyChanges(base, object) {
  const changes = {};

  function walkObject(base, object, path = "") {
    for (const key of Object.keys(base)) {
      const currentPath = path === "" ? key : `${path}.${key}`;

      if (object[key] === undefined) {
        changes[currentPath] = {
          type: "-",
        };
      }
    }

    for (const [key, value] of Object.entries(object)) {
      const currentPath = Array.isArray(object)
        ? path + `.${key}`
        : path === ""
        ? key
        : `${path}.${key}`;

      if (base[key] === undefined) {
        changes[currentPath] = {
          type: "+",
          value: object[key],
        };
      } else if (value !== base[key]) {
        if (typeof value === "object" && typeof base[key] === "object") {
          walkObject(base[key], value, currentPath);
        } else {
          changes[currentPath] = {
            type: "e",
            value: object[key],
          };
        }
      }
    }
  }

  walkObject(base, object);

  return changes;
}
