import { Given, When, Then } from '@cucumber/cucumber';
import { ScriptService } from '../../src/business/script-service';
import { GenesysService } from '../../src/genesys/genesys.service';
import { GenesysOAuthConfig, Result } from '../../src/business/models';
import { strict as assert } from 'assert';

let scriptService: ScriptService;
let mockGenesysService: GenesysService;
let scriptId: string;
let oauthConfig: GenesysOAuthConfig;
let analysisResult: Result[];
let getScriptCalled: boolean;
let getScriptCalledWith: string | undefined;

class MockGenesysService extends GenesysService {
  async init(): Promise<void> {
    // Mock implementation - do nothing
  }

  async getScript(id: string): Promise<string> {
    getScriptCalled = true;
    getScriptCalledWith = id;
    
    return JSON.stringify({
      customActions: [
        { id: 'action-1', name: 'UsedAction' },
        { id: 'action-2', name: 'UnusedAction' }
      ],
      variables: [
        { id: 'var-1', name: 'usedVariable' },
        { id: 'var-2', name: 'unusedVariable' }
      ]
    });
  }
}

Given('A script id', function () {
  scriptId = 'test-script-id-123';
  
  // Reset tracking variables
  getScriptCalled = false;
  getScriptCalledWith = undefined;
  
  // Create a mock GenesysService
  mockGenesysService = new MockGenesysService();
  
  // Create ScriptService with mocked GenesysService
  scriptService = new ScriptService(mockGenesysService);
  
  // Mock OAuth config
  oauthConfig = {
    gc_client_id: 'test-client-id',
    gc_client_secret: 'test-client-secret',
    gc_aws_region: 'us-east-1'
  };
});

When('function is called with a script id as input', async function () {
  analysisResult = await scriptService.process(scriptId, undefined, oauthConfig);
});

Then('function is retrieving the script thanks to genesys', function () {
  // Verify that the GenesysService.getScript was called with the correct script ID
  assert.ok(getScriptCalled, 'GenesysService.getScript should be called');
  assert.equal(getScriptCalledWith, scriptId, `GenesysService.getScript should be called with script ID: ${scriptId}`);
  
  // Verify that the analysis result is returned
  assert.ok(analysisResult, 'Analysis result should be returned');
  assert.ok(Array.isArray(analysisResult), 'Analysis result should be an array');
});