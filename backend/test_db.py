import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '.')
import db
db.init_db()
print('[db] Connected to Neon and tables created successfully!')
