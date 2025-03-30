export interface PlacementData {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  rw: number;
}

export function getParsedIPL(raw: string) {
  const instSection = raw.split(/\n/).slice(1).join("\n").split("end")[0];
  const lines = instSection
    .split("\n")
    .filter((line) => line.trim() && !line.includes("inst"));

  const objects: PlacementData[] = lines.map((line) => {
    const [id, name, interior, x, y, z, rx, ry, rz, rw, lod] = line
      .split(",")
      .map((v) => v.trim());

    return {
      id: parseInt(id, 10),
      name: name.toString(),
      interior: parseInt(interior),
      x: parseFloat(x),
      y: parseFloat(y),
      z: parseFloat(z),
      rx: parseFloat(rx),
      ry: parseFloat(ry),
      rz: parseFloat(rz),
      rw: parseFloat(rw),
      lod: parseInt(lod),
    };
  });

  return objects;
}

export interface DefitionData {
  id: number;
  modelName: string;
  textureName: string;
  animName: string;
  drawList: string;
}

export function getParsedIDE(raw: string) {
  const instSection = raw.split(/\n/).slice(1).join("\n").split("end")[0];
  const lines = instSection
    .split("\n")
    .filter((line) => line.trim() && !line.includes("objs"));

  const objects: DefitionData[] = lines.map((line) => {
    const [id, modelName, textureName, animName, drawList] = line
      .split(",")
      .map((v) => v.trim());

    return {
      id: parseInt(id, 10),
      modelName: modelName,
      textureName: textureName,
      animName: animName,
      drawList: drawList,
    };
  });

  return objects;
}

// export async function GetMapDefinition() {
//   const data: DefitionData[] = [];

//   for (const def of []) {
//     for (const ide of def.ides) {
//       const response = await fetch(`/data/maps/${def.section}/${ide}`);
//       const raw = await response.text();
//       const parser = getParsedIDE(raw);

//       data.push(...parser);
//     }
//   }

//   return data;
// }

// export async function GetMapPlacement() {
//   const data: PlacementData[] = [];

//   for (const def of []) {
//     for (const ipl of def.ipls) {
//       const response = await fetch(`/data/maps/${def.section}/${ipl}`);
//       const raw = await response.text();
//       const parser = getParsedIPL(raw);

//       data.push(...parser);
//     }
//   }

//   return data;
// }
