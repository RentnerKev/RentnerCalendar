export function composedParent(node: Node): Element | null {
    if (node.parentElement) return node.parentElement
    const root = node.getRootNode()
    return root.nodeType === 11 && 'host' in root
        ? (root as ShadowRoot).host
        : null
}

export function fixedCalendarOrigin(positioner: HTMLElement) {
    const view = positioner.ownerDocument.defaultView!
    let parent = composedParent(positioner)
    while (parent) {
        const style = view.getComputedStyle(parent)
        if (
            style.transform !== 'none' ||
            [style.translate, style.scale, style.rotate].some(
                (value) => Boolean(value) && value !== 'none',
            ) ||
            style.perspective !== 'none' ||
            style.filter !== 'none' ||
            (Boolean(style.backdropFilter) &&
                style.backdropFilter !== 'none') ||
            style.contentVisibility === 'auto' ||
            /paint|layout|strict|content/.test(style.contain) ||
            /transform|translate|scale|rotate|perspective|filter/.test(
                style.willChange,
            )
        ) {
            const rect = parent.getBoundingClientRect()
            const element = parent as HTMLElement
            // A portal root containing only fixed children can have zero size.
            // Its rendered popup still exposes the inherited transform scale.
            const positionerRect = positioner.getBoundingClientRect()
            const scaleX = element.offsetWidth
                ? rect.width / element.offsetWidth
                : positioner.offsetWidth
                  ? positionerRect.width / positioner.offsetWidth
                  : 1
            const scaleY = element.offsetHeight
                ? rect.height / element.offsetHeight
                : positioner.offsetHeight
                  ? positionerRect.height / positioner.offsetHeight
                  : scaleX
            return {
                x:
                    rect.left +
                    element.clientLeft * scaleX -
                    element.scrollLeft * scaleX,
                y:
                    rect.top +
                    element.clientTop * scaleY -
                    element.scrollTop * scaleY,
                scaleX: scaleX || 1,
                scaleY: scaleY || 1,
                height: element.clientHeight,
            }
        }
        parent = composedParent(parent)
    }
    return { x: 0, y: 0, scaleX: 1, scaleY: 1, height: view.innerHeight }
}
