import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {forwardRef, Directive} from '@angular/core';
// import {RadioValue} from './radio';


type RadioValue = any;

/**
 * Provider Expression that allows mat-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 * @docs-private
 */
export const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatRadioGroup),
  multi: true
};

/**
 * A group of radio buttons. May contain one or more `<mat-radio-button>` elements.
 */
@Directive({
  selector: 'mat-radio-group',
  exportAs: 'matRadioGroup',
  providers: [MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
  host: {
    'role': 'radiogroup',
    'class': 'mat-radio-group',
  },
})
export class MatRadioGroup implements ControlValueAccessor {
  /** The underlying value of the radio group. */
  value: RadioValue;
  isDisabled = false;

  /** The method to be called in order to update ngModel */
  _controlValueAccessorChangeFn: (value: RadioValue) => void = () => {};

  /**
   * onTouch function registered via registerOnTouch (ControlValueAccessor).
   * @docs-private
   */
  onTouched: () => any = () => {};

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(value: RadioValue) {
    this.value = value;
  }

  /**
   * Registers a callback to be triggered when the model value changes.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: (value: RadioValue) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the control is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the control should be disabled.
   */
  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}