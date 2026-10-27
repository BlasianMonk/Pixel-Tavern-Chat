import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanName, cleanMessage, cleanRoom, cleanPosition} from '../src/shared.js';
test('names strip markup and control characters',()=>assert.equal(cleanName('<Mage>\n'), 'Mage'));
test('messages are bounded',()=>assert.equal(cleanMessage('x'.repeat(500)).length,400));
test('invalid rooms fall back to tavern',()=>assert.equal(cleanRoom('secret'),'tavern'));
test('positions stay within map',()=>assert.deepEqual(cleanPosition({x:-1,y:9999}),{x:24,y:590}));
