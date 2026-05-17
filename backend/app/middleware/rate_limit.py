from __future__ import annotations

import time
from collections import defaultdict, deque
from collections.abc import Callable

from fastapi import Request, Response, status
from fastapi.responses import ORJSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Small in-process limiter for local/demo use.

    Production can replace this with the same policy backed by Redis sliding windows.
    """

    def __init__(self, app, *, exclude_paths: set[str] | None = None):
        super().__init__(app)
        self.settings = get_settings()
        self.exclude_paths = exclude_paths or {"/health"}
        self._requests: defaultdict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.settings.rate_limit_enabled or request.url.path in self.exclude_paths:
            return await call_next(request)

        key = self._key(request)
        now = time.monotonic()
        window_start = now - self.settings.rate_limit_window_seconds
        bucket = self._requests[key]
        while bucket and bucket[0] < window_start:
            bucket.popleft()
        if len(bucket) >= self.settings.rate_limit_requests:
            return ORJSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": {
                        "code": "rate_limited",
                        "message": "Too many requests. Please retry shortly.",
                    }
                },
                headers={"Retry-After": str(self.settings.rate_limit_window_seconds)},
            )
        bucket.append(now)
        return await call_next(request)

    def _key(self, request: Request) -> str:
        auth = request.headers.get("authorization")
        if auth:
            return auth[-48:]
        return request.client.host if request.client else "anonymous"
