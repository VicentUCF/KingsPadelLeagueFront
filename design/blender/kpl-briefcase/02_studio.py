import bpy, math, os
from mathutils import Vector
ROOT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
OUT=ROOT+'/design/blender/kpl-briefcase'
scene=bpy.data.scenes['KPL | Studio']; bpy.context.window.scene=scene
studio=bpy.data.collections.new('KPL | Photography'); scene.collection.children.link(studio)
def studio_move(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    studio.objects.link(o)
    return o
def aim(o,point): o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.47,-.88,.45))
cam=studio_move(bpy.context.object); cam.name='Camera | product three quarter'; aim(cam,(0,-.012,.057))
cam.data.type='PERSP'; cam.data.lens=54; scene.camera=cam
bpy.ops.object.camera_add(location=(.43,-.91,.61))
opencam=studio_move(bpy.context.object); opencam.name='Camera | open case'; aim(opencam,(0,0,.15)); opencam.data.lens=51
def area(name,loc,target,power,color,size,size_y):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape='RECTANGLE'; data.size=size; data.size_y=size_y
    o=bpy.data.objects.new(name,data); studio.objects.link(o); o.location=loc; aim(o,target)
area('Softbox | large key',(-.42,-.42,.75),(0,0,0),55,(.93,.96,1),.60,.40)
area('Softbox | right strip',(.55,.08,.42),(0,0,.06),45,(.86,.92,1),.20,.65)
area('Softbox | rear edge',(-.18,.40,.55),(0,0,.05),65,(1,.97,.9),.50,.20)
area('Softbox | frontal chrome',(-.05,-.60,.24),(0,-.1,.06),15,(1,1,1),.50,.10)
floor=bpy.data.materials.new('Studio | charcoal surface'); floor.use_nodes=True
p=floor.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(.012,.015,.018,1); p.inputs['Roughness'].default_value=.31; p.inputs['Metallic'].default_value=.15
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.001))
o=studio_move(bpy.context.object); o.name='Studio | floor'; o.data.materials.append(floor)
scene.world=bpy.data.worlds.new('Studio | neutral ambience'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.18,.21,1); scene.world.node_tree.nodes['Background'].inputs[1].default_value=.3
scene.render.engine='CYCLES'; scene.cycles.samples=96; scene.cycles.use_denoising=True
scene.cycles.max_bounces=8; scene.cycles.transparent_max_bounces=8
scene.render.resolution_x=1600; scene.render.resolution_y=1200; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX'
scene.render.film_transparent=False
scene.render.filepath=OUT+'/kpl-briefcase-closed.png'
scene.frame_set(1)
dark=bpy.data.objects['Lid | black outer panel'].data.materials[0].copy(); dark.name='Lid | dark anodised finish'
p=dark.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(.006,.008,.011,1); p.inputs['Metallic'].default_value=.55
for n in dark.node_tree.nodes:
    if n.type=='MAP_RANGE': n.inputs['To Min'].default_value=.32; n.inputs['To Max'].default_value=.48
for o in bpy.data.collections['KPL | Briefcase'].objects:
    if o.name.startswith('Lid flute') or o.name=='Lid | black outer panel': o.data.materials[0]=dark
bpy.data.objects['Handle | curved polished casting'].data.bevel_depth=.008
for o in studio.objects:
    if o.type=='LIGHT': o.data.energy*=.72
scene.view_settings.exposure=-.8
bpy.data.objects['Softbox | rear edge'].data.energy=8
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.16
opencam.location=Vector((0,0,.15))+(opencam.location-Vector((0,0,.15)))*1.18
p=floor.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(.005,.007,.009,1); p.inputs['Roughness'].default_value=.38
for screen in bpy.data.screens:
    for area_ in screen.areas:
        if area_.type=='VIEW_3D':
            area_.spaces.active.region_3d.view_perspective='CAMERA'
            area_.spaces.active.clip_end=1000
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-briefcase.blend')
print('Studio and editable .blend saved.')
