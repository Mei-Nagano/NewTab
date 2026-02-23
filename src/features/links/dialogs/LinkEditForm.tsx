import { SiteIcon } from '@/components/common/SiteIcon';

interface LinkEditFormProps {
  title: string;
  url: string;
  icon: string;
  mutedClass: string;
  inputClass: string;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onIconChange: (value: string) => void;
}

export const LinkEditForm: React.FC<LinkEditFormProps> = ({
  title,
  url,
  icon,
  mutedClass,
  inputClass,
  onTitleChange,
  onUrlChange,
  onIconChange,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 500 * 1024) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      onIconChange(String(readerEvent.target?.result || ''));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <SiteIcon url={url} title={title} customIcon={icon} size="w-12 h-12" className="rounded-xl" />
        </div>
        <div className="flex-1 space-y-2">
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
          {icon && (
            <button
              onClick={() => onIconChange('')}
              className={`w-full px-3 py-1.5 text-xs ${mutedClass} hover:text-red-400 transition-colors`}
            >
              清除自定义图标
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={`text-sm font-medium ${mutedClass}`}>标题</label>
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${inputClass}`}
          placeholder="网站标题"
        />
      </div>

      <div className="space-y-1.5">
        <label className={`text-sm font-medium ${mutedClass}`}>URL</label>
        <input
          type="text"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${inputClass}`}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};
