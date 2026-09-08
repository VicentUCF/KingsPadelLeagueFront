"""Package only verified current deliverables, reference assets and instructions."""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from PIL import Image
ROOT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro')
OUT=ROOT/'design/blender/kpl-trophy'
REF=OUT/'reference';REF.mkdir(exist_ok=True)
WEB=OUT/'web';WEB.mkdir(exist_ok=True)
IMAGES=ROOT/'public/images/kpl';IMAGES.mkdir(parents=True,exist_ok=True)
shutil.copy2('/home/vicent_ucf/.codex/attachments/646cdb7c-c7c1-495d-b05e-cd9ed37fe84b/image-1.png',REF/'trophy-reference.png')
shutil.copy2(ROOT/'public/KPL/KPL.svg',REF/'KPL.svg')
for name in ['kpl-trophy.glb','kpl-trophy-studio.hdr']:
    shutil.copy2(ROOT/'public/models/kpl'/name,WEB/name)
master=OUT/'kpl-trophy.blend'
views=['hero','front','side','rear','detail','transparent']
render_checks=[]
for view in views:
    path=OUT/('kpl-trophy-'+view+'.png')
    assert path.stat().st_mtime>=master.stat().st_mtime,('Stale render',view)
    with Image.open(path) as im:
        im.load()
        alpha=im.getchannel('A').getextrema() if 'A' in im.getbands() else None
        if view=='transparent':assert alpha==(0,255)
        render_checks.append({'view':view,'size':list(im.size),'alpha_range':alpha})
        if view in ['hero','transparent']:
            im.thumbnail((1200,1500),Image.Resampling.LANCZOS)
            im.save(IMAGES/('kpl-trophy-'+view+'.webp'),quality=92,method=6)
            shutil.copy2(IMAGES/('kpl-trophy-'+view+'.webp'),WEB/('kpl-trophy-'+view+'.webp'))
glb=json.loads((OUT/'glb-validation.json').read_text())
browser=json.loads((OUT/'browser-validation.json').read_text())
printing=json.loads((OUT/'print/validation.json').read_text())
assert glb['issues']['numErrors']==0 and glb['issues']['numWarnings']==0
assert browser['pageErrors']==[] and browser['drawCalls']==7
assert all(r['watertight'] and r['connected_components']==1 for r in printing['files'])
assert abs(browser['dimensionsMetres'][1]-.4)<.0001
files=[master,OUT/'kpl-trophy-web.blend',OUT/'README.md',OUT/'kpl-trophy-web-preview.png']
files += [OUT/('kpl-trophy-'+v+'.png') for v in views]
files += list(WEB.glob('*'))+list(REF.glob('*'))+list((OUT/'print').glob('*.stl'))
files += [OUT/'print/validation.json',OUT/'glb-validation.json',OUT/'browser-validation.json',OUT/'web-export.json',OUT/'logo-validation.json']
files += [p for p in OUT.glob('*.py') if p.name not in ['10_logo_fix.py']]
files += [OUT/'validate_glb.cjs',OUT/'logo-contours.json',OUT/'logo-solid.json']
manifest={'name':'KPL Champions Trophy','height_mm':400,'logo':'Generated KPL SVG, no crown or ball; 2D union before extrusion',
    'renders':render_checks,'files':[{'file':str(p.relative_to(OUT)),'bytes':p.stat().st_size,
    'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
files.append(OUT/'manifest.json')
archive=OUT/'kpl-trophy-delivery.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in files:z.write(p,Path('KPL-Trophy')/p.relative_to(OUT))
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'archive':str(archive),'bytes':archive.stat().st_size,'files':len(files),'renders':render_checks},indent=2))
