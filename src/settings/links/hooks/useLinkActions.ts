import type { AppSettings, Link } from '@/types';
import { buildLinkDedupKeySet, normalizeLinkUrl, toLinkDedupKey } from '@/shared/utils';
import type { LinkFormState } from '../types';

interface UseLinkActionsParams {
  settings: AppSettings;
  activeGroupId: string;
  isAllGroupSelected: boolean;
  onSettingsChange: (settings: AppSettings) => void;
}

export type SaveLinkResult = 'saved' | 'invalid' | 'duplicate';

export const useLinkActions = ({
  settings,
  activeGroupId,
  isAllGroupSelected,
  onSettingsChange,
}: UseLinkActionsParams) => {
  const saveLink = (form: LinkFormState, editingLinkId: string | null): SaveLinkResult => {
    if (isAllGroupSelected || !form.title.trim() || !form.url.trim()) return 'invalid';

    const normalizedUrl = normalizeLinkUrl(form.url);
    const dedupKey = toLinkDedupKey(normalizedUrl);
    if (!dedupKey) return 'invalid';

    const existingDedupKeys = buildLinkDedupKeySet(settings.groups, editingLinkId || undefined);
    if (existingDedupKeys.has(dedupKey)) return 'duplicate';

    const linkPayload: Link = {
      id: editingLinkId || Date.now().toString(),
      title: form.title.trim(),
      url: normalizedUrl,
      icon: form.icon || undefined,
    };

    onSettingsChange({
      ...settings,
      groups: settings.groups.map((group) => {
        if (group.id !== activeGroupId) return group;
        const links = editingLinkId
          ? group.links.map((link) => (link.id === editingLinkId ? linkPayload : link))
          : [...group.links, linkPayload];
        return { ...group, links };
      }),
    });

    return 'saved';
  };

  const removeLink = (linkId: string) => {
    if (isAllGroupSelected) return;
    onSettingsChange({
      ...settings,
      groups: settings.groups.map((group) =>
        group.id === activeGroupId
          ? { ...group, links: group.links.filter((link) => link.id !== linkId) }
          : group
      ),
    });
  };

  const removeLinks = (linkIds: Set<string>) => {
    if (isAllGroupSelected || linkIds.size === 0) return;
    onSettingsChange({
      ...settings,
      groups: settings.groups.map((group) =>
        group.id === activeGroupId
          ? { ...group, links: group.links.filter((link) => !linkIds.has(link.id)) }
          : group
      ),
    });
  };

  return {
    saveLink,
    removeLink,
    removeLinks,
  };
};
