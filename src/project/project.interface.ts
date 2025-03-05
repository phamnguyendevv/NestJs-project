export interface ProjectData {
  id?: number;
  name: string;
  description: string;
  status: string;
  project_key: string;
  startdate_at: Date;
  userIds?: number[];
  created_at: Date;
}
export interface ProjectRO {
  data: ProjectData;
  message: string;
  statusCode: number;
}

export interface ProjectDecoratorOptions {
  field?: keyof ProjectData;
  roles?: string[];
}
