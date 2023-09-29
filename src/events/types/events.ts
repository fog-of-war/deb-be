export interface ServerToClientEvents {
  message: (payload: any) => void;
  notification: (payload: any) => void;
  activity: (payload: any) => void;
}
