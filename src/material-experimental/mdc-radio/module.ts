/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatRadioButton} from './radio';
import {MatRadioGroup} from './radio-group';

@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [MatRadioButton, MatRadioGroup, MatCommonModule],
  declarations: [MatRadioButton, MatRadioGroup],
})
export class MatRadioModule {
}
