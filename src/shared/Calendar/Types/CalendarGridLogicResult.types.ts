export type CalendarGridLogicResult = {
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
        rows: {
            date: Date
            dateKey: string
            isSelected: boolean
            isInRange: boolean
            holidayName: string | null
            dayDisabled: boolean | undefined
            isCurrentDay: boolean
            buttonClass: string
            dateLabel: string
            rangeMembership: string | undefined
        }[][]
        weekDays: {
            shortName: string
            fullName: string
        }[]
        activeDateKey: string
    }
    handler: {
        handleDayFocus: (date: Date) => void
        handleDayKeyDown: (
            event: import('react').KeyboardEvent<HTMLButtonElement>,
            date: Date,
        ) => void
        handleSelectDate: (date: Date) => void
    }
    refs: {
        gridRef: import('react').RefObject<HTMLDivElement | null>
    }
}
