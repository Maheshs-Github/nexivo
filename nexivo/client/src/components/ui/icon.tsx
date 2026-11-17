import {
  Award, Bot, Brain, Briefcase, Building2, Cloud, Code, Compass, Cpu, Database, Eye, Gauge, Globe, GraduationCap, Handshake,
  HeartPulse, Laptop, Layers, Leaf, Lightbulb, Lock, Palette, PenTool, Rocket, Server, ShieldCheck, Smartphone, Sparkles,
  Target, Users, Workflow, Zap, type LucideIcon, type LucideProps,
} from "lucide-react";

/** Curated icon set editors can pick from (kept small so the public bundle stays light). */
export const ICONS: Record<string, LucideIcon> = {
  code: Code, smartphone: Smartphone, cloud: Cloud, sparkles: Sparkles, "pen-tool": PenTool, "shield-check": ShieldCheck,
  eye: Eye, gauge: Gauge, users: Users, leaf: Leaf, laptop: Laptop, "graduation-cap": GraduationCap, "heart-pulse": HeartPulse,
  rocket: Rocket, award: Award, bot: Bot, brain: Brain, briefcase: Briefcase, building: Building2, compass: Compass, cpu: Cpu,
  database: Database, globe: Globe, handshake: Handshake, layers: Layers, lightbulb: Lightbulb, lock: Lock, palette: Palette,
  server: Server, target: Target, workflow: Workflow, zap: Zap,
};
export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, ...props }: { name?: string | null } & LucideProps) {
  const Cmp = (name && ICONS[name]) || Sparkles;
  return <Cmp aria-hidden="true" {...props} />;
}
