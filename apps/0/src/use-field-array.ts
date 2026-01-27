import type { ArrayPath, FieldValues, UseFieldArrayReturn, UseFormReturn } from 'react-hook-form'

import { useFieldArray as useFa } from 'react-hook-form'

const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>
>(
  form: UseFormReturn<TFieldValues>,
  name: TFieldArrayName
): UseFieldArrayReturn<TFieldValues, TFieldArrayName> => {
  const { append, ...fieldArray } = useFa({ control: form.control, name }),
    validatedAppend: typeof append = (value, options) => {
      ;(async () => {
        const isValid = await form.trigger()
        if (isValid) append(value, options)
      })()
    }
  return {
    ...fieldArray,
    append: validatedAppend
  }
}

export default useFieldArray
