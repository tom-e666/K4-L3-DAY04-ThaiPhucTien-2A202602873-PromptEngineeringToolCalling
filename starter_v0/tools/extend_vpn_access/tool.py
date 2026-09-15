from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Any

from tools._shared import ROOT, err

EMPLOYEE_ID_PATTERN = re.compile(r"^EMP-\d+$", re.IGNORECASE)


def extend_vpn_access(
    employee_id: str = "",
    duration_days: int = 7,
    reason: str = "",
) -> dict[str, Any]:
    """Tạo hoặc gia hạn quyền truy cập VPN từ xa cho nhân viên."""
    if not isinstance(employee_id, str):
        return {"tool": "extend_vpn_access", "error": "invalid_employee_id_type"}
    if not isinstance(reason, str):
        return {"tool": "extend_vpn_access", "error": "invalid_reason_type"}
    
    normalized_emp_id = (employee_id or "").strip().upper()
    normalized_reason = (reason or "").strip()

    if not normalized_emp_id:
        return {"tool": "extend_vpn_access", "error": "missing_employee_id"}
    if not EMPLOYEE_ID_PATTERN.fullmatch(normalized_emp_id):
        return {"tool": "extend_vpn_access", "error": "invalid_employee_id_format"}
    if not normalized_reason:
        return {"tool": "extend_vpn_access", "error": "missing_reason"}
    
    try:
        duration = int(duration_days) if duration_days else 7
    except (ValueError, TypeError):
        duration = 7

    try:
        now = datetime.now(timezone.utc)
        request_id = "VPN-" + hashlib.sha256(f"{now.isoformat()}|{normalized_emp_id}".encode()).hexdigest()[:8].upper()
        
        return {
            "tool": "extend_vpn_access",
            "status": "approved",
            "request_id": request_id,
            "employee_id": normalized_emp_id,
            "duration_days": duration,
            "reason": normalized_reason,
            "message": f"Đã gia hạn thành công quyền truy cập VPN thêm {duration} ngày cho nhân viên {normalized_emp_id}."
        }
    except Exception as exc:
        return err("extend_vpn_access", exc)
