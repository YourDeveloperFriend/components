/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Optional,
  Inject,
  InjectionToken,
  NgZone,
  EventEmitter,
  Output,
} from '@angular/core';
import {MDCRadioAdapter, MDCRadioFoundation} from '@material/radio';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ThemePalette, RippleRenderer, RippleTarget} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MatRadioGroup} from './radio-group';

export interface MatRadioDefaultOptions {
  color: ThemePalette;
}

type LabelPosition =  'before' | 'after';

const rippleTarget: RippleTarget = {
  rippleConfig: {
    radius: 20,
    centered: true,
    animation: {
      // TODO(mmalerba): Use the MDC constants once they are exported separately from the
      // foundation. Grabbing them off the foundation prevents the foundation class from being
      // tree-shaken. There is an open PR for this:
      // https://github.com/material-components/material-components-web/pull/4593
      enterDuration: 225 /* MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS */,
      exitDuration: 150 /* MDCRippleFoundation.numbers.FG_DEACTIVATION_MS */,
    },
  },
  rippleDisabled: true
};


export const MAT_RADIO_DEFAULT_OPTIONS =
  new InjectionToken<MatRadioDefaultOptions>('mat-radio-default-options', {
  providedIn: 'root',
  factory: MAT_RADIO_DEFAULT_OPTIONS_FACTORY
});

export function MAT_RADIO_DEFAULT_OPTIONS_FACTORY(): MatRadioDefaultOptions {
  return {
    color: 'accent'
  };
}

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

/** Change event object emitted by MatRadio and MatRadioGroup. */
export class MatRadioChange {
  constructor(
    /** The MatRadioButton that emits the change event. */
    public source: MatRadioButton,
    /** The value of the MatRadioButton. */
    public value: any) {}
}

