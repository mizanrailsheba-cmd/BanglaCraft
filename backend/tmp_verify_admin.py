from app.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password


db = SessionLocal()
u = db.query(User).filter(User.email == 'admin@banglacraft.com').first()
print('exists', bool(u))
if u:
    print('status', u.status)
    print('role', u.role)
    print('verify', verify_password('BanglaCraft@Admin1', u.hashed_password))
    print('hash', u.hashed_password)
db.close()
