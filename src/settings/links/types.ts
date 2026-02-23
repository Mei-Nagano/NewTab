import type { Link } from '@/types';

export type GroupAction = 'add' | 'delete' | 'rename' | 'select';

export interface LinkFormState {
  title: string;
  url: string;
  icon: string;
}

export interface SelectionState {
  selectedLinkIds: Set<string>;
}

export interface ActiveGroupView {
  id: string;
  title: string;
  links: Link[];
}
