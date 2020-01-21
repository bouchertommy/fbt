/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<287fd66ced3c66877b5518fd0aeaf202>>
 *
 * Generated by LanguageCLDRGenScript
 *
 * @flow strict
 */

'use strict';

const IntlVariations = require('IntlVariations');

const IntlCLDRNumberType21 = {
  getVariation(n /*: number */) /*: $Values<typeof IntlVariations> */ {
    if ((n === 1 || n === 11)) {
      return IntlVariations.NUMBER_ONE;
    } else if ((n === 2 || n === 12)) {
      return IntlVariations.NUMBER_TWO;
    } else if ((n >= 3 && n <= 10 || n >= 13 && n <= 19)) {
      return IntlVariations.NUMBER_FEW;
    } else {
      return IntlVariations.NUMBER_OTHER;
    }
  }
};

module.exports = IntlCLDRNumberType21;