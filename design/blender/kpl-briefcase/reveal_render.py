import bpy,sys,os,time
scene=bpy.data.scenes['KPL | Reveal']; bpy.context.window.scene=scene
out='/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-briefcase/reveal'
args=sys.argv[sys.argv.index('--')+1:]
scene.render.engine='BLENDER_EEVEE'
scene.render.threads_mode='FIXED'; scene.render.threads=10
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGB'
if args[0]=='storyboard':
    scene.render.resolution_percentage=60; scene.eevee.taa_render_samples=16
    for f in [1,50,80,106,136,177,220,288]:
        scene.frame_set(f); scene.render.filepath=out+'/story-%03d.png'%f
        t=time.time(); bpy.ops.render.render(write_still=True); print('FRAME',f,'SECONDS',time.time()-t,flush=True)
elif args[0]=='benchmark':
    scene.frame_set(288); scene.render.filepath=out+'/benchmark.png'
    t=time.time(); bpy.ops.render.render(write_still=True); print('BENCHMARK SECONDS',time.time()-t,flush=True)
else:
    start=int(args[1]) if len(args)>1 else 1
    end=int(args[2]) if len(args)>2 else 288
    for f in range(start,end+1):
        path=out+'/frames/%04d.png'%f
        if os.path.exists(path): continue
        scene.frame_set(f); scene.render.filepath=path
        t=time.time(); bpy.ops.render.render(write_still=True); print('FRAME',f,'SECONDS',time.time()-t,flush=True)
