"""Final hidden bridge fit and exact physical scale after profile refinement."""
import bpy
from pathlib import Path
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
bridge=bpy.data.objects['Crown | concealed structural bridge']
bridge.location.y=-.009
bridge.scale.y=.026/(max(v.co.y for v in bridge.data.vertices)-min(v.co.y for v in bridge.data.vertices))
root=bpy.data.objects['KPL_Trophy'];root.scale=(1,1,1)
bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();top=0
for o in bpy.data.collections['KPL | Trophy · 400 mm'].objects:
    if o.type not in {'MESH','CURVE','FONT'}:continue
    e=o.evaluated_get(dg);me=e.to_mesh()
    top=max(top,max((e.matrix_world @ v.co).z for v in me.vertices));e.to_mesh_clear()
root.scale=(.4/top,)*3
scene.camera=bpy.data.objects['Camera | hero']
scene.render.filepath=str(OUT/'kpl-trophy-hero.png')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kpl-trophy.blend'))
print('Final geometry and exact 400 mm scale saved')
