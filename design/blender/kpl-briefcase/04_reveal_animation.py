"""Build the twelve-second reveal using the approved briefcase. Execute via MCP."""
import bpy, math, os
from mathutils import Vector, Quaternion
ROOT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
OUT=ROOT+'/design/blender/kpl-briefcase/reveal'
os.makedirs(OUT+'/frames',exist_ok=True)
scene=bpy.context.scene; scene.name='KPL | Reveal'
scene.frame_set(1)
root=bpy.data.objects['KPL_Briefcase']; lid=bpy.data.objects['Lid_Hinge']; base=bpy.data.objects['Base']
for o in [root,lid,base]: o.animation_data_clear()
root.location=(0,0,0); root.rotation_euler=(0,0,0); lid.rotation_euler=(0,0,0)
bpy.context.view_layer.update()
collection=bpy.data.collections['KPL | Briefcase']
def attach(o,p):
    bpy.context.view_layer.update(); w=o.matrix_world.copy(); o.parent=p; o.matrix_world=w
def empty(name,loc,parent=None):
    o=bpy.data.objects.new(name,None); collection.objects.link(o); o.location=loc
    if parent: attach(o,parent)
    return o
def ease(o):
    if not o.animation_data or not o.animation_data.action: return
    for layer in o.animation_data.action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for k in fc.keyframe_points:
                        k.interpolation='BEZIER'; k.handle_left_type='AUTO_CLAMPED'; k.handle_right_type='AUTO_CLAMPED'
def transform_key(o,frame,loc=None,rot=None):
    if loc is not None: o.location=loc; o.keyframe_insert(data_path='location',frame=frame)
    if rot is not None: o.rotation_euler=rot; o.keyframe_insert(data_path='rotation_euler',frame=frame)

# Tip around the hinge-side supporting edge; dense keys prevent floor penetration.
for f in range(1,289):
    u=max(0,min(1,(f-26)/46)); u=u*u*(3-2*u)
    theta=-math.pi/2*(1-u)
    transform_key(root,f,(0,.158*(1-math.cos(theta)),-.158*math.sin(theta)),(theta,0,0))
root.animation_data.action.name='KPL_Reveal_Root'
# The exterior badge reads upright when the case is carried handle-up.
badge=bpy.data.objects['KPL | exterior badge']; badge.rotation_euler.z=math.pi

# Separate levers pivot around their lower attachments. Their upper catches stay on the lid.
for side,x,start in [('Left',-.135,84),('Right',.135,112)]:
    pivot=empty('Latch_'+side+'_Pivot',(x,-.167,.067),base)
    for o in list(collection.objects):
        if (o.name.startswith('Latch | clasp') or o.name.startswith('Latch | inset')) and abs(o.matrix_world.translation.x-x)<.005:
            attach(o,pivot)
    for f,deg in [(1,0),(start,0),(start+5,-4),(start+19,120),(start+25,112),(288,112)]:
        transform_key(pivot,f,rot=(math.radians(deg),0,0))
    pivot.animation_data.action.name='KPL_Reveal_'+side+'Latch'; ease(pivot)
    button=next(o for o in collection.objects if o.name.startswith('Latch | gold release') and abs(o.matrix_world.translation.x-x)<.005)
    loc=button.location.copy()
    for f,press in [(1,0),(start-3,0),(start+2,.002),(start+10,0),(288,0)]:
        q=loc.copy(); q.y+=press; transform_key(button,f,loc=q)
    button.animation_data.action.name='KPL_Reveal_'+side+'Release'; ease(button)

for f,deg in [(1,0),(144,0),(153,-8),(174,-92),(186,-111),(201,-105),(288,-105)]:
    transform_key(lid,f,rot=(math.radians(deg),0,0))
lid.animation_data.action.name='KPL_Reveal_Lid'; ease(lid)

# Camera: orbit during the tip, close view for the two latches, then pull back for the fan.
data=bpy.data.cameras.new('Reveal | camera'); camera=bpy.data.objects.new('Camera | cinematic reveal',data)
scene.collection.objects.link(camera); scene.camera=camera; data.lens=48
target=bpy.data.objects.new('Camera | animated target',None); scene.collection.objects.link(target)
track=camera.constraints.new('TRACK_TO'); track.target=target; track.track_axis='TRACK_NEGATIVE_Z'; track.up_axis='UP_Y'
camera_keys=[(1,(.30,1.38,.50),(0,.19,.18)),(26,(.30,1.38,.50),(0,.19,.18)),(46,(1.30,.40,.56),(0,.09,.12)),(62,(1.0,-.65,.54),(0,-.01,.09)),(78,(.15,-.88,.40),(0,-.045,.065)),(139,(.15,-.88,.40),(0,-.045,.065)),(182,(.10,-1.46,.73),(0,-.005,.22)),(220,(.04,-1.75,.81),(0,-.02,.30)),(250,(.015,-1.75,.81),(0,-.02,.30)),(288,(.015,-1.75,.81),(0,-.02,.30))]
for f,pos,look in camera_keys:
    transform_key(camera,f,pos); transform_key(target,f,look)
ease(camera); ease(target)

def mat(name,color,metal,rough):
    m=bpy.data.materials.new(name); m.use_nodes=True; p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    return m
card_edge=mat('Cards | gold foil edges',(.52,.30,.045),.8,.24)
card_black=mat('Cards | black reverse',(.008,.012,.016),.12,.4)
def cube(name,loc,size,material,parent,bevel=.001):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name
    for c in list(o.users_collection): c.objects.unlink(o)
    collection.objects.link(o); o.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    b=o.modifiers.new('Rounded card edge','BEVEL'); b.width=bevel; b.segments=3; b.use_clamp_overlap=False
    o.modifiers.new('Card normals','WEIGHTED_NORMAL'); attach(o,parent); return o

