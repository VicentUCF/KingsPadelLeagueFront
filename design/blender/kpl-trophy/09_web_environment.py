"""Self-authored HDR studio panorama for consistent web metal reflections."""
import bpy
from mathutils import Vector
from pathlib import Path
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/public/models/kpl')
source=bpy.data.collections['KPL | Photography']
specs=[(o.name,o.location.copy(),o.rotation_euler.copy(),o.data.size,o.data.size_y,tuple(o.data.color)) for o in source.objects if o.type=='LIGHT']
scene=bpy.data.scenes.new('KPL | Web environment');bpy.context.window.scene=scene
scene.world=bpy.data.worlds.new('KPL | HDR background');scene.world.use_nodes=True
bg=scene.world.node_tree.nodes['Background'];bg.inputs[0].default_value=(.06,.064,.07,1);bg.inputs[1].default_value=1
for i,(name,loc,rot,w,h,color) in enumerate(specs):
    bpy.ops.mesh.primitive_plane_add(size=1,location=loc)
    o=bpy.context.object;o.name=name;o.rotation_euler=rot;o.scale=(w,h,1)
    m=bpy.data.materials.new('HDR card '+str(i));m.use_nodes=True
    n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
    e=n.new('ShaderNodeEmission');e.inputs['Color'].default_value=(*color,1)
    e.inputs['Strength'].default_value=3.5 if 'frontal' not in name else .55
    output=n.new('ShaderNodeOutputMaterial');l.new(e.outputs[0],output.inputs['Surface']);o.data.materials.append(m)
bpy.ops.object.camera_add(location=(0,0,.215))
camera=bpy.context.object;camera.data.type='PANO';camera.data.panorama_type='EQUIRECTANGULAR'
camera.rotation_euler=(1.57079632679,0,0);scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=8
scene.render.threads_mode='FIXED';scene.render.threads=2
scene.render.resolution_x=1024;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='HDR';scene.render.image_settings.color_mode='RGB'
scene.render.filepath=str(OUT/'kpl-trophy-studio.hdr')
bpy.ops.render.render(write_still=True)
print('HDR_COMPLETE',scene.render.filepath,flush=True)
