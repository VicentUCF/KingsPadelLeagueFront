"""Resolve SVG paint overlap as a 2D union, then extrude a single silhouette."""
import json
from pathlib import Path
import numpy as np
import trimesh
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely import affinity
OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy')
rows=json.loads((OUT/'logo-contours.json').read_text())
polygons=[]
for rings in rows:
    rings=sorted(rings,key=lambda r:abs(Polygon(r).area),reverse=True)
    p=Polygon(rings[0],rings[1:]);assert p.is_valid
    polygons.append(p)
union=unary_union(polygons)
assert union.is_valid
# SVG fills paint over one another. The overlap may never become a hole.
overlap=polygons[0].intersection(polygons[1])
assert overlap.area>0 and union.covers(overlap)
x0,y0,x1,y1=union.bounds
scale=53.82/(x1-x0)
union=affinity.translate(union,-(x0+x1)/2,-(y0+y1)/2)
union=affinity.scale(union,xfact=scale,yfact=scale,origin=(0,0))
union=union.simplify(.001,preserve_topology=True)
parts=[union] if union.geom_type=='Polygon' else list(union.geoms)
meshes=[trimesh.creation.extrude_polygon(p,1.3,engine='earcut') for p in parts]
m=trimesh.util.concatenate(meshes);m.vertices[:,2]-=.65
assert m.is_volume
(OUT/'logo-solid.json').write_text(json.dumps({'vertices':(m.vertices/1000).tolist(),'faces':m.faces.tolist()}))
report={'source':'public/KPL/KPL.svg','construction':'2D union, then one extrusion',
    'source_overlap_is_filled':True,'original_KP_overlap_area':overlap.area,
    'silhouette_components':len(parts),'holes':sum(len(p.interiors) for p in parts),
    'width_mm':53.82,'extrusion_mm':1.3,'valid_volume':bool(m.is_volume)}
(OUT/'logo-validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
