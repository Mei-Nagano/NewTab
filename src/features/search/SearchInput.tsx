interface SearchInputProps {
  query: string;
  placeholder: string;
  inputClass: string;
  buttonClass: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  placeholder,
  inputClass,
  buttonClass,
  onQueryChange,
  onFocus,
  onBlur,
}) => {
  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`flex-1 h-full bg-transparent border-none outline-none text-lg transition-colors duration-300 pt-0.5 ${inputClass}`}
      />
      <button
        type="submit"
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${buttonClass}`}
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </>
  );
};
