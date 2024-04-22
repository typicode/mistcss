const noChildrenTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    ])

export const canTagHaveChildren(tag: string): boolean => !noChildrenTags.has(tag);
