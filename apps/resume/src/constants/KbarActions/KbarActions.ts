import { IconActionType, socialActions } from 'core/constants';
import { openExternalLink } from 'core/utils';

import { blogUrl, email } from '../../../_config';

function openEmailTo(href: string) {
  Object.assign(document.createElement('a'), { href: `mailto:${href}` }).click();
}

function generateKbarAction() {
  const KbarActions: IconActionType[] = [...socialActions];

  function pushLeftWhenValid(value: string | null, action: IconActionType) {
    if (typeof value !== 'string') return;
    KbarActions.unshift(action);
  }

  pushLeftWhenValid(blogUrl, {
    id: 'blog',
    name: 'Blog',
    subtitle: blogUrl,
    section: 'Social',
    shortcut: [],
    keywords: 'blog, article, post',
    icon: 'Blog',
    perform: () => openExternalLink(blogUrl),
  });

  pushLeftWhenValid(email, {
    id: 'email',
    name: 'Email',
    subtitle: email,
    section: 'Social',
    shortcut: [],
    keywords: 'contact, email, mail',
    icon: 'Email',
    perform: () => openEmailTo(email),
  });

  return KbarActions;
}

export default generateKbarAction;
