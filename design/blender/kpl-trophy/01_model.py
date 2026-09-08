"""KPL Champions Trophy, authored in metres through Blender MCP.

400 mm overall, reference-derived folded gold fins and stepped black pedestal.
No generated geometry, raster logos or downloaded models are used.
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector

ROOT = '/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro'
OUT = ROOT + '/design/blender/kpl-trophy'
os.makedirs(OUT, exist_ok=True)
scene = bpy.data.scenes.new('KPL | Champions Trophy')
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.unit_settings.scale_length = 1
model = bpy.data.collections.new('KPL | Trophy · 400 mm')
scene.collection.children.link(model)
root = bpy.data.objects.new('KPL_Trophy', None)
model.objects.link(root)
root['height_mm'] = 400
root['reference'] = 'Supplied KPL Champions Trophy concept sheet'
root['front'] = '-Y; Z up; dimensions in metres'

def move(o):
    for c in list(o.users_collection):
        c.objects.unlink(o)
    model.objects.link(o)
    o.parent = root
    return o

def mat(name, color, metal, rough, brushed=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*color, 1)
    n, l = m.node_tree.nodes, m.node_tree.links
    p = n.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if brushed:
        tc = n.new('ShaderNodeTexCoord')
        mul = n.new('ShaderNodeVectorMath'); mul.operation = 'MULTIPLY'
        mul.inputs[1].default_value = (1250, 1250, 32)
        noise = n.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 1
        noise.inputs['Detail'].default_value = 2
        ramp = n.new('ShaderNodeMapRange')
        ramp.inputs['To Min'].default_value = rough * .79
        ramp.inputs['To Max'].default_value = rough * 1.18
        bump = n.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .16
        bump.inputs['Distance'].default_value = .000016
        l.new(tc.outputs['Generated'], mul.inputs[0])
        l.new(mul.outputs[0], noise.inputs['Vector'])
        l.new(noise.outputs['Fac'], ramp.inputs[0])
        l.new(ramp.outputs[0], p.inputs['Roughness'])
        l.new(noise.outputs['Fac'], bump.inputs['Height'])
        l.new(bump.outputs[0], p.inputs['Normal'])
        for key in ['Anisotropic IOR Level', 'Anisotropic']:
            if key in p.inputs:
                p.inputs[key].default_value = .28
    return m

gold = mat('Gold | satin directional brushing', (.76, .475, .16), 1, .29, True)
bright = mat('Gold | polished edge highlights', (.86, .59, .25), 1, .19)
darkgold = mat('Gold | folded shadow planes', (.48, .275, .076), 1, .32, True)
black = mat('Obsidian | satin ceramic core', (.008, .009, .011), .38, .27)
stone = mat('Obsidian | fine textured pedestal', (.011, .012, .014), .20, .32)
n, l = stone.node_tree.nodes, stone.node_tree.links
noise = n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 160
noise.inputs['Detail'].default_value = 3
bump = n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .15
bump.inputs['Distance'].default_value = .000035
l.new(noise.outputs['Fac'], bump.inputs['Height'])
l.new(bump.outputs[0], n.get('Principled BSDF').inputs['Normal'])
enamel = mat('Badge | deep black enamel', (.004, .005, .006), .22, .19)
ivory = mat('Lettering | warm platinum', (.84, .79, .65), .72, .23)

def finish(o, material, bevel=.0005, smooth=False):
    o.data.materials.append(material)
    if bevel:
        m = o.modifiers.new('Manufactured edge radius', 'BEVEL')
        m.width = bevel; m.segments = 3
    if smooth:
        for f in o.data.polygons: f.use_smooth = True
        o.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    o['part_family'] = 'body'
    return o

def mesh(name, verts, faces, material, bevel=.0005, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces); me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); model.objects.link(o); o.parent = root
    return finish(o, material, bevel, smooth)

def lathe(name, rings, material, count=128, bevel=.0004, ellipse=1):
    verts = [(r*math.cos(2*math.pi*i/count), r*math.sin(2*math.pi*i/count)*ellipse, z)
             for z,r in rings for i in range(count)]
    faces = [tuple(range(count-1,-1,-1))]
    for j in range(len(rings)-1):
        for i in range(count):
            a=j*count+i; b=j*count+(i+1)%count
            faces.append((a,b,b+count,a+count))
    faces.append(tuple((len(rings)-1)*count+i for i in range(count)))
    return mesh(name,verts,faces,material,bevel,count>16)

def box(name,loc,size,material,bevel=.0005):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=move(bpy.context.object); o.name=name; o.dimensions=size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o,material,bevel,True)

def wire(name,coords,radius,material):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'
    c.resolution_u=1; c.bevel_depth=radius; c.bevel_resolution=2; c.use_fill_caps=True
    s=c.splines.new('POLY'); s.points.add(len(coords)-1)
    for p,co in zip(s.points,coords): p.co=(*co,1)
    o=bpy.data.objects.new(name,c); model.objects.link(o); o.parent=root
    c.materials.append(material); o['part_family']='body'
    return o

def plate(name,outline,y,thickness,material,ridge=None,bevel=.0005,tilt=0,mirror=False):
    """Closed polygonal casting; the crease is an actual face intersection."""
    pts=[(x,y+tilt*(z-.2),z) for x,z in outline]
    if mirror: pts=[(x,-yy,z) for x,yy,z in pts]
    sign=-1 if mirror else 1
    verts=pts+[(x,yy+sign*thickness,z) for x,yy,z in pts]
    N=len(pts)
    faces=[]
    if ridge:
        x,z,fold=ridge
        cy=y+tilt*(z-.2)-fold
        verts.append((x,-cy if mirror else cy,z))
        faces += [(i,(i+1)%N,2*N) for i in range(N)]
    else: faces.append(tuple(range(N)))
    faces.append(tuple(range(N,2*N)))
    faces += [(i,N+i,N+(i+1)%N,(i+1)%N) for i in range(N)]
    return mesh(name,verts,faces,material,bevel)

# Pedestal: 156 mm diameter, low tiers, fine gold inlays.
baseparts=[]
baseparts.append(lathe('Base | lower plinth',[(0,.077),(.003,.078),(.013,.078),(.016,.075)],stone))
baseparts.append(lathe('Base | lower gold reveal',[(.015,.0748),(.017,.0748)],bright,bevel=.00025))
baseparts.append(lathe('Base | tapered central drum',[(.016,.0725),(.058,.0655)],stone))
baseparts.append(lathe('Base | upper gold reveal',[(.057,.066),(.059,.066)],bright,bevel=.00025))
baseparts.append(lathe('Base | upper black step',[(.058,.064),(.071,.0615),(.073,.060)],black))
baseparts.append(lathe('Base | crown seat',[(.072,.057),(.074,.057),(.078,.054)],gold))
baseparts.append(lathe('Base | machined seat lip',[(.075,.055),(.077,.055)],bright,bevel=.00025))
for o in baseparts:o['part_family']='base'

# Faceted gold socket neck, broad at the foot and pinched below the blades.
neck=lathe('Stem | octagonal folded gold socket',[(.077,.041),(.079,.042),(.126,.013),(.137,.0165)],gold,8,.0006,.76)
for a in [math.pi/4,3*math.pi/4,5*math.pi/4,7*math.pi/4]:
    wire('Stem | polished arris',[(.041*math.cos(a),.0312*math.sin(a),.078),(.013*math.cos(a),.00988*math.sin(a),.126),(.0165*math.cos(a),.01254*math.sin(a),.136)],.00055,bright)

# The black central spine is deliberately continuous to carry printed loads.
core_outline=[(-.010,.121),(.010,.121),(.060,.358),(.038,.347),(0,.326),(-.038,.347),(-.060,.358)]
core=plate('Core | continuous obsidian V spine',core_outline,-.006,.023,black,ridge=(0,.254,.009),bevel=.0007,tilt=-.025)
for side in [-1,1]:
    wire('Core | fine gold seam',[(side*.003,-.013,.145),(side*.012,-.019,.245),(side*.027,-.016,.335)],.00045,darkgold)

# Rear and lateral fins supply a full 360-degree crown, with depth between layers.
for side in [-1,1]:
    label='L' if side<0 else 'R'
    def pts(p):return [(side*x,z) for x,z in p]
    plate('Rear '+label+' | tall folded blade',pts([(.009,.128),(.024,.147),(.077,.383),(.059,.370),(.035,.284)]),-.018,.0045,gold,(side*.041,.274,.006),mirror=True)
    plate('Rear '+label+' | upper pennant',pts([(.037,.326),(.064,.356),(.073,.391),(.041,.370)]),-.022,.0035,gold,(side*.050,.357,.004),mirror=True)
    plate('Rear '+label+' | lower spear',pts([(.008,.128),(.027,.170),(.056,.285),(.036,.267),(.018,.199)]),-.024,.0045,gold,(side*.027,.212,.007),mirror=True)
    # Angled lateral strip, a rigid diagonal gusset between rear and front.
    lateral=plate('Side '+label+' | structural gilt fin',pts([(.012,.132),(.026,.158),(.080,.373),(.071,.376),(.045,.297)]),-.002,.018,darkgold,(side*.045,.277,.012))

# Broad front blades, blade-over-blade layering and angular swept crown tips.
for side in [-1,1]:
    label='L' if side<0 else 'R'
    def pts(p):return [(side*x,z) for x,z in p]
    plate('Front '+label+' | long outer blade',pts([(.012,.130),(.030,.166),(.086,.384),(.076,.380),(.051,.326),(.023,.216)]),-.017,.005,gold,(side*.047,.263,.009))
    wire('Front '+label+' | bright outer arris',[(side*.017,-.017,.137),(side*.030,-.017,.166),(side*.0855,-.017,.383)],.0005,bright)
    plate('Front '+label+' | mid rising spear',pts([(.015,.137),(.038,.186),(.079,.320),(.062,.306),(.030,.218)]),-.023,.004,gold,(side*.042,.241,.006))
    plate('Front '+label+' | broad lower folded leaf',pts([(.010,.126),(.028,.153),(.043,.208),(.046,.270),(.029,.250),(.016,.174)]),-.027,.005,gold,(side*.030,.204,.009))
    wire('Front '+label+' | lower leaf crease',[(side*.010,-.027,.126),(side*.030,-.036,.204),(side*.046,-.027,.270)],.00042,bright)
    plate('Front '+label+' | crown pennant',pts([(.043,.337),(.072,.366),(.081,.400),(.049,.381)]),-.025,.004,gold,(side*.059,.369,.0025))
    wire('Front '+label+' | crown edge',[(side*.043,-.025,.337),(side*.049,-.025,.381),(side*.081,-.025,.400)],.00038,bright)

# Central crown jewel: gold folded lozenge with crisp polished border.
diamond=[(0,.328),(.027,.354),(0,.380),(-.027,.354)]
plate('Crown | raised folded diamond',diamond,-.019,.006,gold,(0,.351,.015),bevel=.00065)
wire('Crown | diamond outline',[(x,-.020,z) for x,z in diamond+[diamond[0]]],.00055,bright)
# Back relief mirrors the V without duplicating the front badge.
for s in [-1,1]:
    plate('Back | chevron inset '+str(s),[(s*.003,.325),(s*.047,.357),(s*.044,.362),(s*.003,.335)],-.026,.004,gold,mirror=True)

# Cast front cartouche, rounded rectangle with a mild italic shear.
def round_outline(w,h,r,steps=8):
    p=[]
    for cx,cz,a in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(steps+1):
            t=math.radians(a+i*90/steps)
            x=cx+r*math.cos(t);z=cz+r*math.sin(t)
            p.append((x+.12*z,z+.305))
    return p
plate('Badge | gold cartouche',round_outline(.078,.031,.0045),-.033,.008,bright,bevel=.00055)
plate('Badge | black enamel inset',round_outline(.074,.027,.0035),-.0343,.002,enamel,bevel=.0003)
# Two concealed standoffs bond the plaque into the core for manufacturing.
for s in [-1,1]:box('Badge | concealed support '+str(s),(s*.020,-.022,.305),(.008,.024,.017),black,.0005)

# Exact project SVG letter contours. Curves preserve P's internal counter.
before=set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=ROOT+'/public/KPL/KPL.svg')
imported=[o for o in bpy.data.objects if o not in before]
letters=[o for o in imported if o.type=='CURVE' and len(o.data.splines)<3]
# The SVG rectangle is the largest object by width; the other objects are K/P/L.
if len(imported)!=4:
    raise RuntimeError('Expected the four project SVG contours, got '+str(len(imported)))
frame=max(imported,key=lambda o:o.dimensions.x)
letters=[o for o in imported if o!=frame]
bpy.data.objects.remove(frame,do_unlink=True)
allpoints=[o.matrix_world @ Vector(p.co[:3]) for o in letters for s in o.data.splines for p in (s.bezier_points if s.type=='BEZIER' else s.points)]
minx,maxx=min(p.x for p in allpoints),max(p.x for p in allpoints)
miny,maxy=min(p.y for p in allpoints),max(p.y for p in allpoints)
scale=.046/(maxx-minx)
for i,o in enumerate(letters):
    move(o);o.name='Badge | official KPL contour '+str(i+1)
    # Bake world coordinates into curves before placing on the XZ face.
    matrix=o.matrix_world.copy()
    for s in o.data.splines:
        if s.type=='BEZIER':
            for p in s.bezier_points:
                for attr in ['co','handle_left','handle_right']:
                    v=matrix @ getattr(p,attr)
                    setattr(p,attr,((v.x-(minx+maxx)/2)*scale,(v.y-(miny+maxy)/2)*scale,0))
        else:
            for p in s.points:
                v=matrix @ Vector(p.co[:3]);p.co=((v.x-(minx+maxx)/2)*scale,(v.y-(miny+maxy)/2)*scale,0,1)
    o.matrix_world.identity();o.location=(-.008,-.0351,.305)
    o.rotation_euler=(math.pi/2,0,0)
    o.data.dimensions='2D';o.data.fill_mode='BOTH';o.data.resolution_u=8
    o.data.extrude=.00055;o.data.bevel_depth=.00015;o.data.bevel_resolution=2
    o.data.materials.clear();o.data.materials.append(ivory)
    o['part_family']='body'

# Crown and crossed padel rackets, entirely modelled in relief.
crown=[(.018,.307),(.016,.315),(.020,.312),(.024,.317),(.028,.312),(.032,.315),(.030,.307)]
plate('Badge | crown emblem',crown,-.0355,.0012,ivory,bevel=.0002)
for x,z in [(.016,.315),(.024,.317),(.032,.315)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.00065,location=(x,-.0357,z))
    o=move(bpy.context.object);o.name='Badge | crown pearl';o.data.materials.append(ivory)
for s in [-1,1]:
    cx=.024+s*.0017;cz=.299
    pts=[]
    for i in range(25):
        t=2*math.pi*i/24
        x=.0018*math.cos(t);z=.0027*math.sin(t)
        a=s*-.48
        pts.append((cx+x*math.cos(a)-z*math.sin(a),-.0356,cz+x*math.sin(a)+z*math.cos(a)))
    wire('Badge | padel racket '+str(s),pts,.00038,ivory)
    wire('Badge | racket grip '+str(s),[(cx+s*.0011,-.0356,cz-.002),(cx+s*.0024,-.0356,cz-.0042)],.00045,ivory)

# A shallow planar title plate fits tangentially into the conical base.
base_border=box('Base | dedication gold border',(0,-.0682,.036),(.087,.006,.038),bright,.001)
base_inset=box('Base | dedication black inset',(0,-.0714,.036),(.084,.0015,.035),enamel,.0007)
base_border['part_family']=base_inset['part_family']='base'
font=bpy.data.fonts.load('/usr/share/fonts/adobe-source-sans/SourceSans3-Semibold.otf')
def inscription(name,text,z,width,size):
    c=bpy.data.curves.new(name,'FONT');c.body=text;c.align_x='CENTER';c.align_y='CENTER'
    c.font=font;c.size=size;c.space_character=1.18;c.extrude=.00025;c.bevel_depth=.000075;c.bevel_resolution=1
    o=bpy.data.objects.new(name,c);model.objects.link(o);o.parent=root
    o.location=(0,-.07235,z);o.rotation_euler=(math.pi/2,0,0);c.materials.append(ivory)
    bpy.context.view_layer.update()
    if o.dimensions.x>width:o.scale.x*=width/o.dimensions.x
    o['part_family']='base'
    return o
inscription('Inscription | league','KINGS PADEL LEAGUE',.046,.072,.0043)
inscription('Inscription | season','SEASON 2',.036,.065,.007)
inscription('Inscription | champions','CHAMPIONS',.026,.072,.007)
scene['design_note']='Reference reconstruction: folded gold blades, continuous black spine, geometric logo. Nominal height 400 mm.'
scene['manufacturing_note']='Print exports are generated separately with unioned solids and registered keyed cuts.'
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-trophy.blend')
print('KPL 400 mm trophy geometry saved:',len(model.objects),'objects')
