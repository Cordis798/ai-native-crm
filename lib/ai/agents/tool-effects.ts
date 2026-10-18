/**
 * 工具副作用分类：读取、可补偿写入、外部动作和不可逆动作分别进入对应执行策略。未登记的工具返回空分类，由 Harness 拒绝执行。
 */
import { catalogEntry } from "@/lib/mcp/tools/catalog";
import type { ToolEffect } from "@/lib/agent-runtime";
import { ASK_INTERNAL_COLLEAGUE_TOOL, LIST_INTERNAL_COLLEAGUES_TOOL } from "@/lib/ai/agents/internal-question-contract";

export interface WorkbenchToolEffect {
  effect: ToolEffect;
  resource: string;
  compensationTool?: string;
}

const OVERRIDES: Record<string, WorkbenchToolEffect> = {
  send_message: { effect: "external", resource: "messages" },
  crm_update_lead: {
    effect: "reversible_write",
    resource: "crm_leads",
    compensationTool: "crm_update_lead",
  },
  crm_send_whatsapp_message: { effect: "external", resource: "messages" },
  crm_start_conversation_and_send: { effect: "external", resource: "conversations" },
  crm_request_human_handoff: { effect: "external", resource: "conversations" },
  [LIST_INTERNAL_COLLEAGUES_TOOL]: { effect: "read", resource: "internal_colleagues" },
  [ASK_INTERNAL_COLLEAGUE_TOOL]: { effect: "external", resource: "internal_questions" },
};

/** 未知工具不授予默认权限，由工作台 Harness 拒绝执行。 */
export function workbenchToolEffect(name: string): WorkbenchToolEffect | null {
  const explicit = OVERRIDES[name];
  if (explicit) return explicit;
  const catalog = catalogEntry(name);
  if (!catalog) return null;
  if (catalog.category === "read") return { effect: "read", resource: catalog.oQueToca };
  if (catalog.category === "handoff") return { effect: "external", resource: catalog.oQueToca };
  // 只有登记了实际业务补偿实现，写操作才可视为可逆；其余写入须人工确认。
  return { effect: "irreversible", resource: catalog.oQueToca };
}
