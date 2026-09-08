"""Web GLB with one combined timeline and animated camera, exported through MCP."""
import bpy,os
from collections import defaultdict
ROOT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
scene=bpy.data.scenes['KPL | Reveal']; bpy.context.window.scene=scene; scene.frame_set(1)
source=bpy.data.collections['KPL | Briefcase']
export=bpy.data.collections.new('KPL | Reveal export temporary'); scene.collection.children.link(export)
clones={}
empties=[o for o in source.objects if o.type=='EMPTY']
while empties:
    for original in list(empties):
        if original.parent and original.parent.name not in clones: continue
        o=original.copy(); export.objects.link(o); o.name=original.name+'_web'; clones[original.name]=o
        if original.parent: o.parent=clones[original.parent.name]
        empties.remove(original)
bpy.context.view_layer.update(); deps=bpy.context.evaluated_depsgraph_get(); groups=defaultdict(list)
for original in source.objects:
    if original.type not in {'MESH','CURVE'}: continue
    mesh=bpy.data.meshes.new_from_object(original.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
    o=original.copy() if original.type=='MESH' else bpy.data.objects.new(original.name+'_web',mesh)
    o.data=mesh; export.objects.link(o); o.name=original.name+'_web'
    o.modifiers.clear(); o.parent=clones[original.parent.name]; o.matrix_parent_inverse=original.matrix_parent_inverse.copy(); o.matrix_basis=original.matrix_basis.copy()
    if not original.animation_data:
        groups[(original.parent.name,mesh.materials[0].name)].append(o)
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1: bpy.ops.object.join()
    objects[0].name=key[0]+' | '+key[1]
materials={}
for o in export.objects:
    if o.type!='MESH': continue
    for slot in o.material_slots:
        original=slot.material
        if original.name not in materials:
            m=original.copy();m.name=original.name+' | Reveal PBR';p=m.node_tree.nodes.get('Principled BSDF')
            for socket in ['Roughness','Normal']:
                for link in list(p.inputs[socket].links):m.node_tree.links.remove(link)
            if 'dark anodised' in original.name:p.inputs['Roughness'].default_value=.42
            materials[original.name]=m
        slot.material=materials[original.name]
camera=scene.camera.copy();export.objects.link(camera);camera.name='KPL_Reveal_Camera'
bpy.ops.object.select_all(action='DESELECT')
for o in export.objects:o.select_set(True)
name=scene.name;scene.name='KPL_Reveal'
path=ROOT+'/public/models/kpl/kpl-reveal.glb'
bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,use_active_scene=True,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_bake_animation=True,export_frame_range=True,export_cameras=True,export_lights=False)
scene.name=name
print('Reveal exported:',len(export.objects),'nodes,',os.path.getsize(path),'bytes')
for o in list(export.objects):bpy.data.objects.remove(o,do_unlink=True)
bpy.data.collections.remove(export)
scene.frame_set(1);bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/design/blender/kpl-briefcase/reveal/kpl-reveal.blend')
