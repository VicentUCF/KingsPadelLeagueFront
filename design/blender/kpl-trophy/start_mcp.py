"""Start the installed Blender MCP addon for this modelling session."""
import bpy
import sys
from pathlib import Path

saved = Path(__file__).parent / 'kpl-trophy.blend'
if saved.exists():
    bpy.ops.wm.open_mainfile(filepath=str(saved))

sys.path.insert(0, '/home/vicent_ucf/.config/blender/5.2/scripts/addons')
import blender_mcp

if not hasattr(bpy.types.Scene, 'blendermcp_port'):
    blender_mcp.register()
if not hasattr(bpy.types, 'blendermcp_server') or bpy.types.blendermcp_server is None:
    bpy.ops.blendermcp.start_server()
print('KPL trophy: Blender MCP ready', flush=True)
