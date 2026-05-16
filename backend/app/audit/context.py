from contextvars import ContextVar
from uuid import UUID

audit_actor: ContextVar[UUID | None] = ContextVar("audit_actor", default=None)


def set_audit_actor(actor_id: UUID | None) -> None:
    audit_actor.set(actor_id)


def get_audit_actor() -> UUID | None:
    return audit_actor.get()
