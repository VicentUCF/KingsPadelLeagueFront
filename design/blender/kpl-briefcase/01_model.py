"""Run through Blender MCP. Geometry authored from the supplied opening video."""
import bpy, math, os
from mathutils import Vector
ROOT = '/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
OUT = ROOT + '/design/blender/kpl-briefcase'
os.makedirs(ROOT + '/public/models/kpl', exist_ok=True)
os.makedirs(ROOT + '/public/images/kpl', exist_ok=True)
scene = bpy.data.scenes.new('KPL | Studio')
bpy.context.window.scene = scene
collection = bpy.data.collections.new('KPL | Briefcase')
scene.collection.children.link(collection)

def move(obj):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

def material(name, color, metallic, roughness, brushed=False):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metallic
    p.inputs['Roughness'].default_value=roughness
    m.diffuse_color=(*color,1)
    if brushed:
        n=m.node_tree.nodes; l=m.node_tree.links
        tc=n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeVectorMath'); mapping.operation='MULTIPLY'
        mapping.inputs[1].default_value=(5,1600,180)
        noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=1; noise.inputs['Detail'].default_value=2
        ramp=n.new('ShaderNodeMapRange'); ramp.inputs['To Min'].default_value=roughness*.75; ramp.inputs['To Max'].default_value=roughness*1.25
        bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.12; bump.inputs['Distance'].default_value=.000025
        l.new(tc.outputs['Generated'],mapping.inputs[0]); l.new(mapping.outputs[0],noise.inputs['Vector'])
        l.new(noise.outputs['Fac'],ramp.inputs[0]); l.new(ramp.outputs[0],p.inputs['Roughness'])
        l.new(noise.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])
        if 'Anisotropic IOR Level' in p.inputs: p.inputs['Anisotropic IOR Level'].default_value=.35
    return m

alu=material('Aluminium | satin brushed',(.52,.55,.58),1,.27,True)
chrome=material('Chrome | cast handle',(.68,.71,.74),1,.19,True)
black=material('Black anodised aluminium',(.023,.028,.032),.85,.32,True)
edge=material('Black corner protectors',(.012,.016,.018),.5,.3)
rubber=material('Gasket | EPDM',(.006,.008,.01),0,.68)
gold=material('Gold anodised release buttons',(.66,.40,.045),.78,.24)
foam=material('Charcoal foam lining',(.015,.018,.022),0,.91)
n=foam.node_tree.nodes; l=foam.node_tree.links; p=n.get('Principled BSDF')
noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=260
bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.35; bump.inputs['Distance'].default_value=.0003
l.new(noise.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])

def parent(obj, par):
    if par:
        bpy.context.view_layer.update()
        world=obj.matrix_world.copy(); obj.parent=par; obj.matrix_world=world
    return obj

def box(name, loc, size, mat, bevel=.001, par=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=move(bpy.context.object); o.name=name; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Manufactured edge radii','BEVEL'); mod.width=bevel; mod.segments=3
        mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    for f in o.data.polygons: f.use_smooth=True
    return parent(o,par)

def outline(w,d,r,steps=8):
    pts=[]
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for i in range(steps+1):
            a=math.radians(start+i*90/steps); pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    return pts

def ring(name,w,d,z0,z1,thick,r,mat,par=None):
    a=outline(w,d,r); b=outline(w-2*thick,d-2*thick,max(.001,r-thick))
    N=len(a); verts=[(x,y,z) for z,pts in [(z0,a),(z1,a),(z0,b),(z1,b)] for x,y in pts]; faces=[]
    for i in range(N):
        j=(i+1)%N
        faces.extend([(i,j,N+j,N+i),(2*N+j,2*N+i,3*N+i,3*N+j),(N+i,N+j,3*N+j,3*N+i),(j,i,2*N+i,2*N+j)])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); collection.objects.link(o); o.data.materials.append(mat)
    mod=o.modifiers.new('Machined edges','BEVEL'); mod.width=.0005; mod.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    for f in mesh.polygons: f.use_smooth=True
    return parent(o,par)

