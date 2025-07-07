export interface ExamplePort {
  process(data: any): Promise<any>;
}

export class ExampleService implements ExamplePort {
  async process(data: any): Promise<any> {
    // Business logic implementation goes here
    return {
      processed: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  }
}