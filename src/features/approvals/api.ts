export async function approveGoal(goalId: string) {
  return {
    endpoint: `/api/v1/approvals/${goalId}/approve`,
    method: "POST",
    optimistic: true,
    auditEvent: "goal.approved"
  };
}
