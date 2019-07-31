/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MatRadioButton} from '@angular/material-experimental/mdc-radio';

@Component({
  moduleId: module.id,
  selector: 'mdc-radio-demo',
  templateUrl: 'mdc-radio-demo.html',
  styleUrls: ['mdc-radio-demo.css'],
})
export class MdcRadioDemo {
  isAlignEnd: boolean = false;
  isDisabled: boolean = false;
  isRequired: boolean = false;
  name: string = 'buttonname';
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];

  @ViewChild('focusableRadio', {static: false}) focusableRadio: MatRadioButton;

  focus() {
    this.focusableRadio.focus();
  }

}
