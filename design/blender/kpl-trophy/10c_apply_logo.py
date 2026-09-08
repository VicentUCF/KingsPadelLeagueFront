"""Install the verified SVG union as the physical wordmark in Blender."""
import bpy
import bmesh
import json
from pathlib import Path
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
model=bpy.data.collections['KPL | Trophy · 400 mm']
for o in list(model.objects):
    if o.name.startswith('Badge | official KPL'):
        bpy.data.objects.remove(o,do_unlink=True)
row=json.loads((OUT/'logo-solid.json').read_text())
me=bpy.data.meshes.new('KPL | unified SVG silhouette');me.from_pydata(row['vertices'],[],row['faces']);me.update()
bm=bmesh.new();bm.from_mesh(me)
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=.0000001)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
bm.to_mesh(me);bm.free()
o=bpy.data.objects.new('Badge | official KPL unified SVG',me);model.objects.link(o)
o.parent=bpy.data.objects['KPL_Trophy'];o.location=(0,-.0348,.305);o.rotation_euler=(1.57079632679,0,0)
me.materials.append(bpy.data.materials['Lettering | warm platinum'])
bevel=o.modifiers.new('Perimeter bevel after vector union','BEVEL');bevel.width=.00010;bevel.segments=3
o['part_family']='body';o['source_svg']='public/KPL/KPL.svg';o['paint_overlap_resolved_in']='2D'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kpl-trophy.blend'))
print('Verified 2D SVG union installed')
