"""Render a saved camera without blocking the interactive MCP session."""
import bpy
import sys
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
view=args[0] if args else 'hero'
quality=args[1] if len(args)>1 else 'preview'
scene=bpy.data.scenes['KPL | Champions Trophy']
bpy.context.window.scene=scene
scene.camera=bpy.data.objects['Camera | '+('hero' if view=='transparent' else view)]
scene.render.resolution_x=800 if quality=='preview' else 1600
scene.render.resolution_y=1000 if quality=='preview' else 2000
scene.cycles.samples=32 if quality=='preview' else 128
scene.render.threads_mode='FIXED';scene.render.threads=10
if view=='transparent':
    scene.render.film_transparent=True
    bpy.data.objects['Studio | ground'].hide_render=True
out=Path(bpy.data.filepath).parent
scene.render.filepath=str(out/('preview.png' if quality=='preview' else 'kpl-trophy-'+view+'.png'))
bpy.ops.render.render(write_still=True)
print('Rendered',scene.render.filepath)
