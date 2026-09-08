"""Concealed mechanical connections and final surface calibration."""
import bpy
from mathutils import Vector
OUT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy'
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
model=bpy.data.collections['KPL | Trophy · 400 mm'];root=bpy.data.objects['KPL_Trophy']
root.scale=(1,1,1)
for o in model.objects:
    if o.name.startswith('Badge | official KPL contour'):
        o.location.y=-.0348
    if o.name in ['Front L | crown pennant','Front R | crown pennant']:
        for v in list(o.data.vertices)[4:8]:
            v.co.y=-.0145-max(v.co.z-.367,0)*.197
    if o.name.startswith('Core | fine gold seam'):
        for s in o.data.splines:
            for p in s.points:p.co.y=-.017+abs(p.co.x)*.20-.0002
o=bpy.data.objects['Crown | diamond outline']
for s in o.data.splines:
    for p in s.points:p.co.y=-.034+abs(p.co.x)/.027*.015-.00015
def support(name,loc,size):
    if bpy.data.objects.get(name):return
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for c in list(o.users_collection):c.objects.unlink(o)
    model.objects.link(o);o.parent=root;o.data.materials.append(bpy.data.materials['Obsidian | satin ceramic core'])
    m=o.modifiers.new('Edge radius','BEVEL');m.width=.0004;m.segments=2
    o['part_family']='body'
support('Crown | concealed structural bridge',(0,-.008,.335),(.012,.019,.031))
for matname in ['Gold | satin directional brushing','Gold | folded shadow planes']:
    for n in bpy.data.materials[matname].node_tree.nodes:
        if n.type=='VECT_MATH':n.inputs[1].default_value=(160,160,3)
        if n.type=='BUMP':n.inputs['Distance'].default_value=.00010;n.inputs['Strength'].default_value=.24
# Physical height includes edge radii; normalize once to exactly 400 mm.
bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
top=0
for o in model.objects:
    if o.type not in {'MESH','CURVE','FONT'}:continue
    e=o.evaluated_get(dg);me=e.to_mesh()
    top=max(top,max((e.matrix_world @ v.co).z for v in me.vertices))
    e.to_mesh_clear()
root.scale=(.400/top,)*3
root['height_mm']=400
scene.render.resolution_x=1600;scene.render.resolution_y=2000;scene.cycles.samples=128
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-trophy.blend')
print('Connections saved. Physical height 400 mm; nominal scale',root.scale[:])
