import { Request } from 'express';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';

export interface AuthenticatedRequest extends Request {
  member: Member;
  workspace: Workspace;
}
