/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */

/* eslint max-len: ["warn", 120] */

import type {ExtraOptions} from '../index';
import type {CollectFbtOutput} from './collectFbt';
import type {
  CollectorConfig,
  IFbtCollector,
  PackagerPhrase,
} from './FbtCollector';
import type {HashFunction} from './TextPackager';
const {packagerTypes} = require('./collectFbtConstants');
const FbtCollector = require('./FbtCollector');
const PhrasePackager = require('./PhrasePackager');
const TextPackager = require('./TextPackager');
const invariant = require('invariant');
const path = require('path');

function buildCollectFbtOutput(
  fbtCollector: IFbtCollector,
  packagers: $ReadOnlyArray<
    | {|pack: (phrases: Array<PackagerPhrase>) => Array<PackagerPhrase>|}
    | PhrasePackager
    | TextPackager,
  >,
  options: {|
    genFbtNodes: boolean,
    terse: boolean,
  |},
): CollectFbtOutput {
  const output = {
    phrases: packagers
      .reduce(
        (phrases, packager) => packager.pack(phrases),
        fbtCollector.getPhrases(),
      )
      .map(phrase => {
        if (options.terse) {
          const {jsfbt: _, ...phraseWithoutJSFBT} = phrase;
          return phraseWithoutJSFBT;
        }
        return phrase;
      }),
    childParentMappings: fbtCollector.getChildParentMappings(),
  };
  const elementNodes = options.genFbtNodes
    ? {fbtElementNodes: fbtCollector.getFbtElementNodes()}
    : null;
  return {...output, ...elementNodes};
}

function getTextPackager(hashModulePath: string): TextPackager {
  // $FlowExpectedError[unsupported-syntax] Requiring dynamic module
  const hashingModule = (require(hashModulePath):
    | HashFunction
    | {getFbtHash: HashFunction});

  invariant(
    typeof hashingModule === 'function' ||
      (typeof hashingModule === 'object' &&
        typeof hashingModule.getFbtHash === 'function'),
    'Expected hashing module to expose a default value that is a function, ' +
      'or an object with a getFbtHash() function property. Hashing module location: `%s`',
    hashingModule,
  );
  return new TextPackager(
    typeof hashingModule === 'function'
      ? hashingModule
      : hashingModule.getFbtHash,
  );
}

function getPackagers(
  packager: string,
  hashModulePath: string,
): $ReadOnlyArray<
  | {|pack: (phrases: Array<PackagerPhrase>) => Array<PackagerPhrase>|}
  | PhrasePackager
  | TextPackager,
> {
  switch (packager) {
    case packagerTypes.TEXT:
      return [getTextPackager(hashModulePath)];
    case packagerTypes.PHRASE:
      return [new PhrasePackager()];
    case packagerTypes.BOTH:
      return [getTextPackager(hashModulePath), new PhrasePackager()];
    case packagerTypes.NONE:
      return [{pack: phrases => phrases}];
    default:
      throw new Error('Unrecognized packager option');
  }
}

function getFbtCollector(
  collectorConfig: CollectorConfig,
  extraOptions: ExtraOptions,
  customCollectorPath: ?string,
): IFbtCollector {
  if (customCollectorPath == null) {
    return new FbtCollector(collectorConfig, extraOptions);
  }
  const absPath = path.isAbsolute(customCollectorPath)
    ? customCollectorPath
    : path.resolve(process.cwd(), customCollectorPath);

  // $FlowExpectedError[unsupported-syntax] Need to import custom module
  const CustomCollector: Class<IFbtCollector> = require(absPath);
  return new CustomCollector(collectorConfig, extraOptions);
}

module.exports = {
  buildCollectFbtOutput,
  getFbtCollector,
  getPackagers,
};
