"""Export evaluated, triangulated manufacturing source in millimetres."""
import bpy
import json
from pathlib import Path
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
dg=bpy.context.evaluated_depsgraph_get()
parts=[]
for o in bpy.data.collections['KPL | Trophy · 400 mm'].objects:
    if o.type not in {'MESH','CURVE','FONT'}:continue
    e=o.evaluated_get(dg);me=e.to_mesh();me.calc_loop_triangles()
    verts=[list(e.matrix_world @ v.co * 1000) for v in me.vertices]
    faces=[list(t.vertices) for t in me.loop_triangles]
    parts.append({'name':o.name,'family':o.get('part_family','body'),'vertices':verts,'faces':faces})
    e.to_mesh_clear()
(OUT/'print').mkdir(exist_ok=True)
(OUT/'print'/'source-meshes.json').write_text(json.dumps(parts,separators=(',',':')))
print('Exported',len(parts),'closed source components;',sum(len(p['faces']) for p in parts),'triangles')
