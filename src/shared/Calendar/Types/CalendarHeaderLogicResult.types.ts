export type CalendarHeaderLogicResult = {
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
        currentMonth: number
        currentYear: number
        monthOptions: FastEditOption[]
        yearOptions: FastEditOption[]
    }
    handler: {
        handleMonthChange: (value: string) => void
        handleYearChange: (value: string) => void
    }
}
import type { FastEditOption } from './CalendarHeader.types.js'
