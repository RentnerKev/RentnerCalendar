export type CalendarSerializationFormat = 'date' | 'datetime'

export interface SerializeCalendarValueOptions {
    format?: CalendarSerializationFormat
}

export type SerializedCalendarRange = [string | null, string | null]
export type SerializedSingleCalendarValue = string | undefined
export type SerializedRangeCalendarValue = SerializedCalendarRange | undefined
export type SerializedCalendarValue =
    | SerializedSingleCalendarValue
    | SerializedRangeCalendarValue
