import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectModel(Workspace.name, 'MisyConnection')
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async sync(userId: string, data: Partial<Workspace>): Promise<Workspace> {
    this.logger.log(`Syncing workspace for user: ${userId}`);
    
    return this.workspaceModel.findOneAndUpdate(
      { userId },
      {
        ...data,
        userId, // Ensure userId is set
        lastSynced: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
  }

  async load(userId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel.findOne({ userId }).exec();
    
    if (!workspace) {
      this.logger.log(`No workspace found for user: ${userId}, returning default empty state.`);
      // Return a default structure without saving it to DB yet, or save and return?
      // Requirement says: "Retornar el documento o un estado inicial vacío si es usuario nuevo."
      // I'll return a default object structure that matches the schema but isn't a document yet, 
      // or simply null if the frontend handles it. 
      // Better to return a clean default object.
      return {
        userId,
        tenantId: '',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        lastSynced: new Date(),
      } as Workspace;
    }

    return workspace;
  }
}
