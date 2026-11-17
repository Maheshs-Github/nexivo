import { prisma } from "../lib/prisma.js";
import { SETTINGS_GROUPS, settingsSchemas, type SettingsGroup } from "../schemas/settings.js";

type SettingsMap = { [K in SettingsGroup]: Record<string, unknown> };

/** Returns every settings group, each parsed through its schema so missing keys get safe defaults. */
export async function getAllSettings(): Promise<SettingsMap> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: SETTINGS_GROUPS } } });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as SettingsMap;
  for (const group of SETTINGS_GROUPS) {
    const parsed = settingsSchemas[group].safeParse(byKey.get(group) ?? {});
    out[group] = parsed.success ? parsed.data : ((byKey.get(group) as Record<string, unknown>) ?? {});
  }
  return out;
}

export async function updateSettingsGroup(group: SettingsGroup, value: Record<string, unknown>) {
  const data = settingsSchemas[group].parse(value);
  await prisma.siteSetting.upsert({ where: { key: group }, update: { value: data }, create: { key: group, value: data } });
  return data;
}
