import { usePlaygroundLogic } from './Hooks/usePlaygroundLogic.ts'
import { CalendarClock } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import { CustomCalendar } from '../../src/shared/Calendar/Components/Calendar.tsx'
import { formatCalendarValue } from '../../src/lib/Calendar/FormatFunctions.ts'
import {
    requiredValidator,
    requiredCalendarValidator,
} from './lib/Form/validation.ts'
import type { FieldErrorProps } from './Types/Playground.types.ts'
// oxlint-disable-next-line import/no-unassigned-import -- Playground CSS entry.
import './index.css'

function FieldError({ errors }: FieldErrorProps) {
    if (errors.length === 0) {
        return null
    }

    return (
        <p className="text-sm font-medium text-red-300">{String(errors[0])}</p>
    )
}

function App() {
    const {
        state: {
            isPopoverWidthTest,
            isReadonlyAxeTest,
            submittedValues,
            calendarMinDate,
            calendarShadowClass,
            calendarWidthUtility,
        },
        handler: {
            handleSubmit,
            handleSetValue,
            handleSetMinimum,
            handleSetLaterMinimum,
            handleToggleShadow,
            handleCycleWidth,
        },
        form,
    } = usePlaygroundLogic()
    return (
        <main className="min-h-screen bg-[#101419] px-6 py-10 text-gray-200">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        TanStack Form + RentnerCalendar
                    </p>
                    <h1 className="text-3xl font-bold tracking-normal text-white">
                        Playground Formular
                    </h1>
                    <p className="max-w-2xl text-sm text-secondary-text">
                        Öfters brauche ich ein Beispiel, das Eingaben,
                        Kalender-Auswahl und Textfläche sauber zusammenführt.
                    </p>
                </header>

                <form
                    className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]"
                    onSubmit={handleSubmit}
                >
                    <section className="grid gap-5 rounded-lg border border-border-dark bg-surface-dark p-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <form.Field
                                name="firstName"
                                validators={{
                                    onSubmit: requiredValidator('Name'),
                                }}
                            >
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="text-[11px] font-bold uppercase tracking-wider text-gray-400"
                                            htmlFor={field.name}
                                        >
                                            Name
                                        </label>
                                        <input
                                            id={field.name}
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Dein Name"
                                            required
                                        />
                                        <FieldError
                                            errors={field.state.meta.errors}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="email"
                                validators={{
                                    onSubmit: requiredValidator('E-Mail'),
                                }}
                            >
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="text-[11px] font-bold uppercase tracking-wider text-gray-400"
                                            htmlFor={field.name}
                                        >
                                            E-Mail
                                        </label>
                                        <input
                                            id={field.name}
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="mail@beispiel.de"
                                            type="email"
                                            required
                                        />
                                        <FieldError
                                            errors={field.state.meta.errors}
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <form.Field
                            name="appointment"
                            validators={{
                                onBlur: requiredCalendarValidator,
                                onSubmit: requiredCalendarValidator,
                            }}
                        >
                            {(field) => (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                            Termin
                                        </span>
                                        <button
                                            type="button"
                                            data-testid="set-calendar-value"
                                            onClick={handleSetValue}
                                            className="rounded px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        >
                                            Extern auf Dez. 2030 setzen
                                        </button>
                                        <button
                                            type="button"
                                            data-testid="set-calendar-min-date"
                                            onClick={handleSetMinimum}
                                            className="rounded px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        >
                                            Min. Datum auf 25. Dez. 2030 setzen
                                        </button>
                                        <button
                                            type="button"
                                            data-testid="set-calendar-min-date-after-view"
                                            onClick={handleSetLaterMinimum}
                                            className="rounded px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        >
                                            Min. Datum auf 1. Feb. 2031 setzen
                                        </button>
                                    </div>
                                    {isPopoverWidthTest && (
                                        <button
                                            type="button"
                                            data-testid="toggle-calendar-shadow-class"
                                            onClick={handleToggleShadow}
                                            className="self-start rounded px-2 py-1 text-[11px] font-bold text-primary"
                                        >
                                            Toggle unrelated shadow class
                                        </button>
                                    )}
                                    {isPopoverWidthTest && (
                                        <button
                                            type="button"
                                            data-testid="cycle-calendar-width-utility"
                                            onClick={handleCycleWidth}
                                            className="self-start rounded px-2 py-1 text-[11px] font-bold text-primary"
                                        >
                                            Cycle typed width utility
                                        </button>
                                    )}
                                    <CustomCalendar
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(value) =>
                                            field.handleChange(value)
                                        }
                                        onBlur={field.handleBlur}
                                        placeholder="Termin auswählen"
                                        required
                                        readOnly={isReadonlyAxeTest}
                                        aria-readonly={
                                            isReadonlyAxeTest
                                                ? 'true'
                                                : undefined
                                        }
                                        enableTime
                                        closeOnSelect
                                        backdrop
                                        button
                                        minDate={calendarMinDate}
                                        showHolidays
                                        switchMode
                                        isDeletable
                                        icon={
                                            <CalendarClock className="h-4 w-4" />
                                        }
                                        className={
                                            isPopoverWidthTest
                                                ? `h-11 rounded-md ${calendarWidthUtility === 'typed' ? 'w-[length:512px]' : calendarWidthUtility === 'responsive' ? 'md:w-[length:512px]' : 'calendar-consumer-wide-trigger'} ${calendarShadowClass ? 'shadow-lg' : ''}`
                                                : 'h-11 w-60 rounded-md'
                                        }
                                    />
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field
                            name="message"
                            validators={{
                                onSubmit: requiredValidator('Nachricht'),
                            }}
                        >
                            {(field) => (
                                <div className="flex flex-col gap-2">
                                    <label
                                        className="text-[11px] font-bold uppercase tracking-wider text-gray-400"
                                        htmlFor={field.name}
                                    >
                                        Nachricht
                                    </label>
                                    <textarea
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Schreibe eine kurze Nachricht"

                                        rows={5}
                                        required
                                        maxLength={280}
                                    />
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Subscribe
                            selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                            ]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <button
                                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-background-dark transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
                                    disabled={!canSubmit || isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting
                                        ? 'Wird gesendet…'
                                        : 'Absenden'}
                                </button>
                            )}
                        </form.Subscribe>
                    </section>

                    <aside className="rounded-lg border border-border-dark bg-surface-dark p-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Submit-Werte
                        </p>
                        <pre className="mt-3 min-h-52 overflow-auto rounded-md border border-border-dark bg-background-dark p-3 text-xs leading-6 text-gray-300">
                            {submittedValues
                                ? JSON.stringify(
                                      {
                                          ...submittedValues,
                                          appointmentLabel: formatCalendarValue(
                                              submittedValues.appointment,
                                          ),
                                      },
                                      null,
                                      2,
                                  )
                                : 'Noch keine Daten abgesendet.'}
                        </pre>
                    </aside>
                </form>
            </div>
        </main>
    )
}

createRoot(document.getElementById('root')!).render(<App />)
