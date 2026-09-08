"""Exact solid union, keyed sectioning, STL export, and manufacturing checks.

Run with Python containing trimesh, manifold3d, numpy and networkx.
All mesh coordinates and exported STL coordinates are millimetres.
"""
import json
from pathlib import Path
import numpy as np
import trimesh
import manifold3d

OUT=Path('/home/vicent_ucf/Documents/Personal/KingsPadelLeagueAstro/design/blender/kpl-trophy/print')
rows=json.loads((OUT/'source-meshes.json').read_text())
sources=[]
for row in rows:
    m=trimesh.Trimesh(row['vertices'],row['faces'],process=True)
    if not m.is_volume:raise ValueError('Invalid source: '+row['name'])
    sources.append(m)
solid=trimesh.boolean.union(sources,engine='manifold')
assert solid.is_volume and len(solid.split())==1
assert abs(solid.extents[2]-400)<.005

def box(dims,center):
    m=trimesh.creation.box(dims);m.apply_translation(center);return m
def slab(z0,z1):return box([400,400,z1-z0],[0,0,(z0+z1)/2])
def union(*ms):return trimesh.boolean.union(ms,engine='manifold')
def diff(a,b):return trimesh.boolean.difference([a,b],engine='manifold')
def intersect(a,b):return trimesh.boolean.intersection([a,b],engine='manifold')

# Cut at the base seat and along the continuous middle spine.
z1,z2=80.,235.
base=intersect(solid,slab(-1,z1))
middle=intersect(solid,slab(z1,z2))
upper=intersect(solid,slab(z2,401))
# Asymmetric 14 x 10 and 12 x 8 mm rectangular keys prevent rotation.
# Female clearance is 0.25 mm per side, plus 0.5 mm in insertion depth.
base=union(base,box([14,10,12],[0,0,84]))
middle=diff(middle,box([14.5,10.5,11],[0,0,85]))
middle=union(middle,box([12,8,12],[0,-3,239]))
upper=diff(upper,box([12.5,8.5,11],[0,-3,240]))

report={'units':'mm','source_components':len(sources),'boolean_engine':'manifold3d',
    'height_mm':float(solid.extents[2]),'section_planes_mm':[z1,z2],
    'female_clearance_per_wall_mm':.25,'female_extra_depth_mm':.5,
    'key_profiles_mm':[[14,10],[12,8]],'files':[],
    'physical_print_tested':False,'notes':[
        'Geometric checks establish closed connected volumes, not printer calibration or material strength.',
        'Print at 100% in mm. Model gold and surface brushing are digital materials; physical parts require finishing.',
        'Supports are required under the projecting fins and badge. Preview all layers in the intended slicer.',
        'Nominal main blade stock is 4–5 mm; cast edges and pointed ends taper below this.',
        'Test the included fit coupon before the full trophy. Clearance can depend on printer and material.'
    ]}

def export(name,m,assembly_z=0,kind='trophy'):
    placed=m.copy();placed.apply_translation([0,0,-assembly_z])
    # Remove sub-STL-precision slivers from exact intersections. Surface error
    # stays below 5 micrometres, far below a printer's useful resolution.
    manifold=manifold3d.Manifold(manifold3d.Mesh(
        np.asarray(placed.vertices,dtype=np.float32),np.asarray(placed.faces,dtype=np.uint32)))
    simplified=manifold.simplify(.005).to_mesh()
    placed=trimesh.Trimesh(simplified.vert_properties[:,:3],simplified.tri_verts,process=False)
    path=OUT/name;placed.export(path)
    read=trimesh.load_mesh(path,process=True)
    shells=read.split()
    assert read.is_watertight and read.is_winding_consistent and read.is_volume,name
    assert len(shells)==1,(name,len(shells))
    assert abs(read.bounds[0][2])<.003,(name,read.bounds)
    report['files'].append({'file':name,'kind':kind,'size_bytes':path.stat().st_size,
        'dimensions_mm':read.extents.round(4).tolist(),'triangles':len(read.faces),
        'watertight':bool(read.is_watertight),'consistent_winding':bool(read.is_winding_consistent),
        'connected_components':len(shells),'volume_mm3':float(read.volume),
        'assembly_z_mm':assembly_z})

export('kpl-trophy-full-400mm.stl',solid)
export('01-base-with-key.stl',base)
export('02-body-with-key.stl',middle,z1)
export('03-crown-with-socket.stl',upper,z2)
for name,a,b in [('base_body',base,middle),('body_crown',middle,upper)]:
    collision=intersect(a,b)
    volume=abs(float(collision.volume)) if len(collision.faces) else 0
    assert volume<.01,(name,volume)
    report[name+'_assembly_overlap_mm3']=volume
# Small dimensional calibration coupon, same 14 x 10 profile and clearance.
male=union(box([25,22,4],[0,0,2]),box([14,10,10],[0,0,8]))
female=diff(box([25,22,13],[0,0,6.5]),box([14.5,10.5,10.5],[0,0,8.25]))
export('fit-test-male.stl',male,kind='calibration')
export('fit-test-female.stl',female,kind='calibration')
(OUT/'validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'status':'PASS','height_mm':report['height_mm'],
    'parts':[{k:r[k] for k in ['file','dimensions_mm','connected_components']} for r in report['files']]},indent=2))