def cylinder(name,loc,radius,depth,mat,axis='Z',par=None,vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    o=move(bpy.context.object); o.name=name
    if axis=='Y': o.rotation_euler.x=math.pi/2
    if axis=='X': o.rotation_euler.y=math.pi/2
    o.data.materials.append(mat)
    mod=o.modifiers.new('Edge radius','BEVEL'); mod.width=.00035; mod.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    for p in o.data.polygons: p.use_smooth=True
    return parent(o,par)

def screw(name,x,y,z,axis='Y',par=None):
    o=cylinder(name,(x,y,z),.0023,.0012,chrome,axis,par)
    if axis=='Y': box(name+' slot',(x,y-.0008,z),(.0026,.00025,.00045),edge,.0001,par)
    else: box(name+' slot',(x,y,z+.0008),(.0026,.00045,.00025),edge,.0001,par)
    return o

root=bpy.data.objects.new('KPL_Briefcase',None); collection.objects.link(root)
lid=bpy.data.objects.new('Lid_Hinge',None); collection.objects.link(lid); lid.location=(0,.147,.089)
lid.parent=root
base=bpy.data.objects.new('Base',None); collection.objects.link(base); base.parent=root
box('Base | bottom shell',(0,0,.010),(.474,.294,.012),black,.009,base)
ring('Base | ribbed aluminium shell',.48,.30,.014,.081,.006,.014,black,base)
ring('Base | top aluminium extrusion',.482,.302,.078,.087,.009,.014,alu,base)
ring('Base | extrusion groove',.4824,.3024,.080,.081,.001,.014,chrome,base)
ring('Seal | black perimeter gasket',.478,.298,.087,.090,.006,.013,rubber,base)
box('Interior | recessed foam tray',(0,0,.022),(.452,.272,.017),foam,.008,base)
ring('Interior | foam wall lining',.463,.283,.026,.078,.009,.012,foam,base)
ring('Lid | aluminium frame',.482,.302,.091,.110,.010,.014,alu,lid)
ring('Lid | extrusion line',.4824,.3024,.104,.105,.001,.014,chrome,lid)
box('Lid | black outer panel',(0,0,.109),(.461,.281,.009),black,.011,lid)
box('Lid | brushed inner panel',(0,0,.102),(.454,.274,.003),alu,.008,lid)
ring('Lid | inside black seal',.46,.28,.096,.101,.003,.009,rubber,lid)

# Physical, fine-pitch fluting on all four sides and on the outer lid.
for i in range(89):
    x=-.22+i*.005
    for y in [-.150,.150]: box('Body flute %02d'%i,(x,y,.046),(.0013,.0012,.062),black,.0004,base)
    box('Lid flute %02d'%i,(x,0,.114),(.0011,.268,.0011),black,.00035,lid)
for i in range(51):
    y=-.125+i*.005
    for x in [-.240,.240]: box('Side flute %02d'%i,(x,y,.046),(.0012,.0013,.062),black,.0004,base)

# Molded corner guards split at the gasket, with visible steel screws.
for x in [-.229,.229]:
    for y in [-.139,.139]:
        box('Corner | base',(x,y,.022),(.025,.025,.028),edge,.006,base)
        box('Corner | lid',(x,y,.103),(.025,.025,.027),edge,.006,lid)
        screw('Corner rivet',x,y,.117,'Z',lid)
        if y<0: screw('Lower corner rivet',x,-.152,.023,'Y',base)
for x in [-.19,.19]:
    for y in [-.105,.105]: box('Rubber foot',(x,y,.004),(.035,.028,.008),rubber,.004,base)

# Two functioning toggle-latch assemblies, black housings and gold push releases.
for x in [-.135,.135]:
    box('Latch | mounting strap',(x,-.153,.046),(.026,.006,.074),edge,.003,base)
    box('Latch | lower housing',(x,-.159,.066),(.037,.014,.038),edge,.004,base)
    box('Latch | clasp',(x,-.167,.082),(.029,.007,.030),chrome,.003,base)
    box('Latch | inset',(x,-.171,.086),(.021,.001,.009),edge,.002,base)
    box('Latch | gold release',(x,-.169,.052),(.021,.006,.011),gold,.002,base)
    box('Latch | upper catch',(x,-.157,.102),(.037,.016,.015),edge,.003,lid)
    cylinder('Latch | hinge pin',(x,-.166,.097),.0025,.031,chrome,'X',lid)
    screw('Latch lower fixing',x,-.157,.023,par=base)

# Cast metal handle with an open centre, soft bends and flattened grip.
for x in [-.078,.078]:
    box('Handle | mounting bracket',(x,-.159,.073),(.021,.012,.031),alu,.003,base)
    screw('Handle mounting screw',x,-.166,.083,par=base)
    cylinder('Handle | pivot',(x,-.170,.073),.005,.019,chrome,'X',base)
curve=bpy.data.curves.new('Cast handle centreline','CURVE'); curve.dimensions='3D'; curve.resolution_u=24; curve.bevel_depth=.0065; curve.bevel_resolution=5
spline=curve.splines.new('BEZIER'); spline.bezier_points.add(5)
for p,co in zip(spline.bezier_points,[(-.078,-.174,.074),(-.074,-.187,.035),(-.058,-.19,.027),(.058,-.19,.027),(.074,-.187,.035),(.078,-.174,.074)]):
    p.co=co; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
handle=bpy.data.objects.new('Handle | curved polished casting',curve); collection.objects.link(handle); curve.materials.append(chrome); parent(handle,base)
box('Handle | satin grip insert',(0,-.196,.028),(.10,.003,.005),alu,.002,base)
for x in [-.14,.14]:
    box('Hinge | base leaf',(x,.153,.073),(.046,.005,.022),alu,.002,base)
    box('Hinge | lid leaf',(x,.153,.104),(.046,.005,.018),alu,.002,lid)
    for j in range(5): cylinder('Hinge | knuckle',(x+(j-2)*.009,.153,.089),.0045,.0085,chrome,'X',lid if j%2 else base)

# Brand image is the existing KPL artwork; UVs keep it intact in the GLB.
logo=bpy.data.images.load(ROOT+'/public/kpl-logo-wordmark.png',check_existing=True)
decal=bpy.data.materials.new('KPL | official logo'); decal.use_nodes=True
n=decal.node_tree.nodes; l=decal.node_tree.links; p=n.get('Principled BSDF'); tex=n.new('ShaderNodeTexImage'); tex.image=logo
l.new(tex.outputs['Color'],p.inputs['Base Color']); l.new(tex.outputs['Alpha'],p.inputs['Alpha'])
p.inputs['Roughness'].default_value=.34; p.inputs['Metallic'].default_value=.25
decal.surface_render_method='DITHERED'
def badge(name,z,w,inside=False):
    box(name+' | plaque',(0,-.006,z+(.0005 if inside else -.0005)),(w*1.1,w*.49,.002),edge,.005,lid)
    bpy.ops.mesh.primitive_plane_add(size=1,location=(0,-.006,z+(-.00065 if inside else .00065)))
    o=move(bpy.context.object); o.name=name; o.scale=(w,w*logo.size[1]/logo.size[0],1)
    if inside: o.rotation_euler.x=math.pi
    o.data.materials.append(decal); parent(o,lid)
badge('KPL | exterior badge',.116,.083)
badge('KPL | interior badge',.099,.135,True)
for frame,angle in [(1,0),(18,0),(78,-105),(108,-105)]:
    lid.rotation_euler.x=math.radians(angle); lid.keyframe_insert(data_path='rotation_euler',frame=frame)
lid.animation_data.action.name='KPL_Open'
scene.frame_start=1; scene.frame_end=108; scene.render.fps=30; scene.frame_set(1)
print('KPL model created:',len(collection.objects),'objects; units are metres; hinge is animated.')
