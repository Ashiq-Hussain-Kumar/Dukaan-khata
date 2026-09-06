import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon:LucideIcon,
  label:string,
  value: string,
  tone:"indigo" | "green" | "rose" 
}

interface toneInside{
  bg:string,
  text:string
}
type Tones = Record<"indigo" | "green" | "rose",toneInside>

function StatCard({label, icon:Icon, value, tone}:StatCardProps) {
  const tones:Tones = {
    indigo: { bg: "bg-[#EEF0FF]", text: "text-[#4F46E5]" },
    green: { bg: "bg-[#EBFBEF]", text: "text-[#16A34A]" },
    rose: { bg: "bg-[#FFEEF1]", text: "text-[#E11D48]" },
  };
  const t = tones[tone];
  return(
    <div className="bg-white rounded-2xl p-5  border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className={`w-9 h-9 ${t.bg} ${t.text} rounded-lg flex items-center justify-center mb-4`}>
        <Icon size={17} strokeWidth={2.4}/>
      </div>
      
      <p className="text-xs font-medium text-[#8A8F98] mb-1">{label}</p>
      <p  className="text-[22px] font-semibold text-[#111827] tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  )
}

export default StatCard;