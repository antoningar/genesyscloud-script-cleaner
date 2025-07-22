import * as fs from 'fs';
import { Result, GenesysOAuthConfig } from '../business/models';
import { GenesysService } from '../genesys/genesys.service';

interface Action {
  id: string;
  name: string;
}

interface Variable {
  id: string;
  name: string;
}

interface ScriptStructure {
  customActions: Action[];
  variables: Variable[];
}

export class ScriptService {
  private readonly genesysService: GenesysService;

  constructor(genesysService?: GenesysService){
    this.genesysService = genesysService ?? new GenesysService();
  }

  async process(scriptId?: string, scriptFilePath?: string, config?: GenesysOAuthConfig): Promise<Result[]> {
    const scriptContent = await this.getScriptContent(scriptId, scriptFilePath, config);
    
    const unusedActions = this.findUnusedActions(scriptContent);
    const unusedVariables = this.findUnusedVariables(scriptContent);
    
    return [...unusedActions, ...unusedVariables];
  }

  private async getScriptContent(scriptId?: string, scriptFilePath?: string, config?: GenesysOAuthConfig): Promise<string>{
    if (scriptId != null && scriptId.trim() !== "" && config != null){
      this.genesysService.init(config);
      return this.genesysService.getScript(scriptId!);
    }
    else if (scriptFilePath != null && scriptFilePath.trim() !== ""){
      return fs.readFileSync(scriptFilePath!, 'utf8');
    }
    else {
      return "";
    }
  }

  private findUnusedActions(scriptContent: string): Result[] {
    const scriptData: ScriptStructure = JSON.parse(scriptContent);

    if (!scriptData.customActions || !Array.isArray(scriptData.customActions)) {
      return [];
    }

    const unusedActions = scriptData.customActions.filter((action: Action) => {
      const actionId = action.id;
      const actionRegex = new RegExp(`${actionId}`, 'g');
      const matches = scriptContent.match(actionRegex) || [];
      
      return matches.length === 1;
    });

    return unusedActions.map((action: Action) => ({
      name: action.name,
      type: 'action'
    }));
  }

  private findUnusedVariables(scriptContent: string): Result[] {
    const scriptData: ScriptStructure = JSON.parse(scriptContent);

    if (!scriptData.variables || !Array.isArray(scriptData.variables)) {
      return [];
    }

    const unusedVariables = scriptData.variables.filter((variable: Variable) => {
      const variableId = variable.id;
      const variableRegex = new RegExp(`${variableId}`, 'g');
      const matches = scriptContent.match(variableRegex) || [];
      
      return matches.length === 1;
    });

    return unusedVariables.map((variable: Variable) => ({
      name: variable.name,
      type: 'variable'
    }));
  }
}