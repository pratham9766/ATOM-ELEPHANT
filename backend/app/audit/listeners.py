from datetime import UTC, datetime

from sqlalchemy import event, inspect
from sqlalchemy.orm import Mapper

from app.audit.context import get_audit_actor
from app.models.enums import AuditAction


def _snapshot(target: object) -> dict:
    data: dict = {}
    for column in inspect(target).mapper.column_attrs:
        value = getattr(target, column.key)
        data[column.key] = str(value) if value is not None else None
    return data


def install_audit_listeners(audited_models: list[type]) -> None:
    for model in audited_models:
        event.listen(model, "after_insert", _after_insert)
        event.listen(model, "after_update", _after_update)


def _target_id(target: object):
    identity = inspect(target).identity
    if identity:
        return identity[0]
    return getattr(target, "id", None)


def _after_insert(mapper: Mapper, connection, target: object) -> None:
    from app.models.audit_log import AuditLog

    table = AuditLog.__table__
    target_id = _target_id(target)
    if target_id is None:
        return
    connection.execute(
        table.insert().values(
            entity_type=mapper.local_table.name,
            entity_id=target_id,
            action=AuditAction.create,
            old_value=None,
            new_value=_snapshot(target),
            changed_by=get_audit_actor(),
            timestamp=datetime.now(UTC),
        )
    )


def _after_update(mapper: Mapper, connection, target: object) -> None:
    from app.models.audit_log import AuditLog

    state = inspect(target)
    old_value: dict = {}
    new_value: dict = {}
    for attr in state.attrs:
        history = attr.history
        if history.has_changes():
            old_value[attr.key] = str(history.deleted[0]) if history.deleted else None
            new_value[attr.key] = str(history.added[0]) if history.added else None
    if not new_value:
        return
    target_id = _target_id(target)
    if target_id is None:
        return
    connection.execute(
        AuditLog.__table__.insert().values(
            entity_type=mapper.local_table.name,
            entity_id=target_id,
            action=AuditAction.update,
            old_value=old_value,
            new_value=new_value,
            changed_by=get_audit_actor(),
            timestamp=datetime.now(UTC),
        )
    )
