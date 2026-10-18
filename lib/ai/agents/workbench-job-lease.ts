/**
 * 作业所有权校验：校验组织、Worker、领取时间与任务有效状态，阻止失去租约的执行者继续发起 CRM 副作用。
 */
import type { Pool } from "pg";
import { claimOfJob } from "@/lib/agent-engine/queue/claim";
import type { JobRow } from "@/lib/agent-engine/queue/queue";

/** 长任务失去队列租约时，在 CRM 写入前拒绝继续执行。 */
export async function assertWorkbenchJobLease(
  pool: Pool,
  job: JobRow,
  workerId: string,
): Promise<void> {
  const claim = claimOfJob(job);
  if (!claim || claim.worker_id !== workerId) throw new Error("workbench_job_lease_missing");
  const { rows } = await pool.query<{ current: boolean }>(
    `select exists (
       select 1 from job_queue j
       join ai_workbench_runs r on r.organization_id=j.organization_id
         and r.id=(j.payload->>'runId')::uuid
       where j.id=$1 and j.organization_id=$2 and j.status='running'
         and j.locked_by=$3 and j.locked_at=$4::timestamptz
         and r.status<>'cancelled'
         and (r.mission_id is null or exists (
           select 1 from ai_missions m
           join ai_agents a on a.organization_id=r.organization_id and a.id=r.agent_id
           join ai_agent_versions v on v.organization_id=a.organization_id
             and v.agent_id=a.id and v.id::text=(r.runtime_state->>'versionId')
           where m.organization_id=r.organization_id and m.id=r.mission_id
             and m.status not in ('cancelled','completed')
             and a.is_active and a.archived_at is null and a.paused_at is null
             and a.operation_mode='automatic'
             and (
               (a.origin='builtin' and a.model_binding_mode='organization_default'
                 and a.builtin_key is not null and v.status='draft')
               or (a.origin='user' and a.published_version_id=v.id and v.status='published')
             )
         ))
     ) as current`,
    [job.id, job.organization_id, workerId, claim.acquired_at],
  );
  if (!rows[0]?.current) throw new Error("workbench_job_lease_lost");
}
