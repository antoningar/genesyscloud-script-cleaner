import { Given, When, Then } from '@cucumber/cucumber';
import { ScriptService, Result } from '../../src/business/script-service';
import { strict as assert } from 'assert';
import * as path from 'path';

let scriptService: ScriptService;
let scriptFilePath: string;
let analysisResult: Result[];

Given('a raw script is loaded', function () {
  scriptFilePath = path.join(__dirname, '../../raw/script.script');
  scriptService = new ScriptService();
});

When('the script service analyzes unused actions', async function () {
  analysisResult = await scriptService.process(scriptFilePath);
  console.log(analysisResult);
});

Then('the analysis should complete successfully', function () {
  assert.ok(analysisResult);
});

Then('the unused actions should be identified', function () {
  assert.ok(analysisResult.length > 0);
  
  const unusedAction = analysisResult.find((action) => action.name === 'UnusedLoad');
  assert.ok(unusedAction, 'Should contain the unused action with name UnusedLoad');
  assert.equal(unusedAction.type, 'action');
});