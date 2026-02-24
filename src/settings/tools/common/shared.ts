export const getCommonStyles = (theme: 'light' | 'dark') => {
    return {
        sectionTitleClass: `flex items-center gap-2 px-1 mb-4`,
        sectionDotClass: `w-1 h-4 rounded-full`,
        sectionHeadingClass: `text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`,
        cardClass: `p-5 rounded-2xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100' : 'bg-white/5 border-white/5'}`,
        textareaClass: `w-full p-4 rounded-2xl border text-sm font-mono outline-none transition-all resize-none shadow-sm custom-scrollbar ${theme === 'light' 
            ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-500' 
            : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white placeholder-gray-600'}`,
        buttonClass: `px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${theme === 'light'
            ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'}`,
        primaryButtonClass: `px-6 py-2.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95`,
    };
};

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};