cards=['restas-tu','robo-saque','2-vs-1','comodin','robo-carta','solo-un-saque','cambiate']
# Existing artwork has transparent margins; crop in UV coordinates, preserving source images.
bounds={}
for card in cards:
    im=bpy.data.images.load(ROOT+'/public/cards/'+card+'.png',check_existing=True)
    import numpy as np
    pixels=np.empty(len(im.pixels),dtype=np.float32); im.pixels.foreach_get(pixels)
    alpha=pixels.reshape(im.size[1],im.size[0],4)[:,:,3]; ys,xs=np.where(alpha>.5)
    bounds[card]=(int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
    m=bpy.data.materials.new('Card artwork | '+card); m.use_nodes=True
    n=m.node_tree.nodes; links=m.node_tree.links; p=n.get('Principled BSDF'); tex=n.new('ShaderNodeTexImage'); tex.image=im
    links.new(tex.outputs['Color'],p.inputs['Base Color']); links.new(tex.outputs['Alpha'],p.inputs['Alpha'])
    links.new(tex.outputs['Color'],p.inputs['Emission Color']); p.inputs['Emission Strength'].default_value=.18
    p.inputs['Roughness'].default_value=.85; p.inputs['Specular IOR Level'].default_value=.05; m.surface_render_method='DITHERED'
    i=cards.index(card); stack=(0,0,.033+i*.0019)
    rig=empty('Card_'+card,stack,root)
    body=cube('Card body | '+card,stack,(.084,.118,.0015),card_edge,rig,.0006)
    backing=cube('Card face | '+card,(0,0,stack[2]+.0009),(.081,.115,.0004),card_black,rig,.0004)
    bpy.ops.mesh.primitive_plane_add(size=1,location=(0,0,stack[2]+.0012)); o=bpy.context.object; o.name='Card print | '+card
    for c in list(o.users_collection): c.objects.unlink(o)
    collection.objects.link(o); o.scale=(.075,.095,1); o.data.materials.append(m)
    x0,y0,x1,y1=bounds[card]; uv=o.data.uv_layers.active
    for loop in uv.data:
        u,v=loop.uv; loop.uv=((x0+u*(x1-x0))/im.size[0],(y0+v*(y1-y0))/im.size[1])
    attach(o,rig)
    # The centre card leads; others follow in alternating pairs.
    rank={3:0,2:1,4:2,1:3,5:4,0:5,6:6}[i]; start=182+rank*4
    x=(i-3)*.125; z=.51-.0115*(i-3)**2; final=Vector((x,-.17,z))
    cam_final=Vector(camera_keys[-1][1]); look_final=Vector(camera_keys[-1][2])
    rotation=(cam_final-look_final).to_track_quat('Z','Y') @ Quaternion((0,0,1),math.radians((3-i)*5))
    final_rot=rotation.to_euler()
    path=[(1,stack,(0,0,0)),(start,stack,(0,0,0)),(start+13,(x*.12,-.07,.125),(math.radians(25),0,math.radians((i-3)*-4))),(start+30,(x*.55,-.20,z+.065),(math.radians(70),math.radians((i-3)*7),math.radians((3-i)*9))),(start+49,tuple(final+Vector((0,0,.012))),tuple(final_rot)),(start+61,tuple(final),tuple(final_rot)),(288,tuple(final),tuple(final_rot))]
    for f,loc,rot in path: transform_key(rig,f,loc,rot)
    rig.animation_data.action.name='KPL_Reveal_Card_'+card; ease(rig)

light=bpy.data.lights.new('Reveal | interior gold light','AREA'); light.shape='RECTANGLE'; light.size=.22; light.size_y=.12; light.color=(1,.63,.20)
o=bpy.data.objects.new('Reveal | interior gold light',light); scene.collection.objects.link(o); o.location=(0,0,.051); o.rotation_euler.x=math.pi; attach(o,root)
for f,energy in [(1,0),(145,0),(169,2.5),(191,4),(231,.5),(260,.15),(288,.15)]:
    light.energy=energy; light.keyframe_insert(data_path='energy',frame=f)
fill=bpy.data.lights.new('Reveal | camera softbox','AREA'); fill.energy=9; fill.shape='RECTANGLE'; fill.size=.5; fill.size_y=.4
o=bpy.data.objects.new('Reveal | camera softbox',fill); scene.collection.objects.link(o); o.parent=camera; o.location=(-.25,.25,-.2)
scene.frame_start=1; scene.frame_end=288; scene.render.fps=24
card_black.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.05
card_black.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.85
scene.render.resolution_x=1920; scene.render.resolution_y=1080; scene.render.resolution_percentage=100
scene.render.engine='CYCLES'; scene.cycles.samples=64; scene.cycles.use_denoising=True
scene.eevee.taa_render_samples=64; scene.eevee.use_raytracing=True
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGB'
scene.render.film_transparent=False
scene.timeline_markers.clear()
for name,f in [('DE PIE',1),('TUMBAR',26),('CIERRE IZQUIERDO',84),('CIERRE DERECHO',112),('ABRIR TAPA',144),('SALIDA CARTAS',182),('EXPOSICION FINAL',267)]: scene.timeline_markers.new(name,frame=f)
scene.frame_set(1); bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-reveal.blend')
print('Reveal saved: 288 frames, 24 fps, separate latch pivots, seven animated cards.')
