from app.tasks.celery_app import celery_app


@celery_app.task(name="elephant.reports.generate_excel")
def generate_excel_report(report_id: str) -> dict[str, str]:
    # Future implementation: generate workbook via openpyxl, store in R2/S3, notify user.
    return {"status": "queued", "report_id": report_id}
