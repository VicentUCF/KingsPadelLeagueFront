"""Background render helper, after scene creation using Blender MCP."""
import bpy, sys
scene=bpy.data.scenes['KPL | Studio']; bpy.context.window.scene=scene
mode=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'preview'
out='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-briefcase/'
scene.render.threads_mode='FIXED'; scene.render.threads=10
scene.cycles.samples=64; scene.cycles.adaptive_threshold=.025
if mode=='preview':
    scene.render.resolution_percentage=50; scene.cycles.samples=24
    scene.render.filepath=out+'preview.png'
elif mode=='open':
    scene.frame_set(90); scene.camera=bpy.data.objects['Camera | open case']
    scene.render.filepath=out+'kpl-briefcase-open.png'
elif mode=='transparent':
    scene.render.film_transparent=True; bpy.data.objects['Studio | floor'].hide_render=True
    scene.render.filepath=out+'kpl-briefcase-transparent.png'
else: scene.render.filepath=out+'kpl-briefcase-closed.png'
bpy.ops.render.render(write_still=True)