/**
 * A Material design radio-button. Typically placed inside of `<mat-radio-group>` elements.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  host: {
    'class': 'mat-mdc-radio',
    '[class.mat-primary]': 'color === "primary"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
    '[attr.id]': 'id',
  },
  exportAs: 'matRadioButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioButton implements AfterViewInit, OnDestroy {

  private _uniqueId: string = `mat-radio-${++nextUniqueId}`;

  private _radioAdapter: MDCRadioAdapter = {
    addClass: (className: string) => this._setClass(className, true),
    removeClass: (className: string) => this._setClass(className, false),
    setNativeControlDisabled: (disabled: boolean) => {
      this._disabled = disabled;
      this._changeDetectorRef.markForCheck();
    },
  };

  private _radioFoundation = new MDCRadioFoundation(this._radioAdapter);

  _classes: {[key: string]: boolean} = {};

  /** The unique ID for the radio button. */
  @Input() id: string | null = this._uniqueId;

  /** The value of this radio button. */
  @Input()
  get value(): any { return this._value; }
  set value(value: any) {
    if (this._value === value) {
      return;
    }

    this._value = value;
    if (!this.radioGroup) {
      return;
    }

    this.checked = this.radioGroup.value === value;
  }
  private _value: any;

  private _rippleRenderer: RippleRenderer;

  /** Whether the radio button is checked. */
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(checked: boolean) {
    const newCheckedState = coerceBooleanProperty(checked);
    if (this._checked === newCheckedState) {
      return;
    }

    this._checked = newCheckedState;
    this._updateRadioGroupSelected();
    this._emitChangeEvent();
    this._changeDetectorRef.markForCheck();
  }
  private _checked = false;

  /** Whether the label should appear after or before the radio button. Defaults to 'after' */
  @Input()
  get labelPosition(): LabelPosition {
    return this._labelPosition || (this.radioGroup && this.radioGroup.labelPosition) || 'after';
  }
  set labelPosition(value) {
    this._labelPosition = value;
  }
  private _labelPosition: LabelPosition;

  /** Theme color of the radio button. */
  @Input()
  get color(): ThemePalette {
    return this._color || (this.radioGroup && this.radioGroup.color) ||
      this._providerOverride && this._providerOverride.color || 'accent';
  }
  set color(newValue: ThemePalette) { this._color = newValue; }
  private _color: ThemePalette;

  /** The native HTML name. */
  @Input()
  get name(): string | undefined {
    return this._name || (this.radioGroup && this.radioGroup.name) || '';
  }
  set name(name: string | undefined) {
    this._name = name;
  }
  private _name: string | undefined;


  /** Whether the radio button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._radioFoundation.setDisabled(coerceBooleanProperty(disabled));
  }
  private _disabled = false;

  /** Whether a selected value is required. */
  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(required: boolean) {
    this._required = coerceBooleanProperty(required);
    this._changeDetectorRef.markForCheck();
  }

  private _required = false;

  /** Whether to disable the ripple on this checkbox. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(disableRipple: boolean) {
    this._disableRipple = coerceBooleanProperty(disableRipple);
  }
  private _disableRipple = false;

  /** Used to set the 'aria-label' attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string;

  /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** The 'aria-describedby' attribute is read after the element's label and field type. */
  @Input('aria-describedby') ariaDescribedby: string;

  /**
   * Event emitted when the checked state of this radio button changes.
   * Change events are only emitted when the value changes due to user interaction with
   * the radio button (the same behavior as `<input type-"radio">`).
   */
  @Output() readonly change: EventEmitter<MatRadioChange> = new EventEmitter<MatRadioChange>();

  @ViewChild('radio', {static: false}) _radio: ElementRef<HTMLElement>;
  @ViewChild('label', {static: false}) _label: ElementRef<HTMLElement>;
  @ViewChild('input', {static: false}) _input: ElementRef<HTMLElement>;

  constructor(@Optional() public radioGroup: MatRadioGroup,
    private _changeDetectorRef: ChangeDetectorRef,
    private _platform: Platform,
      private _ngZone: NgZone,
      private _focusMonitor: FocusMonitor,
    @Optional() @Inject(MAT_RADIO_DEFAULT_OPTIONS)
    private _providerOverride?: MatRadioDefaultOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
  }

  /** ID of the native input element inside `<mat-radio-button>` */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  ngAfterViewInit() {
    this._initRipple();
    this._radioFoundation.init();
  }

  _onFocus() {
    if (this.radioGroup) {
      this.radioGroup._touch();
    }
  }

  ngOnDestroy() {
    this._radioFoundation.destroy();
    // this._removeUniqueSelectionListener();
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Marks the radio button as needing checking for change detection.
   * This method is exposed because the parent radio group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When group value changes, the button will not be notified. Use `markForCheck` to explicit
    // update radio button's status
    this._changeDetectorRef.markForCheck();
  }

  /** Initializes the ripple renderer. */
  private _initRipple() {
    this._rippleRenderer =
        new RippleRenderer(rippleTarget, this._ngZone, this._radio, this._platform);
  }

  /** Triggers the checkbox ripple. */
  _activateRipple() {
    if (!this.disabled && !this.disableRipple && this._animationMode != 'NoopAnimations') {
      this._rippleRenderer.fadeInRipple(0, 0, rippleTarget.rippleConfig);
    }
  }

  /** Focuses the radio button. */
  focus(options?: FocusOptions): void {
    this._focusMonitor.focusVia(this._input, 'keyboard', options);
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    this.change.emit(new MatRadioChange(this, this.value));
  }

  _onInputChange(event: Event) {
    this.checked = (event.target as HTMLInputElement)!.checked;
  }

  private _updateRadioGroupSelected() {
    if (!this.radioGroup) {
      return;
    }
    if (this.checked && this.radioGroup.value !== this.value) {
      this.radioGroup.selected = this;
    } else if (!this.checked && this.radioGroup.value === this.value) {
      this.radioGroup.selected = null;
    }
  }
}
