export interface ToolDefinition {
  name: string; // Ej: "generate_viral_video"
  description: string; // Para que la IA sepa cuándo usarlo
  parameters: any; // Schema JSON
  execute: (params: any, tenantId: string, userId: string, token: string) => Promise<any>; // La llamada a Azure
}
