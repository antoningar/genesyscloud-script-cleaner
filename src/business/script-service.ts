import * as fs from 'fs';

export interface Result {
  name: string;
  type: string;
}

interface Action {
  id: string;
  name: string;
}

interface ScriptStructure {
  customActions: Action[];
  variables: unknown[];
}

export class ScriptService {
  async process(scriptFilePath: string): Promise<Result[]> {
    const scriptContent = fs.readFileSync(scriptFilePath, 'utf8');
    
    return this.findUnusedActions(scriptContent);
  }

  private findUnusedActions(scriptContent: string): Result[] {
    const scriptData: ScriptStructure = JSON.parse(scriptContent);

    if (!scriptData.customActions || !Array.isArray(scriptData.customActions)) {
      return [];
    }

    const unusedActions = scriptData.customActions.filter((action: Action) => {
      const actionId = action.id;
      const actionRegex = new RegExp(`"${actionId}"`, 'g');
      const matches = scriptContent.match(actionRegex) || [];
      
      return matches.length === 1;
    });

    return unusedActions.map((action: Action) => ({
      name: action.name,
      type: 'action'
    }));
  }
}