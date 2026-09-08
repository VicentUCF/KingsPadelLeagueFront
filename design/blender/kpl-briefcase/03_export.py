"""Export grouped geometry, preserving the editable source and hinge animation."""
import bpy, os, json
from collections import defaultdict
ROOT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
scene=bpy.data.scenes['KPL | Studio']; bpy.context.window.scene=scene; scene.frame_set(1)
source=bpy.data.collections['KPL | Briefcase']
action=bpy.data.objects['Lid_Hinge'].animation_data.action
for a in bpy.data.actions:
    if a!=action and a.name=='KPL_Open': a.name='KPL_Open_archived'
action.name='KPL_Open'
export=bpy.data.collections.new('KPL | Web export temporary'); scene.collection.children.link(export)
clones={}
for name in ['KPL_Briefcase','Base','Lid_Hinge']:
    original=bpy.data.objects[name]; o=original.copy(); export.objects.link(o); o.name=name+'_GLB'; clones[name]=o
    if original.parent: o.parent=clones[original.parent.name]
bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get(); groups=defaultdict(list)
for original in source.objects:
    if original.type not in {'MESH','CURVE'}: continue
    mesh=bpy.data.meshes.new_from_object(original.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
    o=bpy.data.objects.new(original.name+'_web',mesh); export.objects.link(o)
    o.parent=clones[original.parent.name]
    o.matrix_parent_inverse=original.matrix_parent_inverse.copy(); o.matrix_basis=original.matrix_basis.copy()
    key=(original.parent.name,mesh.materials[0].name if mesh.materials else 'none'); groups[key].append(o)
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1: bpy.ops.object.join()
    objects[0].name=key[0]+' | '+key[1]
# glTF cannot carry Cycles procedural nodes. Preserve calibrated PBR values.
materials={}
for o in export.objects:
    if o.type!='MESH': continue
    for slot in o.material_slots:
        original=slot.material
        if original.name not in materials:
            m=original.copy(); m.name=original.name.split('.00')[0]+' | Web PBR'
            p=m.node_tree.nodes.get('Principled BSDF')
            for socket in ['Roughness','Normal']:
                for link in list(p.inputs[socket].links): m.node_tree.links.remove(link)
            if 'dark anodised' in original.name: p.inputs['Roughness'].default_value=.42
            materials[original.name]=m
        slot.material=materials[original.name]
bpy.ops.object.select_all(action='DESELECT')
for o in export.objects: o.select_set(True)
path=ROOT+'/public/models/kpl/kpl-briefcase.glb'
bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,use_active_scene=True,export_animations=True,export_frame_range=True,export_cameras=False,export_lights=False,export_yup=True)
print('Exported',len(export.objects),'nodes;',os.path.getsize(path),'bytes')
for o in list(export.objects): bpy.data.objects.remove(o,do_unlink=True)
bpy.data.collections.remove(export)
scene.frame_set(1)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/design/blender/kpl-briefcase/kpl-briefcase.blend')
