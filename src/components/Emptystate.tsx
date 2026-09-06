interface EmptyStateProps {
  text:string
}
export default function EmptyState({ text }:EmptyStateProps) {
  return (
    <p className="text-sm text-[#9AA0AA] py-8 text-center">{text}</p>
  );
  
}