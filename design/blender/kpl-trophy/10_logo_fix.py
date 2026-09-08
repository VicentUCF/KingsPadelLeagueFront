"""Preserve the actual SVG fill union before adding any 3D edge treatment.

Separate bevelled K/P/L objects produce false seams where their SVG fills
overlap. The entire wordmark must be a single solid before beveling.
"""
import bpy
from mathutils import Vector, Matrix
from pathlib import Path
ROOT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro')
OUT=ROOT/'design/blender/kpl-trophy'
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
model=bpy.data.collections['KPL | Trophy · 400 mm'];root=bpy.data.objects['KPL_Trophy']
for o in list(model.objects):
    if o.name.startswith('Badge | official KPL'):
        bpy.data.objects.remove(o,do_unlink=True)
before=set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=str(ROOT/'public/KPL/KPL.svg'))
imported=[o for o in bpy.data.objects if o not in before]
frame=max(imported,key=lambda o:o.dimensions.x)
letters=[o for o in imported if o!=frame]
bpy.data.objects.remove(frame,do_unlink=True)
coords=[o.matrix_world @ p.co for o in letters for s in o.data.splines for p in s.bezier_points]
x0,x1=min(v.x for v in coords),max(v.x for v in coords)
y0,y1=min(v.y for v in coords),max(v.y for v in coords)
scale=.05382/(x1-x0)
mapping=Matrix.Scale(scale,4) @ Matrix.Translation((-(x0+x1)/2,-(y0+y1)/2,0))
for o in letters:
    # Transform all control points and handles at once, preserving the SVG's
    # exact Bezier geometry and P counter. Do not mutate handles sequentially.
    o.data.transform(mapping @ o.matrix_world)
    o.matrix_world=Matrix.Identity(4)
    for c in list(o.users_collection):c.objects.unlink(o)
    model.objects.link(o)
    o.data.extrude=.00065;o.data.bevel_depth=0;o.data.resolution_u=16
    o.data.dimensions='2D';o.data.fill_mode='BOTH'
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
    bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    o.data.materials.clear();o.data.materials.append(bpy.data.materials['Lettering | warm platinum'])
base=letters[0]
for other in letters[1:]:
    bpy.ops.object.select_all(action='DESELECT');base.select_set(True);bpy.context.view_layer.objects.active=base
    boolean=base.modifiers.new('Union of SVG fills before bevel','BOOLEAN')
    boolean.operation='UNION';boolean.solver='EXACT';boolean.object=other
    bpy.ops.object.modifier_apply(modifier=boolean.name)
    bpy.data.objects.remove(other,do_unlink=True)
base.name='Badge | official KPL unified SVG'
base.parent=root;base.location=(0,-.0348,.305);base.rotation_euler=(1.57079632679,0,0)
bevel=base.modifiers.new('Continuous wordmark edge · 0.10 mm','BEVEL')
bevel.width=.00010;bevel.segments=3;bevel.affect='EDGES'
base['part_family']='body';base['source_svg']='public/KPL/KPL.svg'
base['construction']='Boolean union of unmodified SVG fills, then one continuous bevel'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kpl-trophy.blend'))
print('Unified SVG wordmark saved:',len(base.data.vertices),'vertices',len(base.data.polygons),'faces')
