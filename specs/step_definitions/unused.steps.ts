import { Given, When, Then } from '@cucumber/cucumber';
import { ScriptService } from '../../src/business/script-service';
import { Result } from '../../src/business/models'
import { strict as assert } from 'assert';
import * as path from 'path';

let scriptService: ScriptService;
let scriptFilePath: string;
let analysisResult: Result[];

Given('a raw script is loaded', function () {
  scriptFilePath = path.join(__dirname, '../../raw/script3.script');
  scriptService = new ScriptService();
});

When('the script service analyzes unused actions', async function () {
  analysisResult = await scriptService.process(undefined, scriptFilePath, undefined);
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

When('the script service analyzes unused variables', async function () {
  analysisResult = await scriptService.process(undefined, scriptFilePath, undefined);
});

Then('the unused variables should be identified', function () {
  assert.ok(analysisResult.length > 0);
  
  const unusedVariable = analysisResult.find((variable) => variable.name === 'unusedString');
  assert.ok(unusedVariable, 'Should contain the unused variable with name unusedString');
  assert.equal(unusedVariable.type, 'variable');
});

When('the script service analyzes subunused actions', async function () {
  analysisResult = await scriptService.process(undefined, scriptFilePath, undefined);
});

Then('the subunused actions should be identified', function () {
  assert.ok(analysisResult.length > 0);
  console.log(analysisResult)
  
  const subUnusedAction = analysisResult.find((action) => action.name === 'UselessAction');
  assert.ok(subUnusedAction, 'Should contain the sub-unused action with name UselessAction');
  assert.equal(subUnusedAction.type, 'action');
});

When('the script service analyzes subunused variables', async function () {
  analysisResult = await scriptService.process(undefined, scriptFilePath, undefined);
});

Then('the subunused variables should be identified', function () {
  assert.ok(analysisResult.length > 0);
  
  const subUnusedBooleanVariable = analysisResult.find((variable) => variable.name === 'uselessBoolean');
  assert.ok(subUnusedBooleanVariable, 'Should contain the sub-unused variable with name uselessBoolean');
  assert.equal(subUnusedBooleanVariable.type, 'variable');
  
  const subUnusedStringVariable = analysisResult.find((variable) => variable.name === 'uselessString');
  assert.ok(subUnusedStringVariable, 'Should contain the sub-unused variable with name uselessString');
  assert.equal(subUnusedStringVariable.type, 'variable');
  
  const subUnusedNumberVariable = analysisResult.find((variable) => variable.name === 'uselessNumber');
  assert.ok(subUnusedNumberVariable, 'Should contain the sub-unused variable with name uselessNumber');
  assert.equal(subUnusedNumberVariable.type, 'variable');
});