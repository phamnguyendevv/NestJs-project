export interface TaskData {
  id?: number;
  title: string;
  descriptionText: string;
  descriptionImage: string[];
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  projectId: number;
  project?: any;
  user?: any;
}
export interface TaskRO {
  data: TaskData;
  message: string;
  statusCode: number;
}
