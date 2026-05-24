# below for linux
# # Scanno_auth/app/utils.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# below for windows
# app/utils.py
# from passlib.context import CryptContext

# # Use PBKDF2 for hashing instead of bcrypt
# pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# def hash_password(password: str) -> str:
#     password = password[:72]  # Just in case, truncate if needed
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)
