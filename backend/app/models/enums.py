from enum import StrEnum


class UserRole(StrEnum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class SheetStatus(StrEnum):
    draft = "draft"
    submitted = "submitted"
    rework = "rework"
    approved = "approved"
    locked = "locked"


class GoalStatus(StrEnum):
    draft = "draft"
    active = "active"
    locked = "locked"
    archived = "archived"


class UomType(StrEnum):
    numeric_min = "numeric_min"
    numeric_max = "numeric_max"
    timeline = "timeline"
    zero = "zero"


class Quarter(StrEnum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"


class CheckinStatus(StrEnum):
    not_started = "not_started"
    on_track = "on_track"
    completed = "completed"
    reviewed = "reviewed"


class AuditAction(StrEnum):
    create = "CREATE"
    update = "UPDATE"
    submit = "SUBMIT"
    approve = "APPROVE"
    return_for_rework = "RETURN_FOR_REWORK"
    lock = "LOCK"
    admin_unlock = "ADMIN_UNLOCK"
    checkin_save = "CHECKIN_SAVE"
    comment = "COMMENT"


class EscalationTrigger(StrEnum):
    not_submitted = "not_submitted"
    not_approved = "not_approved"
    checkin_missing = "checkin_missing"


class EscalationLevel(StrEnum):
    employee = "employee"
    manager = "manager"
    hr = "hr"


class EscalationStatus(StrEnum):
    open = "open"
    resolved = "resolved"
