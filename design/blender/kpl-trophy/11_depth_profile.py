"""Taper the crown in depth as well as width, matching its sculpted profile."""
import bpy
from pathlib import Path
from mathutils import Vector
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
if not scene.get('depth_profile_final'):
    for o in bpy.data.collections['KPL | Trophy · 400 mm'].objects:
        if not o.name.startswith(('Front ','Rear ','Side ','Core |','Crown | concealed')):continue
        def taper(p):
            t=max(0,min(1,(p.z-.125)/.275))
            p.y*=.34+.66*t
        if o.type=='MESH':
            for v in o.data.vertices:taper(v.co)
            o.data.update()
        elif o.type=='CURVE':
            for s in o.data.splines:
                for p in s.points:taper(p.co)
    scene['depth_profile_final']=True
camera=bpy.data.objects['Camera | side'];camera.location=(.90,-.40,.29)
camera.rotation_euler=(Vector((0,0,.20))-camera.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kpl-trophy.blend'))
print('Tapered physical depth profile saved')
