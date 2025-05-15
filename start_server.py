import os
import subprocess
import sys
from pathlib import Path

# 切换到包含.env的目录
base_dir = Path(__file__).parent
server_dir = base_dir / 'server'

# 检查server.js
server_js = server_dir / 'server.js'
if not server_js.exists():
    print('server.js not found!')
    sys.exit(1)

# 启动 Node.js 服务，确保.env在当前目录
print('Starting Node.js server...')
try:
    subprocess.run(['node', 'server.js'], cwd=server_dir, check=True)
except Exception as e:
    print('Failed to start server:', e)
