type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "메뉴명·재료 검색 (예: 우유, 시럽, 라떼)" }: SearchBarProps) {
  return (
    <label className="relative block w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mammoth-sub">🔎</span>
      <input
        className="w-full rounded-2xl border border-mammoth-line bg-white py-3 pl-11 pr-4 text-sm text-mammoth-ink outline-none transition focus:border-mammoth-brand focus:ring-2 focus:ring-mammoth-brand/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
