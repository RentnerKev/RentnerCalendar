const CONTAIN_REGEX = /paint|layout|strict|content/
const WILL_CHANGE_REGEX = /transform|translate|scale|rotate|perspective|filter/

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
            (style.translate && style.translate !== 'none') ||
            (style.scale && style.scale !== 'none') ||
            (style.rotate && style.rotate !== 'none') ||
            style.perspective !== 'none' ||
            style.filter !== 'none' ||
            (style.backdropFilter && style.backdropFilter !== 'none') ||
            style.contentVisibility === 'auto' ||
            CONTAIN_REGEX.test(style.contain) ||
            WILL_CHANGE_REGEX.test(style.willChange)
        ) {
            const rect = parent.getBoundingClientRect()
            const element = parent as HTMLElement
            // A portal root containing only fixed children can have zero size.
            // Its rendered popup still exposes the inherited transform scale.
            const needPositionerRect =
                (!element.offsetWidth && Boolean(positioner.offsetWidth)) ||
                (!element.offsetHeight && Boolean(positioner.offsetHeight))
            const positionerRect = needPositionerRect
                ? positioner.getBoundingClientRect()
                : null
            const scaleX = element.offsetWidth
                ? rect.width / element.offsetWidth
                : positionerRect
                  ? positionerRect.width / positioner.offsetWidth
                  : 1
            const scaleY = element.offsetHeight
                ? rect.height / element.offsetHeight
                : positionerRect && positioner.offsetHeight
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
