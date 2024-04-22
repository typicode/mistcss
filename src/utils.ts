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

export function canTagHaveChildren(tag: string): boolean {
    return !noChildrenTags.has(tag);
}
