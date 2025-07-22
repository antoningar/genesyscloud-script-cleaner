import { ApiClientClass, ApiClient, PureCloudRegionHosts, ScriptsApi } from 'purecloud-platform-client-v2';
import { GenesysOAuthConfig } from '../business/models';

export class GenesysService {
  client: ApiClientClass = ApiClient.instance;
  api: ScriptsApi = new ScriptsApi();

  constructor() {
    this.setLogger();
  }
  
  async init(oauthConfig: GenesysOAuthConfig) {
    this.client.setEnvironment(PureCloudRegionHosts[oauthConfig.gc_aws_region]);
    await this.client.loginClientCredentialsGrant(oauthConfig.gc_client_id, oauthConfig.gc_client_secret);
  }

  async getScript(id: string): Promise<string> {
    return JSON.stringify(await this.api.getScript(id));
  }

  setLogger() {
    this.client.config.logger.log_level =
      this.client.config.logger.logLevelEnum.level.LTrace;
    this.client.config.logger.log_format =
      this.client.config.logger.logFormatEnum.formats.LTrace;
    this.client.config.logger.log_request_body = true;
    this.client.config.logger.log_response_body = true;
    this.client.config.logger.log_to_console = true;

    this.client.config.logger.setLogger();
  }
}