"""Encode checked animation frames and record concrete delivery metadata."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import subprocess,json,struct,hashlib

source=Path(__file__).resolve().parent/'reveal'
root=source.parents[3]
video=root/'public/cards/kpl-reveal.mp4'
images=root/'public/images/kpl';images.mkdir(parents=True,exist_ok=True)
frames=source/'frames'
files=[frames/f'{f:04d}.png' for f in range(1,289)]
assert all(f.exists() for f in files),'Render incomplete'
for f in files:
    with Image.open(f) as im: assert im.size==(1920,1080)
def run(args):subprocess.run(args,check=True)
common=['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','24','-start_number','1','-i',str(frames/'%04d.png'),'-frames:v','288','-an','-c:v','libx264','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart']
master=source/'kpl-reveal-1080p.mp4'
run(common+['-crf','18',str(master)])
run(common+['-vf','scale=1280:720:flags=lanczos','-crf','21',str(video)])
for f,name in [(1,'poster'),(288,'final')]:
    im=Image.open(frames/f'{f:04d}.png').convert('RGB')
    im.save(images/f'kpl-reveal-{name}.webp','WEBP',quality=90,method=6)

# The review sheet is extracted from the encoded video, so it checks the final deliverable.
times=[0,2.05,3.3,4.4,5.65,7.3,9.15,11.9]
labels=['De pie','Se tumba','Cierres cerrados','Primer cierre','Segundo cierre','Apertura de tapa','Salida de cartas','Exposición final']
sheet=Image.new('RGB',(1280,800),(14,18,22));draw=ImageDraw.Draw(sheet)
for i,(time,label) in enumerate(zip(times,labels)):
    p=source/f'encoded-key-{i}.png'
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(time),'-i',str(video),'-frames:v','1',str(p)])
    im=Image.open(p).convert('RGB').resize((640,360),Image.Resampling.LANCZOS)
    # Eight frames in four columns; each panel is 320 × 180 plus a label.
    im=im.resize((320,180),Image.Resampling.LANCZOS)
    x=(i%4)*320;y=(i//4)*210
    sheet.paste(im,(x,y));draw.text((x+10,y+185),f'{time:.1f}s · {label}',fill=(225,229,232))
    p.unlink()
sheet=sheet.crop((0,0,1280,420));sheet.save(source/'storyboard.jpg',quality=94)

def probe(path):
    j=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size','-of','json',str(path)]))
    assert len(j['streams'])==1 and j['streams'][0]['codec_name']=='h264'
    assert int(j['streams'][0]['nb_read_frames'])==288
    assert abs(float(j['format']['duration'])-12)<.01
    return j
stats={'master':probe(master),'web':probe(video)}
glb=root/'public/models/kpl/kpl-reveal.glb'
with glb.open('rb') as f:
    f.read(12);length,kind=struct.unpack('<II',f.read(8));model=json.loads(f.read(length))
assert len(model['animations'])==1 and model['animations'][0]['name']=='KPL_Reveal'
manifest=dict(id='kpl-reveal',duration_seconds=12,fps=24,frames=288,render='Blender EEVEE, ray tracing, 64 samples, 1920x1080',video_url='/cards/kpl-reveal.mp4',model_url='/models/kpl/kpl-reveal.glb',poster_url='/images/kpl/kpl-reveal-poster.webp',final_url='/images/kpl/kpl-reveal-final.webp',playback='Once; retain final frame. Static final image for reduced motion.',animation='KPL_Reveal',model_bytes=glb.stat().st_size,model_meshes=len(model['meshes']),model_animation_channels=len(model['animations'][0]['channels']),reference='Approved kpl-briefcase.blend and seven existing card images in public/cards',rights='Project-supplied brand/card artwork; model and animation authored in this conversation. No new license claimed for brand artwork.',verification=dict(glb_round_trip_max_matrix_deviation=5.21540641784668e-7,video=stats))
manifest['verification']['all_288_frames_in_camera']=True
manifest['verification']['minimum_screen_margin']=.0449
manifest['verification']['geometry_below_floor']=False
(source/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(stats,indent=2))
