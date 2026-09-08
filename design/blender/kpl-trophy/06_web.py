"""Bake PBR surface maps and export an eight-material, self-contained web GLB.

Run against the saved trophy using Blender in background. The editable master
retains its procedural materials and separate, named parts.
"""
import bpy
import json
from collections import defaultdict
from pathlib import Path
ROOT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro')
OUT=ROOT/'design/blender/kpl-trophy'
WEB=ROOT/'public/models/kpl'
TEX=OUT/'web-textures'
WEB.mkdir(parents=True,exist_ok=True);TEX.mkdir(exist_ok=True)
source=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=source
dg=bpy.context.evaluated_depsgraph_get()
staged=[]
for o in bpy.data.collections['KPL | Trophy · 400 mm'].objects:
    if o.type not in {'MESH','CURVE','FONT'}:continue
    e=o.evaluated_get(dg)
    me=bpy.data.meshes.new_from_object(e,depsgraph=dg)
    me.transform(e.matrix_world)
    obj=bpy.data.objects.new(o.name,me)
    staged.append((obj,o.data.materials[0].name))
scene=bpy.data.scenes.new('KPL | Web PBR')
bpy.context.window.scene=scene
scene.render.engine='CYCLES';scene.cycles.samples=8
scene.render.threads_mode='FIXED';scene.render.threads=10
scene.render.bake.margin=8;scene.render.bake.normal_space='TANGENT'
groups=defaultdict(list)
for o,name in staged:
    scene.collection.objects.link(o);groups[name].append(o)
exports=[]
for idx,(name,obs) in enumerate(groups.items()):
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs:o.select_set(True)
    bpy.context.view_layer.objects.active=obs[0]
    bpy.ops.object.join()
    o=bpy.context.object;o.name='KPL · '+name.split(' | ')[0]+' · '+str(idx)
    # Reuse the evaluated normals; each original part is already bevelled.
    mat=bpy.data.materials[name].copy();mat.name='Web | '+name
    o.data.materials.clear();o.data.materials.append(mat)
    for p in o.data.polygons:p.material_index=0
    tri=o.modifiers.new('Explicit triangles for web tangent basis','TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=tri.name)
    n,l=mat.node_tree.nodes,mat.node_tree.links;p=n.get('Principled BSDF')
    if any(x.type=='BUMP' for x in n):
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.012)
        bpy.ops.object.mode_set(mode='OBJECT')
        maps={}
        size=1024 if 'satin directional' in name else 512
        for kind in ['NORMAL','ROUGHNESS']:
            image=bpy.data.images.new('KPL_'+str(idx)+'_'+kind,width=size,height=size,alpha=False)
            image.colorspace_settings.name='Non-Color'
            target=n.new('ShaderNodeTexImage');target.image=image;n.active=target;target.select=True
            bpy.ops.object.bake(type=kind)
            image.filepath_raw=str(TEX/(image.name.lower()+'.png'));image.file_format='PNG';image.save();image.pack()
            maps[kind]=(image,target)
        for key in ['Roughness','Normal']:
            for link in list(p.inputs[key].links):l.remove(link)
        normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=1
        l.new(maps['NORMAL'][1].outputs['Color'],normal.inputs['Color'])
        l.new(normal.outputs[0],p.inputs['Normal'])
        l.new(maps['ROUGHNESS'][1].outputs['Color'],p.inputs['Roughness'])
    exports.append(o)
    print('Prepared web surface',name,len(o.data.polygons),flush=True)
root=bpy.data.objects.new('KPL_Trophy',None);scene.collection.objects.link(root)
root['height_m']=.4;root['front']='glTF +Z';root['source']='KPL supplied reference; project KPL vector without crown or ball'
for o in exports:o.parent=root
bpy.ops.object.select_all(action='SELECT')
filepath=WEB/'kpl-trophy.glb'
bpy.ops.export_scene.gltf(filepath=str(filepath),export_format='GLB',use_selection=True,
    export_yup=True,export_apply=True,use_active_scene=True,export_animations=False,export_cameras=False,
    export_lights=False,export_extras=True,export_materials='EXPORT',export_tangents=True)
triangles=sum(len(o.data.loop_triangles) for o in exports)
for o in exports:o.data.calc_loop_triangles()
triangles=sum(len(o.data.loop_triangles) for o in exports)
(OUT/'web-export.json').write_text(json.dumps({'file':str(filepath),'bytes':filepath.stat().st_size,
    'mesh_count':len(exports),'triangles':triangles,'materials':len(groups),
    'height_m':.4,'baked_pbr_maps':[x.name for x in TEX.glob('*.png')]},indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kpl-trophy-web.blend'))
print('WEB_COMPLETE',filepath,filepath.stat().st_size,triangles,flush=True)
