"""Encode the Blender renders for Astro and record their actual file metadata."""
from pathlib import Path
from PIL import Image
import json, struct, hashlib

source=Path(__file__).resolve().parent
root=source.parents[2]
destination=root/'public/images/kpl'
destination.mkdir(parents=True,exist_ok=True)
assets=[]
for variant in ('closed','open','transparent'):
    image=Image.open(source/f'kpl-briefcase-{variant}.png').convert('RGBA')
    assert image.size==(1600,1200)
    if variant=='transparent':
        assert image.getchannel('A').getextrema()==(0,255)
    for width in (1600,800):
        resized=image if width==1600 else image.resize((800,600),Image.Resampling.LANCZOS)
        if variant!='transparent': resized=resized.convert('RGB')
        path=destination/f'kpl-briefcase-{variant}{"-800" if width==800 else ""}.webp'
        resized.save(path,'WEBP',quality=90,method=6)
        with Image.open(path) as check: assert check.size==resized.size
        assets.append(dict(id=path.stem,url='/'+str(path.relative_to(root/'public')),format='image/webp',width=resized.width,height=resized.height,bytes=path.stat().st_size,alpha=variant=='transparent'))

glb=root/'public/models/kpl/kpl-briefcase.glb'
with glb.open('rb') as f:
    magic,version,length=struct.unpack('<4sII',f.read(12))
    assert magic==b'glTF' and version==2 and length==glb.stat().st_size
    length,kind=struct.unpack('<II',f.read(8)); document=json.loads(f.read(length))
assert len(document['scenes'])==1 and len(document['meshes'])==13
assert [a['name'] for a in document['animations']]==['KPL_Open']
triangles=sum(document['accessors'][p['indices']]['count']//3 for m in document['meshes'] for p in m['primitives'])
assets.append(dict(id='kpl-briefcase-3d',url='/models/kpl/kpl-briefcase.glb',format='model/gltf-binary',bytes=glb.stat().st_size,meshes=13,triangles=triangles,animation='KPL_Open',sha256=hashlib.sha256(glb.read_bytes()).hexdigest()))
manifest=dict(id='kpl-briefcase',purpose='Visual del maletín de cartas para la web de Kings Padel League',created='2026-09-08',production='Modelado mediante MCP de Blender; render Cycles; WebP codificado desde PNG',reference='public/cards/maletin-cartas-apertura.mp4',brand_source='public/kpl-logo-wordmark.png',rights='Vídeo y logo existentes en el proyecto del usuario; no se declara una licencia adicional. Geometría creada en esta sesión.',alt='Maletín metálico negro de Kings Padel League con cierres dorados',decorative_alt='',crop='Conservar la proporción 4:3; preferir object-fit: contain.',runtime_note='GLB con materiales PBR; microtexturas procedurales disponibles en el .blend y en los renders. Requiere iluminación de entorno en un visor.',verification=['Inspección visual de renders','Reimportación GLB en Blender y comprobación de apertura','Estructura GLB y dimensiones/alpha de WebP verificados'],assets=assets)
(source/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(assets,ensure_ascii=False,indent=2))
