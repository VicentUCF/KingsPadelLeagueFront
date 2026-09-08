"""Final render set, with progress written after every completed camera."""
import bpy
import json
from pathlib import Path
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
scene=bpy.data.scenes['KPL | Champions Trophy'];bpy.context.window.scene=scene
scene.render.threads_mode='FIXED';scene.render.threads=10
scene.render.image_settings.color_mode='RGBA'
results=[]
for view in ['hero','front','side','rear','detail','transparent']:
    scene.camera=bpy.data.objects['Camera | '+('hero' if view=='transparent' else view)]
    scene.render.resolution_x=1600 if view in {'hero','transparent'} else 1200
    scene.render.resolution_y=2000 if view in {'hero','transparent'} else 1500
    scene.cycles.samples=128 if view in {'hero','detail','transparent'} else 80
    scene.render.film_transparent=view=='transparent'
    bpy.data.objects['Studio | ground'].hide_render=view=='transparent'
    path=OUT/('kpl-trophy-'+view+'.png')
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    results.append({'view':view,'file':path.name,'size_bytes':path.stat().st_size,
        'resolution':[scene.render.resolution_x,scene.render.resolution_y],'samples':scene.cycles.samples})
    (OUT/'renders.json').write_text(json.dumps(results,indent=2))
    print('RENDER_DONE',view,flush=True)
print('ALL_RENDERS_COMPLETE',flush=True)
