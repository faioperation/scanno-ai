# Scanno_auth/app/middleware.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class SizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_bytes: int = 30 * 1024 * 1024):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next):
        cl = int(request.headers.get("content-length") or 0)
        if cl > self.max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Request body too large ({cl/1e6:.1f} MB). Max 30 MB."
            )
        return await call_next(request)