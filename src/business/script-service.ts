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
    const scriptData: ScriptStructure = JSON.parse(scriptContent);
    
    const unusedActionIds = this.getUnusedActionIds(scriptContent, scriptData);
    const unusedActions = this.findUnusedActions(scriptContent, scriptData, unusedActionIds);
    const unusedVariables = this.findUnusedVariables(scriptContent, scriptData, unusedActionIds);
    
    return [...unusedActions, ...unusedVariables];
  }

  private async getScriptContent(scriptId?: string, scriptFilePath?: string, config?: GenesysOAuthConfig): Promise<string>{
    if (scriptId != null && scriptId.trim() !== "" && config != null){
      await this.genesysService.init(config);
      return await this.genesysService.getScript(scriptId!);
    }
    else if (scriptFilePath != null && scriptFilePath.trim() !== ""){
      return fs.readFileSync(scriptFilePath!, 'utf8');
    }
    else {
      return "";
    }
  }

  private getUnusedActionIds(scriptContent: string, scriptData: ScriptStructure): Set<string> {
    if (!scriptData.customActions || !Array.isArray(scriptData.customActions)) {
      return new Set();
    }

    return new Set(
      scriptData.customActions
        .filter(action => {
          const matches = scriptContent.match(new RegExp(action.id, 'g')) || [];
          return matches.length === 1;
        })
        .map(action => action.id)
    );
  }

  private findUnusedActions(scriptContent: string, scriptData: ScriptStructure, unusedActionIds: Set<string>): Result[] {
    if (!scriptData.customActions || !Array.isArray(scriptData.customActions)) {
      return [];
    }

    return scriptData.customActions
      .filter(action => {
        if (unusedActionIds.has(action.id)) {
          return true;
        }
        
        return this.isSubUnusedAction(action, scriptContent, unusedActionIds);
      })
      .map(action => ({ name: action.name, type: 'action' as const }));
  }

  private isSubUnusedAction(action: Action, scriptContent: string, unusedActionIds: Set<string>): boolean {
    const matches = [...scriptContent.matchAll(new RegExp(action.id, 'g'))];
    
    if (matches.length <= 1) return false;

    let definitionFound = false;
    let validUsages = 0;
    
    for (const match of matches) {
      const context = scriptContent.substring(Math.max(0, match.index! - 1000), match.index! + 1000);
      
      if (this.isDefinition(context, action)) {
        definitionFound = true;
        continue;
      }
      
      if (this.isUsedInUnusedAction(context, action.id, scriptContent, unusedActionIds, match.index!)) {
        validUsages++;
      } else {
        return false;
      }
    }
    
    return definitionFound && validUsages > 0;
  }

  private isDefinition(context: string, element: Action | Variable): boolean {
    return context.includes(`"id":"${element.id}"`) && context.includes(`"name":"${element.name}"`);
  }

  private isUsedInUnusedAction(context: string, elementId: string, scriptContent: string, unusedActionIds: Set<string>, matchIndex: number): boolean {
    const isActionNameUsage = context.includes(`"actionName":"${elementId}"`);
    
    if (isActionNameUsage) {
      return [...unusedActionIds].some(unusedId => {
        const expandedContext = scriptContent.substring(Math.max(0, matchIndex - 1000), matchIndex + 1000);
        return expandedContext.includes(`"id":"${unusedId}"`);
      });
    }
    
    return [...unusedActionIds].some(unusedId => context.includes(`"id":"${unusedId}"`));
  }

  private findUnusedVariables(scriptContent: string, scriptData: ScriptStructure, unusedActionIds: Set<string>): Result[] {
    if (!scriptData.variables || !Array.isArray(scriptData.variables)) {
      return [];
    }

    return scriptData.variables
      .filter(variable => {
        const matches = scriptContent.match(new RegExp(variable.id, 'g')) || [];
        
        if (matches.length === 1) {
          return true;
        }
        
        return this.isSubUnusedVariable(variable, scriptContent, scriptData, unusedActionIds);
      })
      .map(variable => ({ name: variable.name, type: 'variable' as const }));
  }

  private isSubUnusedVariable(variable: Variable, scriptContent: string, scriptData: ScriptStructure, unusedActionIds: Set<string>): boolean {
    const matches = [...scriptContent.matchAll(new RegExp(variable.id, 'g'))];
    
    if (matches.length <= 1) return false;

    let definitionFound = false;
    let validUsages = 0;
    
    for (const match of matches) {
      const context = scriptContent.substring(Math.max(0, match.index! - 1000), match.index! + 1000);
      
      if (this.isDefinition(context, variable)) {
        definitionFound = true;
        continue;
      }
      
      const isInUnusedAction = this.isUsedInUnusedAction(context, variable.id, scriptContent, unusedActionIds, match.index!);
      const isInUnusedVariable = this.isUsedInUnusedVariable(context, variable, scriptContent, scriptData);
      
      if (isInUnusedAction || isInUnusedVariable) {
        validUsages++;
      } else {
        return false;
      }
    }
    
    return definitionFound && validUsages > 0;
  }

  private isUsedInUnusedVariable(context: string, variable: Variable, scriptContent: string, scriptData: ScriptStructure): boolean {
    return scriptData.variables.some(v => {
      if (v.id === variable.id) return false;
      const vMatches = scriptContent.match(new RegExp(v.id, 'g')) || [];
      return vMatches.length === 1 && context.includes(`"id":"${v.id}"`);
    });
  }
}