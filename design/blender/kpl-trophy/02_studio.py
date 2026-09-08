"""Product photography lighting for the KPL trophy."""
import bpy
import math
from mathutils import Vector
OUT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy'
scene=bpy.data.scenes['KPL | Champions Trophy']
bpy.context.window.scene=scene
studio=bpy.data.collections.new('KPL | Photography')
scene.collection.children.link(studio)
def move(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    studio.objects.link(o)
    return o
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def camera(name,loc,target,scale):
    bpy.ops.object.camera_add(location=loc)
    o=move(bpy.context.object);o.name=name
    o.data.type='ORTHO';o.data.ortho_scale=scale
    o.data.lens=70;o.data.clip_start=.001
    aim(o,target);return o
hero=camera('Camera | hero',(0.065,-1.1,.39),(0,0,.202),.470)
camera('Camera | front',(0,-1.1,.205),(0,0,.205),.452)
camera('Camera | side',(.95,-.09,.29),(0,0,.20),.465)
camera('Camera | rear',(.025,1.1,.31),(0,0,.204),.465)
camera('Camera | detail',(.045,-.50,.345),(0,-.01,.305),.16)
scene.camera=hero
def area(name,loc,power,color,size,sy):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color
    d.shape='RECTANGLE';d.size=size;d.size_y=sy
    o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc
    aim(o,(0,0,.23));return o
area('Softbox | left tall key',(-.38,-.42,.49),32,(1,.94,.82),.26,.66)
area('Softbox | right edge',(.35,.08,.38),38,(1,.85,.61),.14,.58)
area('Softbox | high silk',(-.08,.07,.72),27,(1,.97,.88),.42,.32)
area('Softbox | frontal lettering',(.08,-.65,.29),13,(.87,.93,1),.37,.28)
area('Softbox | rear contour',(-.30,.3,.35),23,(1,.82,.56),.20,.53)
floor=bpy.data.materials.new('Studio | dark warm stone');floor.use_nodes=True
p=floor.node_tree.nodes.get('Principled BSDF')
p.inputs['Base Color'].default_value=(.008,.0065,.0048,1)
p.inputs['Roughness'].default_value=.29
p.inputs['Metallic'].default_value=.18
noise=floor.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=120
bump=floor.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12
bump.inputs['Distance'].default_value=.0001
floor.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height'])
floor.node_tree.links.new(bump.outputs[0],p.inputs['Normal'])
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.0006))
o=move(bpy.context.object);o.name='Studio | ground';o.data.materials.append(floor)
scene.world=bpy.data.worlds.new('Studio | dark neutral environment');scene.world.use_nodes=True
bg=scene.world.node_tree.nodes['Background'];bg.inputs[0].default_value=(.12,.13,.15,1);bg.inputs[1].default_value=.23
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.cycles.max_bounces=8;scene.cycles.diffuse_bounces=3;scene.cycles.glossy_bounces=5
scene.render.resolution_x=1000;scene.render.resolution_y=1250;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX';scene.view_settings.exposure=-.6
scene.render.filepath=OUT+'/preview.png'
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.region_3d.view_perspective='CAMERA'
            a.spaces.active.clip_start=.001
            a.spaces.active.shading.color_type='MATERIAL'
            a.spaces.active.overlay.show_overlays=False
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-trophy.blend')
print('Photography studio saved')
