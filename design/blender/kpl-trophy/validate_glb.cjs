const fs = require('node:fs');
const assert = require('node:assert/strict');
const validator = require('/tmp/kpl-trophy-web-tools/node_modules/gltf-validator');
const root = '/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro';
const path = root + '/public/models/kpl/kpl-trophy.glb';
const out = root + '/design/blender/kpl-trophy/glb-validation.json';
(async () => {
  const bytes = fs.readFileSync(path);
  const report = await validator.validateBytes(new Uint8Array(bytes), { uri: 'kpl-trophy.glb', maxIssues: 200 });
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  assert.equal(json.meshes.length, 7, 'Only the seven trophy material groups should be exported');
  assert.equal(json.materials.length, 7);
  assert.equal(json.cameras, undefined);
  assert(json.nodes.every(n => !/cube|camera|light|crown pearl|padel|racket/i.test(n.name || '')));
  assert(json.images.length >= 6, 'Normal and roughness textures must be embedded');
  assert(json.images.every(i => i.bufferView !== undefined && !i.uri));
  let triangles = 0;
  for (const mesh of json.meshes) for (const p of mesh.primitives) {
    triangles += json.accessors[p.indices].count / 3;
    const material = json.materials[p.material];
    if (material.normalTexture) assert(p.attributes.TANGENT !== undefined, 'Baked normals need exported tangents');
  }
  report.assetAudit = { meshCount: json.meshes.length, materialCount: json.materials.length,
    embeddedImages: json.images.length, triangles, bytes: bytes.length, externalResources: 0 };
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ errors: report.issues.numErrors, warnings: report.issues.numWarnings,
    ...report.assetAudit, messages: report.issues.messages }, null, 2));
  assert.equal(report.issues.numErrors, 0);
})();
