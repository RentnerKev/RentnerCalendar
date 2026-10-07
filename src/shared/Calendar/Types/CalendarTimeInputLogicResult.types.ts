export type CalendarTimeInputLogicResult = {
    state: {
        cd: {
            primaryColor: string
            primaryColorFocusWithin: string
            primaryBg: string
            primaryHover: string
            primaryBorder: string
            primaryFocusBorder: string
            primaryRing: string
            primaryBgSubtle: string
            surfaceBackground: string
            inputBackground: string
            borderColor: string
            borderTransparent: string
            textColor: string
            textMuted: string
            textMutedDark: string
            textDisabled: string
            textDay: string
            textBackground: string
            hoverBackground: string
            hoverText: string
            hoverTextMuted: string
        }
        messages: import('../../../lib/Calendar/messages.js').CalendarMessages
        rangeValue: null[] | import('../../../types.js').CalendarRange
        singleDate: Date | null
        enableRange: boolean | undefined
        minTime: string | undefined
        maxTime: string | undefined
        disabled: boolean
        readOnly: boolean
    }
    handler: {
        handleUpdate: (index: 0 | 1, newDate: Date) => void
    }
}
