export interface UpdateInfo {
    hasUpdate: boolean;
    latestVersion: string;
    releaseUrl: string;
    releaseNotes?: string;
    error?: string;
}

declare var chrome: any;

// TODO: Replace with actual repository details
export const GITHUB_OWNER = 'Mei-Nagano';
export const GITHUB_REPO = 'NewTab';

export const checkUpdate = async (currentVersion: string, forceRefresh: boolean = false): Promise<UpdateInfo> => {
    // Check cache first (skip if force refresh)
    const CACHE_KEY = 'newtab_update_check_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!forceRefresh) {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;

                // Use cache if less than 5 minutes old
                if (age < CACHE_DURATION) {
                    console.log('Using cached update info');
                    return data;
                }
            }
        } catch (e) {
            // Ignore cache errors
            console.warn('Failed to read update cache:', e);
        }
    }

    // Directly fetch the GitHub releases page HTML
    const RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(RELEASES_URL, {
            headers: {
                'Accept': 'text/html',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`请求失败 (${response.status})`);
        }

        const html = await response.text();

        // Parse the HTML to extract the latest version
        // Look for the first release tag in the format: /releases/tag/vX.X.X
        const tagMatch = html.match(/\/releases\/tag\/(v?[\d.]+)/);

        if (!tagMatch) {
            throw new Error('未找到发布版本信息。');
        }

        const latestVersion = tagMatch[1].replace(/^v/, '');

        // Extract release notes from the HTML
        // Look for the release body content - it's typically in a div with class "markdown-body"
        let releaseNotes = '';
        try {
            // Try to find the release notes in the HTML
            // The pattern looks for content between release header and the next release or end
            const releasePattern = new RegExp(
                `<div[^>]*class="[^"]*markdown-body[^"]*"[^>]*>([\\s\\S]*?)<\/div>`,
                'i'
            );
            const notesMatch = html.match(releasePattern);

            if (notesMatch && notesMatch[1]) {
                // Clean up HTML tags and convert to plain text
                releaseNotes = notesMatch[1]
                    .replace(/<[^>]+>/g, '') // Remove HTML tags
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/\r\n/g, '\n')
                    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
                    .trim();
            }
        } catch (e) {
            console.warn('Failed to extract release notes:', e);
        }

        // Simple version comparison
        const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

        const result: UpdateInfo = {
            hasUpdate,
            latestVersion,
            releaseUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/v${latestVersion}`,
            releaseNotes: releaseNotes || undefined
        };

        // Cache the successful result
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: result,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to cache update info:', e);
        }

        return result;
    } catch (error: any) {
        console.error('Check update failed:', error);

        // Handle timeout error
        if (error.name === 'AbortError') {
            return {
                hasUpdate: false,
                latestVersion: '',
                releaseUrl: '',
                error: '请求超时，请检查网络连接。'
            };
        }

        return {
            hasUpdate: false,
            latestVersion: '',
            releaseUrl: '',
            error: error.message || '未知错误'
        };
    }
};

// Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }

    return 0;
}
