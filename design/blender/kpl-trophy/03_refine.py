"""Refinements after checking the first photograph against the reference."""
import bpy
OUT='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy'
scene=bpy.data.scenes['KPL | Champions Trophy']
bpy.context.window.scene=scene
# User correction: the generated project SVG is the complete identity.
for o in list(bpy.data.collections['KPL | Trophy · 400 mm'].objects):
    if o.name.startswith(('Badge | crown', 'Badge | padel', 'Badge | racket')):
        bpy.data.objects.remove(o,do_unlink=True)
    elif o.name.startswith('Badge | official KPL contour'):
        o.location.x=0
        o.scale.x=1.17
        o.scale.y=1.17
for name in ['Gold | satin directional brushing','Gold | folded shadow planes']:
    m=bpy.data.materials[name];p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(.67,.365,.095,1) if 'satin' in name else (.43,.215,.049,1)
    m.diffuse_color=p.inputs['Base Color'].default_value
    for n in m.node_tree.nodes:
        if n.type=='VECT_MATH':n.inputs[1].default_value=(650,650,6)
        if n.type=='MAP_RANGE':
            n.inputs['To Min'].default_value=.20;n.inputs['To Max'].default_value=.35
        if n.type=='BUMP':n.inputs['Distance'].default_value=.000065;n.inputs['Strength'].default_value=.24
for name in ['Obsidian | satin ceramic core','Obsidian | fine textured pedestal','Badge | deep black enamel']:
    m=bpy.data.materials[name];p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Metallic'].default_value=.08
    p.inputs['Specular IOR Level'].default_value=.23
    p.inputs['Roughness'].default_value=.26 if 'enamel' in name else .32
for o in bpy.data.collections['KPL | Photography'].objects:
    if o.type=='LIGHT':o.data.energy*=.36
bpy.data.objects['Softbox | frontal lettering'].data.energy=1.25
scene.view_settings.exposure=-.6
# Unbroken longitudinal folds on the black central spine.
o=bpy.data.objects['Core | continuous obsidian V spine']
N=(len(o.data.vertices)-1)//2
for i,v in enumerate(o.data.vertices):
    v.co.y=-.017+abs(v.co.x)*.20+(0.023 if N<=i<2*N else 0)
# The central lozenge has two broad faces, joined on its vertical ridge.
o=bpy.data.objects['Crown | raised folded diamond']
for i,v in enumerate(o.data.vertices):
    if i in [0,2,8]:v.co.y=-.034
    if i in [1,3]:v.co.y=-.019
# Slightly bolder dedication lettering for the reference's physical plaque.
for o in bpy.data.collections['KPL | Trophy · 400 mm'].objects:
    if o.name.startswith('Inscription |'):
        o.data.space_character=1.33
        o.data.size*=1.13
        o.data.extrude=.0004
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/kpl-trophy.blend')
print('Gold, black surfaces and longitudinal folds refined')
