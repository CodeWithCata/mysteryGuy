import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// 1. A consistent wrapper for any setting row (Switch or Select)
export const SettingRow = ({ label, description, children, className }: any) => (
  <div className={cn("flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-700 transition-colors hover:border-indigo-500/50", className)}>
    <div className="space-y-1">
      <Label className="font-bold text-white cursor-pointer">{label}</Label>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
    {children}
  </div>
);

// 2. A consistent Slider group with a label and value display
export const SliderSetting = ({ label, min, max, step, defaultValue, suffix = "", className }: any) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex justify-between items-end">
      <Label className="text-slate-200 font-semibold uppercase tracking-wider text-xs">{label}</Label>
      <span className="text-indigo-400 font-black text-sm">{defaultValue}{suffix}</span>
    </div>
    <Slider defaultValue={[defaultValue]} min={min} max={max} step={step} className="py-2" />
    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
      <span>{min}{suffix}</span>
      <span>{max}{suffix}</span>
    </div>
  </div>
);

// 3. The small timer input boxes
export const TimerInput = ({ label, defaultValue }: any) => (
  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 space-y-1 group focus-within:border-indigo-500 transition-all">
    <Label className="text-[10px] uppercase text-slate-500 font-bold group-focus-within:text-indigo-400">{label} (s)</Label>
    <input 
      type="number" 
      defaultValue={defaultValue} 
      className="w-full bg-transparent border-none p-0 text-lg font-black text-white focus:ring-0 outline-none" 
    />
  </div>
);